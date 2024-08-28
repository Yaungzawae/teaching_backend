const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: String,
    start_time: String,
    end_time: String,
    price: Number,
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    student: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
    isBooked: {type: Boolean, default: false}
})

const Session = mongoose.model("session", sessionSchema);

module.exports = Session;  