const mongoose = require('mongoose');

//Steps to creating a schema
// 1. create a schema
// 2. create a model
// 3. export the model


//1. Creating a schema

const taskSchema = new mongoose.Schema({
    taskTitle:{
        type: String,
        required: true
    },
    taskBody: {
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
    
}, {timestamps: true});



//creating a model

const taskCollection = mongoose.model("tasks",taskSchema);



//exporting the model

module.exports = {
    taskCollection
};