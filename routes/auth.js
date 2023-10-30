const express = require('express');
const router = express.Router();
const {userCollection} = require('../schema/userSchema');
const bcrypt = require('bcrypt');
const jwt =  require('jsonwebtoken');
const { taskCollection } = require('../schema/taskSchema');
const { isUserLoggedIn } = require('./middlewares');
require('dotenv').config();
const {send} = require("../utilities/sendEmail");
const{v4: uuidv4} = require('uuid');
const {forgetPasswordCollection} = require("../schema/forgetPassword");
const joi = require('joi');


router.post('/register', async(req, res) =>{

    const registerValidationSchema = joi.object({
        fullname: joi.string().required(),
        email: joi.string().email().required(),
        role: joi.string(),
        password: joi.string().min(6).required()
    });

    const {error: registerValidationError} = registerValidationSchema.validate(req.body);

    if(registerValidationError) return res.send(registerValidationError);

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password,salt);
    await userCollection.create({
        fullname: req.body.fullname,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
    });

    res.status(201).send("User created successful");
});

// Creating a login authentication route

router.post("/login", async (req, res) =>{

    const {email, password} = req.body;

    const loginValidationSchema = joi.object({
        email: joi.string().email().required(),
        password : joi.string().required().min(6).max(30)
    });

    const {error: validationError} = loginValidationSchema.validate({email, password});

    if (validationError) return res.send(validationError);

    const userDetail = await userCollection.findOne({email});

    if(!userDetail) return res.status(404).send("user-not-found");

    const doesPasswordMatch = bcrypt.compareSync(password, userDetail.password);

    if(!doesPasswordMatch) return res.status(400).send("Invalid credential");

    const {email: userEmail, _id, role} = userDetail;

    const token = jwt.sign({
        email: userEmail,
        userId: _id,
        role: role,
    },process.env.SECRET);

    res.send({
        message: "Sign in Successful",
        token
    });

});


// Send Reset password mail

router.post("/forget-password", async(req, res)=>{
    try {

        const {email} = req.body;

        const emailValidation = joi.string().email().required().messages({
            "string.email": "Email is not valid",
            "any.required": "'email' field is required."
        });

        await emailValidation.validateAsync(email);

        const user = await userCollection.findOne({email});

        if(!user) return res.status(404).send("no-user-found");

        const uid = uuidv4();

        await forgetPasswordCollection.create({
            userId: user._id,
            token: uid
        });
        
        // nodemailer.sendMail({
        //     from: "passwordReset@mail.com",
        //     to: email,
        //     subject: "Password Reset",
        //     html: `<div>
        //                 <h1>Password Reset</h1>
        //                 <div>Click <a href="">here<a> to reset your password</div>
        //                 <div>or use this UID ${uid}</div>

        //           </div>`
        // });

        const mailOptions = {
            from: "passwordReset@mail.com",
            to: email,
            subject: "Password Reset",
            html: `<div>
                        <h1>Password Reset</h1>
                        <div>Click <a href="">here<a> to reset your password</div>
                        <div>or use this UID:  ${uid}</div>

                  </div>`
        };

        send.sendMail(mailOptions, (err, result) =>{
            if(err){
                console.log(err);
                res.json('Error occurred sending reset mail.');
            }else{
                res.json("Reset email sent successfully.");
            }
        });



    } catch (error) {
        console.log(error);
        res.status(error.status || 500).send(error.message || "Internal server error");

    }

});

// Controller to reset the password

router.put("/password-reset", async(req, res)=>{
    
    try {

        const {newPassword, token} = req.body;

        
        const user = await forgetPasswordCollection.findOne({token});
        
               
        if(!user) return res.status(400).send("Invalid-token");

        const newHashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

        
        await userCollection.findByIdAndUpdate(user.userId,{
            password: newHashedPassword
            
        });
        

        await forgetPasswordCollection.findOneAndDelete({token});

        res.send({
            message: "Password changed successfully"
        });
        console.log("Password changed successfully.");


        
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).send(error.message || "Internal server error");


    }
});










// router to get all users and it is open to all, just for testing purposes and not part of the program 

router.get("/users", async(req,res) =>{
    const users = await userCollection.find();
    res.status(401).send(users);
});

// route to edit user role

router.patch("/updateUserRole/:name", async(req,res)=>{
    const updatedUser = await userCollection.findOneAndUpdate({fullname: req.body.fullname}, {
        fullname: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    }, {new: true});
    res.status(201).json({
        message: "Details updated successfully",
        updatedUser
    });
});

router.get("/profile", isUserLoggedIn, async(req,res)=>{
    try {

        const {userId} = req.decoded;

        let user = await userCollection.findById(userId, "fullName email");
        // "fullName email" (any property in the " " separated by space
        //in the above will display whatever properties user can see 
        // Alternatively, anything you put after a minus would be 
        //excluded while every other things would be included
        //"- password " would exclude password.

        res.send(user);
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).send("internal-server-error");
        
    }
});

module.exports = router;