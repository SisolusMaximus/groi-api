//Models
const User = require("../models/user.schema")
const bcrypt = require('bcrypt');
const JWT = require("../utils/JTW")




module.exports.registerUser = async (req, res) =>{
    try{
        const newUser = new User(req.body)
        newUser.password = bcrypt.hashSync(req.body.password, 12);
        newUser.activated = false;
        await newUser.save()
        const session = JWT.createSession(newUser);

        res.status(200).json({
            sucess: true,
            session
        })
    } catch (err){
        console.log(err)
        res.status(500).json({
            sucess: false,
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
                const token = JWT.createSession(user)
                res.status(200).json({
                    result:{
                        success: true,
                        data: user,
                        token: token.token
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