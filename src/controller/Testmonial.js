const Testimonial = require('../model/Testmonial');

var fs = require('fs');
const path = require("path");


// Get all testimonials
const getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a testimonial by ID
const updateTestimonial = async (req, res) => {
    try {
        const { _id, name, quote } = req.body;
        let image;

        if (req.file) {
            image = `uploads/testimonials/${_id}${path.extname(req.file.originalname)}`;
            console.log(image);
        }

        const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            _id,
            { name, quote, image },
            { new: true }
        );

        res.json(updatedTestimonial);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// Create a new testimonial
const createTestimonial = async (req, res) => {
    try {
        const testimonialCount = await Testimonial.countDocuments();

        if (testimonialCount >= 3) {
            return res.status(400).json({ message: "Maximum number of testimonials reached" });
        }

        const { name, quote, image } = req.body;

        const newTestimonial = new Testimonial({ name, quote, image, align: 'left' });
        await newTestimonial.save();
        res.status(201).json(newTestimonial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a testimonial by ID
const deleteTestimonial = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTestimonial = await Testimonial.findByIdAndDelete(id);

        if (!deletedTestimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }

        res.json({ message: "Testimonial deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllTestimonials,
    updateTestimonial,
    createTestimonial,
    deleteTestimonial,
};