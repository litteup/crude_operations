const mongoose = require('mongoose');

//create shopitems schema
const shopItemsSchema  =  new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    
    isInStock: {
        type: Boolean,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"

    }

}, {timestamps: true});

// made a shop items model
const shopItemsCollection = mongoose.model("shopItems",shopItemsSchema);


module.exports = {
    shopItemsCollection
}