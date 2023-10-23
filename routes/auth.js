const express = require('express');
const router = express.Router();
const {userCollection} = require('../schema/userSchema');
const bcrypt = require('bcrypt');
const jwt =  require('jsonwebtoken');
const { taskCollection } = require('../schema/taskSchema');
const { isUserLoggedIn } = require('./middlewares');
const env = require('dotenv').config();


router.post('/register', async(req, res) =>{
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