const express = require('express');
const route = express.Router();
const {userCollection} = require('../schemas/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();
const {isUserLoggedIn} = require('./middleware');

// creating / registering users

route.post("/register", async(req,res) =>{
    const salt = bcrypt.genSaltSync(10);
    const hashedPassowrd = bcrypt.hashSync(req.body.password, salt);
    await userCollection.create({
        fullName: req.body.fullName,
        userName: req.body.userName,
        password : hashedPassowrd,
        role: req.body.role
    });
    res.status(201).send("User created successfully");
});

// Login users

route.post("/login", async (req, res) =>{
    const userDetail = await userCollection.findOne({userName: req.body.userName});


    if (!userDetail){
        return res.status(404).send("User-not-found.")
    };

    const doesPasswordMatch = bcrypt.compareSync(req.body.password, userDetail.password);

    if (!doesPasswordMatch) return res.status(400).send("Invalid credentials.");

    const token = jwt.sign({
        fullName:userDetail.fullName,
        userName: userDetail.userName,
        role: userDetail.role
    }, process.env.SECRET);

    res.send({
        message: `${req.body.userName} logged in.`,
        token,
    });
});


// route.use(isUserLoggedIn);



module.exports = route;
