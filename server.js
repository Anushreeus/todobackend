// server.js
const express = require('express');
const mongoose =require('mongoose');
const cors = require('cors')

const app = express();
app.use(express.json())
app.use(cors())

// let todos = [];
//connecting mongodb
mongoose.connect('mongodb+srv://anushree:root@cluster0.kcxhyhk.mongodb.net/mern-app')
.then(() =>{
    console.log('DB Connected!')
})
.catch((err)=>{
    console.log(err)
})
//creating schema
const todoSchema = new mongoose.Schema({
    title:{
        required:true,
        type:String

    },
    description:String 
})
//creating model
const todoModel = mongoose.model('Todo',todoSchema);

app.post('/todos', async (req, res) => {
    const { title, description } = req.body;

    // const newTodo = {
    //     id: todos.length + 1,
    //     title,
    //     description
    // };

    // todos.push(newTodo);
    // console.log("Current Todos:", todos);
    try{
        const newTodo = new todoModel({title,description});
        await newTodo.save();
        res.status(201).json(newTodo);
    }catch (error){
        console.log(error)
        res.status(500).json({messsage: error.message});
    }
   
    
});
//Get all items
app.get('/todos', async (req, res) => {
    try {
        const allTodos = await todoModel.find(); 
        res.json(allTodos);                      
    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message});
    }
})
//update a todo item
app.put("/todos/:id", async(req,res) =>{
    try{
        const { title, description } = req.body;
    const id = req.params.id;
    const updatedTodo = await todoModel.findByIdAndUpdate(
        id,
        {title,description},
        { new:true}
    )
    if(!updatedTodo){
        return res.status(404).json({message: "Todo not found "})
    }
    res.json(updatedTodo)
    }catch(error){
        console.log(error);
        res.status(500).json({message:error.message});
    }
    
})
//delete a todo item
app.delete('/todos/:id',async (req,res) => {
    
    try {
        const id = req.params.id;
        await todoModel.findByIdAndDelete(id);
        res.status(204).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message});
    }
    
})

port=8000
app.listen(port)
   
