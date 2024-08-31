const express = require('express');
const router = express.Router();
const testimonialController = require('../controller/Testmonial');


const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/testimonials')
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      const _id = req.body._id;
      cb(null, _id + extension)
    }
  })
  
const upload = multer({ storage: storage })


// Get all testimonials
router.get('/', testimonialController.getAllTestimonials);

// Update a testimonial by ID
router.put('/', upload.single("image"), testimonialController.updateTestimonial);
 
// Create a new testimonial
router.post('/', testimonialController.createTestimonial);

// Delete a testimonial by ID
router.delete('/:id', testimonialController.deleteTestimonial);

module.exports = router;