const express = require('express');
const route = express.Router();
const {shopItemsCollection} = require('../schemas/shopItemsSchema');
const jwt = require('jsonwebtoken');
const { userCollection } = require('../schemas/userSchema');
const {isUserLoggedIn, adminsOnly} = require('./middleware');
const router = require('./authRoute');
require('dotenv').config();



// getting the list of all items in the shop

route.get("/", async(req,res) =>{
    const itemsInShop = await shopItemsCollection.find();

    if (!itemsInShop){
        return res.status(404).send("No item found.");
    }
    res.json(itemsInShop);
});

// get an item with item id

route.get("/use-id/:id", async(req, res) =>{
    const getItemInShopById = await shopItemsCollection.findById(req.params.id);
    
    if(!getItemInShopById){
        return res.status(404).send("No item with the id found.");
    }
    res.json(getItemInShopById);
});



// route.use(isUserLoggedIn);
route.use(adminsOnly);

// adding items to the shop

route.post("/", async(req, res) =>{
    const newShopItem = await shopItemsCollection.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        isInStock: req.body.isInStock,
    });

    res.json({
        isRequestSuccessful: true,
        message: "Item added to shop successful",
        newShopItem
    });
});


// Edit an item
route.patch("/edit-id/:id", async(req, res) =>{
    await shopItemsCollection.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        price: req.body.price

    }, {new: true});

    res.send("Item updated successfully.")
});

// Delete item

route.delete("/remove-id/:id", async(req,res) =>{
    try {
        const deletedItem = await shopItemsCollection.findByIdAndDelete(req.params.id);


    res.send("Item deleted successfully.");
        
    } catch (error) {
        
        res.send("Item with the ID not found.");
        
    }
});


// route to find all shop items irrespective of role

route.get("/users", adminsOnly, async(req,res) =>{
    const users = await userCollection.find();
    res.send(users);
});





module.exports = route;
module.exports.isUserLoggedIn = isUserLoggedIn;