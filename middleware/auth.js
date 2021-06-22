const redisClient = require("../controllers/users.controller").redisClient

module.exports.isSignedIn = async (req, res , next) =>{
    const {authorization} = req.headers
    if (!authorization){
        return res.status(401).json({
            result:{
            success:false,
            msg: "Unauthorised",
            data: []
        }})
    }

    redisClient.get(authorization, (err, rep) =>{
        req.id = rep;
        return next()
    })
} 