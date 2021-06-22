const jwt = require('jsonwebtoken');

const signJWT = (userId) =>{
    const jwtPayload = {userId}
    return jwt.sign(jwtPayload, process.env.JWT_SECRET, {expiresIn: "7 days"});
}

const setToken = async (token, id, redisClient)=>{
    return await redisClient.set(token, id.toString())
} 

module.exports.createSession = (user, redisClient) =>{
    
    const {_id} = user;
    const token = signJWT(_id)

    if (setToken(token, _id, redisClient)){
        return token
    }
}