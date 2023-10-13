const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const shopItemsRoute = require('./routes/shopItemsRoute');
const authRoute = require('./routes/authRoute');
const {shopItemsCollection} = require('./schemas/shopItemsSchema');
const {isUserLoggedIn,adminsOnly} = require('./routes/middleware');

const app = express()
const port = process.env.PORT || 8000

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use("/auth", authRoute);
app.use("/", shopItemsRoute);
app.use(isUserLoggedIn);
app.use(adminsOnly);

//connecting to database

const connect = mongoose.connect(process.env.mongoDBURL);

connect.then((req,res) =>{
    console.log("Connected to database.");
}).catch((error) =>{
    console.log("Unable to connect to database, error:", error);
});



app.listen(port, (req,res) =>{
    console.log(`Server running on port: ${port}.`)
});