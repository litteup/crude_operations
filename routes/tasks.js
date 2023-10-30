const express = require('express');
const route = express.Router();
const {taskCollection} = require('../schema/taskSchema');
const {isUserLoggedIn, adminsOnly} = require('./middlewares');
const jwt = require('jsonwebtoken');
const { userCollection } = require('../schema/userSchema');


route.use(isUserLoggedIn);

route.get('/',async(req,res) =>{
    const tasks = await taskCollection.find({user: req.decoded.userId});
    res.json(tasks)
});

route.post('/', async(req,res) =>{

    const {taskTitle, taskBody} = req.body;
    const {userId} = req.decoded;

    const newTask = await taskCollection.create({
        taskTitle,
        taskBody, 
        user: userId
    }); 
    res.json({
        isRequestSuccessful: true,
        newTask
    });
});

// To get tasks for a user

route.get("/user-task/:page?/:limit?", async(req, res)=>{
    const userTask = await taskCollection.paginate({user: req.decoded.userId}, {page: req.params.page || 1, limit: req.params.limit || 5});

    res.send(userTask);

}); 

route.get("/id/:id", async(req,res) => {
    try {
        const task = await taskCollection.findById(req.params.id);

        if (!task){
         return res.status(201).send("No task found for the ID");
        }
    

    res.send(task);
} catch (error) {
    console.log(`Error: ${error}`);
        
}
});
    

route.get("/by-task-title/:title", async(req, res) =>{
    const task =  await taskCollection.findOne({taskTitle: req.params.title});
    
    if (!task){
        return res.status(404).send("not-found");
    }
    res.send(task);
});

// update by id

route.patch("/:id", async(req,res) =>{

    const {id} = req.params;
    const {taskBody} = req.body;

    updatedTask = await taskCollection.findByIdAndUpdate(id,{
        taskBody
    }, {new: true});
    res.json({
        message: "Task updated successfully.",
    updatedTask});
});

// to delete

route.delete("/delete/:id", async(req,res) =>{
    try {
        
         const {id} = req.params;

         const note = await userCollection.findById (id);

        if (req.decoded.userId != note.user){
            return res.status(401).send("You are not allowed to delete this task");
    }
    
        await taskCollection.findByIdAndDelete(id);
        res.send("Task has been deleted successfully.");
    } catch (error) {
        console.log(`Error: ${error}`)
    }
});

route.get("/admin/all-tasks/:page?/:limit?", adminsOnly, async(req,res)=>{
    const tasks =  await taskCollection.paginate({},{page:req.params.page || 1, limit: req.params.limit || 4});
    res.send(tasks);
});



module.exports = route;