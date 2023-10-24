const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: "public/"});
const {taskCollection} = require('../schema/taskSchema');
const {isUserLoggedIn, adminsOnly} = require('./middlewares');



// middleware

router.use(isUserLoggedIn);


// Handling uploading a single picture

router.post("/pic", upload.single("file"), async(req,res)=>{

   try {

    const {taskTitle, taskBody} = req.body;
    const {originalname} = req.file;

    const newTask = await taskCollection.create({
        taskTitle,
        taskBody,
        pictureName: originalname
    });

    res.send({
        Sucessful: true,
        newTask
    });

    
   } catch (error) {
    console.log(`Error encountered while uploading picture.\nError: ${error}`)
   }
});












module.exports = router;