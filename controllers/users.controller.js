const User = require("../models/user.schema")
const Item = require("../models/item.schema")
const bcrypt = require('bcrypt');
const JWT = require("../utils/JWT")
const sendEmail = require("../utils/googleapi.config")
const resetPassword = require("../utils/resetPassword")

const redis = require('redis');

//Connecting to Redis
const redisClient = redis.createClient(
    process.env.REDIS_URI,
);

redisClient.on("error", console.error.bind(console, "redis connection error:"));

module.exports.redisClient = redisClient


module.exports.registerUser = async (req, res) =>{
    try{
        const existingUser = await User.find({username: req.body.username})
        if (existingUser.length !== 0){
            res.status(200).json({
                sucess: false,
                msg: "This username is already occupied."
            })
        } else {
            const newUser = new User(req.body)
            newUser.password = bcrypt.hashSync(req.body.password, 12);
            newUser.activated = false;
            newUser.verificationCode = Math.floor(Math.random()*100000000)
            await newUser.save()
            const token = JWT.createSession(newUser, redisClient);
    
            res.status(200).json({
                success: true,
                token: token
            })
        }
    } catch (err){
        console.log(err)
        res.status(500).json({
            success: false,
            error: err
        })
    }
}


module.exports.signinUser = async (req, res) =>{
   try {
        const {username, password} = req.body
        let user = await User.find({username: username})
        user = user[0]
        if(user){   
            if (bcrypt.compareSync(password, user.password)){
                user.password = undefined
                const token = JWT.createSession(user, redisClient)
                res.status(200).json({
                    result:{
                        success: true,
                        token: token
                    }
                })
            } else {
                res.status(401).json({
                    result:{
                        success:false,
                        msg: "Incorect username or password",
                        data: []
                    }
                })
            }
        } else{
            res.status(401).json({
                result:{
                    success:false,
                    msg: "Incorect username or password",
                    data: []
                }
            })
        }
    } catch (err){
        res.status(500).json({
            err: err
        })
    }
}


module.exports.signoutUser = async (req, res) =>{
    const {authorization} = req.headers
    try{
        if(redisClient.del(authorization) >0){
            res.status(200).json({
                result:{
                    success: true,
                }
            })
        }
    } catch (err){
        res.status(500).json({
            err: err
        })
    }
}


module.exports.getUserProfile = async (req, res) =>{
    try{
        const {authorization} = req.headers
        redisClient.get(authorization, async (err, rep) =>{
            const userId = rep
            if(userId){
                const userData = await User.findById(userId)
                res.status(200).json({
                    result:{
                        success: true,
                        data: userData
                    }
                })
            } else{
                res.status(401).json({
                    result:{
                        success: false,
                        data: []
                    }
                })
            }
        })
    } catch (err){
        res.status(500).json({
            err: err
        })
    }
}


module.exports.editUserProfile = async (req, res) =>{
    try {
        console.log(req.body)
        const existingUser = await User.find({username: req.body.username})
        console.log(existingUser)
        console.log(req.id)
        if (existingUser.length !== 0) {
                if (existingUser[0]._id.toString() !== req.id){
                return res.status(200).json({
                    sucess: false,
                    msg: "This username is already occupied."
                })
            }
        }
        const userData = await User.findById(req.id)
        userData.username = req.body.username
        userData.email = req.body.email
        userData.phone = req.body.phone
        await userData.save()

        return res.status(200).json({
            success: true,
            data: userData,
            message: "Your profile was successfuly updated"
        })
    } catch (err){
        res.status(500).json({
            err: err.message
        })
    }
}


module.exports.resetPassword = async (req, res) =>{
    try {
        const {authorization} = req.headers
        if (authorization !== "null" && authorization !== "undefined" ){
            redisClient.get(authorization, async (err, rep) =>{
                const userProfile = await User.findById(rep)
                if (userProfile){
                    resetPassword.resetPassword(
                        userProfile.verificationCode,
                        parseInt(req.body.validationCode),
                        userProfile,
                        req.body.password,
                        res
                    )
                }
            })
        } else if (req.body.username){
            let userProfile = await User.find({username: req.body.username})
            if (userProfile.length > 0){
                userProfile = userProfile[0]
                resetPassword.resetPassword(
                    userProfile.verificationCode,
                    parseInt(req.body.validationCode),
                    userProfile,
                    req.body.password,
                    res
                )
            }
        } else {
            res.status(200).json({
                success: true,
                message: ""
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


module.exports.sendVerificationMessageReset = async (req, res) =>{
   try {
        const {authorization} = req.headers
        if (authorization !== "null" && authorization !== "undefined" ){
            redisClient.get(authorization, async (err, rep) =>{
                if (!rep){
                    return res.status(200).json({
                        success: true,
                        message: ""
                    })
                }
                const userProfile = await User.findById(rep)
                const text = `Hello,\nthere's your verification code\n\n ${userProfile.verificationCode}\n\n If you weren't trying to reset password just ignore this message.\n\nBest regards, \nGROI team. `
                sendEmail.sendEmail(userProfile.email, text, "Password reset." )

                return res.status(200).json({
                    success: true,
                    message: ""
                })
            })
        } else if (req.body.username){
            let userProfile = await User.find({username: req.body.username})
            if (userProfile.length > 0){
                userProfile = userProfile[0]
                const text = `Hello,\nthere's your verification code\n\n ${userProfile.verificationCode}\n\n If you weren't trying to reset password just ignore this message.\n\nBest regards, \nGROI team. `
                sendEmail.sendEmail(userProfile.email, text, "Password reset." )
            }
            return res.status(200).json({
                success: true,
                message: ""
            })
        } else {
            return res.status(200).json({
                success: true,
                message: ""
            })
    }} catch (err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


module.exports.sendVerificationMessageDelete = async (req, res) =>{
    try {
        const userProfile = await User.findById(req.id)
        const text = `Hello,\nthere's your verification code\n\n ${userProfile.verificationCode}\n\n If you weren't trying to delete your account just ignore this message.\n\nBest regards, \nGROI team. `
        sendEmail.sendEmail(userProfile.email, text, "Account deletion." )

        res.status(200).json({
            success: true,
            message: ""
        })
    } catch (err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


module.exports.deleteProfile = async (req, res) => {
    try{
        const userProfile = await User.findById(req.id)
        if (req.body.verificationCode == userProfile.verificationCode ){
            await Item.deleteMany({seller: req.id})
            await User.deleteOne({_id: req.id})
            redisClient.del(req.headers.authorization, (err, rep) =>{ 
                return res.status(200).json({
                    success: true,
                    message: "Your account was succesfully deleted"
                })
            })
        } else {
            return res.status(200).json({
                success: true,
                message: ""
            })
        }
    } catch (err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

