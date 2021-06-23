const mongoose = require("mongoose");
const path = require("path");
const express = require('express')
const multer  = require('multer')
const cors = require('cors');
const {storage} = require("./configs/cloudinaryConfig") 
const upload = multer({storage})
require('dotenv').config() 
const auth = require("./middleware/auth") 

//executing Express
const app = express();

//contorollers
const itemController = require("./controllers/item.controller")
const userController = require("./controllers/users.controller")

//Connecting to Mongo DB
const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl,{
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
app.post("/new", auth.isSignedIn ,upload.array("images", 5), itemController.new);
app.get("/all", itemController.all)
app.get("/search:query" ,itemController.search)
app.get("/filter/:typeOfQuery/:query" ,itemController.filter)
app.get("/show:id", itemController.show)
app.post("/delete", auth.isSignedIn, upload.none(), itemController.delete);


// user routes

app.post("/register",upload.none(), userController.registerUser)
app.post("/signin",upload.none(),userController.signinUser )
app.post("/signout",upload.none(),userController.signoutUser )
app.post("/user", auth.isSignedIn, upload.none(),userController.getUserProfile )
app.post("/user/edit",auth.isSignedIn,upload.none(),userController.editUserProfile )
app.post("/user/resetPassword",upload.none(),userController.resetPassword )
app.post("/user/sendVerificationMessageResetPassword",upload.none(),userController.sendVerificationMessageReset)
app.post("/user/sendVerificationMessageDeleteAccount",auth.isSignedIn,upload.none(),userController.sendVerificationMessageDelete)
app.post("/user/deleteProfile",auth.isSignedIn, upload.none(), userController.deleteProfile)


if(process.env.NODE_ENV !== "production"){
    app.use(express.static(path.join(__dirname, 'client/build')))

    app.get('*', (req, res) =>{
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
    })
}

let port

if (process.env.NODE_ENV === "production"){
    port = process.env.PORT
} else {
    port = 3001
}


//Turning on listening for incoming request on specified port
app.listen(port, ()=>{
    console.log("-------GROI API listening on port 3001-------");
});