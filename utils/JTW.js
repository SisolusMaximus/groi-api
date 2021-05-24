const jwt = require('jsonwebtoken');

const signJWT = (userId) =>{
    const jwtPayload = {userId}
    return jwt.sign(jwtPayload, process.env.JWT_SECRET, {expiresIn: "7 days"});
}

module.exports.createSession = (user) =>{
    
    const {_id, activated} = user;
    const token = signJWT(_id)

    return {
        token: token,
        data: {
            userId: _id,
            activated: activated
        }
    }
}