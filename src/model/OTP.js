const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: String,
    otp:{
        type: Number,
        default: null
    }
})

const Otp = mongoose.model("otps", otpSchema);

module.exports = Otp;