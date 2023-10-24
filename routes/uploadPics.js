const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: "public/"});
const {taskCollection} = require('../schema/taskSchema');
const {isUserLoggedIn, adminsOnly} = require('./middlewares');
const cloudinary = require('cloudinary').v2;
const path  = require('path');


// import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'dk0e4vcxx', 
  api_key: '726553471632846', 
  api_secret: 'YZFj-z77iLq8M9XFH9XLw32RwaA' ,
  //secure : true
});


// middleware

router.use(isUserLoggedIn);


// Handling uploading a single picture

router.post("/pic", upload.single("taskPicture"), async(req,res)=>{

   try {

    const {taskTitle, taskBody} = req.body;
    const {filename} = req.file;
    const {userId} = req.decoded;

   
    const cloudinaryUpload = await cloudinary.uploader.upload( "public/" + filename, {
        folder: "task-picture"
    });
    console.log(cloudinaryUpload);
   

    const newTask = await taskCollection.create({
        taskTitle,
        taskBody,
        pictureName: cloudinaryUpload.secure_url,
        user: userId
    });

    res.send({
        Sucessful: true,
        newTask,
        fileDetails: req.file
    });

    
   } catch (error) {
    console.log(`Error encountered while uploading picture.\nError: ${error}`)
   }
});












module.exports = router;