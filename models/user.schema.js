const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: String,
    email: String,
    phone: Number,
    password: String,
    activated: Boolean
})

module.exports = mongoose.model('User', UserSchema);