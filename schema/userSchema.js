const mongoose = require('mongoose');



// create the schema

const userSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true 
    }, 
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        enum:["user","admin"],
        default: "user"
    }
}, {timestamps: true});


// create model
const userCollection = mongoose.model("users", userSchema);


module.exports = {
    userCollection
};