const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    quote: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    align: {
        type: String,
        enum: ['left', 'right'],
        default: 'left',
    },
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;