// server.js
const express = require('express');
const mongoose =require('mongoose');
const cors = require('cors')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "babysecret"; 
// 🔐 JWT Verify Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token missing" });

    const token = authHeader.split(" ")[1]; // remove "Bearer"
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // You can use this in protected routes if needed
        next(); // go to the next route handler
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};



const app = express();
app.use(express.json())
app.use(cors())

/mongoose.connect('mongodb+srv://anushree:root@cluster0.kcxyhyk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('DB Connected!')
})
.catch((err) => {
  console.log('DB Connection Error:', err)
})

.catch((err)=>{
    console.log(err)
})
//creating schema
const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String
});
const userModel = mongoose.model('User', userSchema);

const todoSchema = new mongoose.Schema({
    title:{
        required:true,
        type:String

    },
    description:String 
})
//creating model
const todoModel = mongoose.model('Todo',todoSchema);

app.post('/todos', verifyToken, async (req, res) => {

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
app.get('/todos', verifyToken, async (req, res) => {
    try {
        const allTodos = await todoModel.find(); 
        res.json(allTodos);                      
    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message});
    }
})
//update a todo item
app.put("/todos/:id", verifyToken, async(req,res) => {
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
app.delete('/todos/:id', verifyToken, async (req,res) => {
    
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
// Signup Route
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Signup successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(port)
   
