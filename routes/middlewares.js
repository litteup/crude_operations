const express = require('express');
const route = express.Router();
require('dotenv').config();
const jwt = require('jsonwebtoken');




// a function that logs users out
function isUserLoggedIn(req, res, next){
    const authorizationHeader = req.headers.authorization;

    if(!authorizationHeader) return res.status(401).send("no-authorization-header");

    const value = authorizationHeader.split(" ");

    const tokenType = value[0];
    const tokenValue = value[1];

    if(tokenType == "Bearer"){
        const decoded = jwt.verify(tokenValue, process.env.SECRET);
        req.decoded = decoded;
        next();
        return;
    }

};

//function for admins only

function adminsOnly(req,res,next){
    if(req.decoded.role =="admin"){
        next();
    }else{
        res.status(401).send("You are not an admin");
    }
};




module.exports = {
    isUserLoggedIn,
    adminsOnly
}