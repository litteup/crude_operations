const mongoose = require('mongoose');

// user schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    userName: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum:["user", "admin"],
        default: "user"
    }

}, {timestamps: true});

const userCollection =  mongoose.model("users", userSchema);


module.exports = {
    userCollection
};