const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    username:{
        type: Schema.Types.String,
        required: true
    },
    email:{
        type: Schema.Types.String,
        required: true
    },
    phone:{
        type: Schema.Types.Number,
        required: true
    },
    password:{
        type: Schema.Types.String,
        required: true
    },
    activated: Boolean,
    verificationCode: Number   
})

module.exports = mongoose.model('User', UserSchema);