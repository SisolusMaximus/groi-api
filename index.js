const mongoose = require("mongoose");
const path = require("path");
const express = require('express')
const multer  = require('multer')
const cors = require('cors');
const {storage} = require("./configs/cloudinaryConfig") 
const upload = multer({storage})
require('dotenv').config() 



//contorollers
const itemController = require("./controllers/item.controller")
const userController = require("./controllers/users.controller")

//executing Express
const app = express();

//Connecting to Mongo DB
mongoose.connect("mongodb://localhost:27017/groi-api",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify: false
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("-------------database connected--------------");
});

app.use(cors());

//Parsing a req.body
app.use(express.urlencoded({extended:true}));

// item routes
app.post("/new", upload.array("images", 5), itemController.new);
app.get("/all", itemController.all)
app.get("/search:query" ,itemController.search)
app.get("/filter/:typeOfQuery/:query" ,itemController.filter)
app.get("/show:id", itemController.show)


// user routes

app.post("/register",upload.none(), userController.registerUser)
app.post("/signin",upload.none(),userController.signinUser  )



//Turning on listening for incoming request on specified port
app.listen(3001, ()=>{
    console.log("-------GROI API listening on port 3001-------");
});