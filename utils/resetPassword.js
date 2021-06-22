const bcrypt = require('bcrypt');

module.exports.resetPassword = async (code1, code2, userProfile, newPassword, res) =>{
    if (code1 === code2){
        userProfile.password = bcrypt.hashSync(newPassword, 12);
        userProfile.verificationCode = Math.floor(Math.random()*100000000)

        await userProfile.save()

        res.status(200).json({
            success: true,
            message: "Password reseted successfully."
        })
    } else (
        res.status(200).json({
            success: true,
            message: ""
        })
    )
}