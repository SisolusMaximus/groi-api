'use strict';

const {google} = require("googleapis")
require('dotenv').config() 

const nodemailer  = require('nodemailer')


const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
)

oAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN})


const sendEmail = async(email, text, subject) => {
    const access_token = await oAuth2Client.getAccessToken()
    const auth = {
        type: "OAuth2",
        user: "groi.team.24@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: access_token.token
    }

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: auth
    })

    const mailOptions = {
        from: "GROI TEAM <groi.team.24@gmail.com>",
        to: email,
        subject: subject,
        text: text
    };

    const result = await transport.sendMail(mailOptions)
    return result


}


module.exports.sendEmail = sendEmail;