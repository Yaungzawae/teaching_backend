const mongoose = require("mongoose");
const mongooseUniqueValidator = require("mongoose-unique-validator");


const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    password: {
        type: String,
        required: true
    },
    img: String,
    description: String,
    contact: String
})

teacherSchema.plugin(mongooseUniqueValidator,{ message: 'Duplicate {PATH}. Please select another one.' });

const Teacher = mongoose.model("teacher",teacherSchema);

module.exports = Teacher;

module.exports.teacherSchema = teacherSchema;