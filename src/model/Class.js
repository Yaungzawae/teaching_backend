const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    title: String,
    description: String,
    start_date: Date,
    price: Number,
    schedule: [
        {
            day: String, // day of the week
            start_time: String,
            end_time: String
        }
    ],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    students: [
        {type: mongoose.Schema.Types.ObjectId, ref: "user"}
    ],
    max_seat: Number,
    booked_seat : {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: "booking"
    },
    recurring: Boolean,
    text_book: String
})

const Class = mongoose.model("class", classSchema);

module.exports = Class; 