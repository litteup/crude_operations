const express = require('express');
const env = require('dotenv').config();
const mongoose = require('mongoose');
const taskRoute = require('./routes/tasks');
const authRoute = require('./routes/auth');



const app = express();
const port = process.env.PORT || 5000;


// middleware

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/v1/tasks", taskRoute);
app.use("/v1/auth",authRoute);


//connect to mongodb

const connect = mongoose.connect(process.env.mongodbURI);

connect.then((req, res) =>{
    console.log("Connected to Mongodb.");
}).catch((error) =>{
    console.log("Unable to connect to Mongodb, error:",error);
});


app.listen(port,(req, res) =>{
    console.log("Server running on port: ", port);
});

