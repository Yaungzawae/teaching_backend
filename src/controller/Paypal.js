const express = require('express');
    const { formatError } = require('../helpers/formatError');
const { getUserId } = require('../helpers/jwt');
const Class = require('../model/Class');
const paypal = require('@paypal/checkout-server-sdk');
const Session = require('../model/Session');


// Set up PayPal environment with the provided Client ID and Client Secret from environment variables
const environment = process.env.PAYPAL_ENVIRONMENT === 'production' 
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    );
    
const client = new paypal.core.PayPalHttpClient(environment);

module.exports.registerPayPal = async (req, res) => {
    const student_id = getUserId(req.cookies.jwt);
    const { course_id, type } = req.body;

    try {
        const course = type == "session" ? 
        await Session.findOne({
            _id: course_id,
            isBooked: false
        })
        :
        await Class.findOne({
            _id: course_id,
            $expr: { $lt: ['$booked_seat', '$max_seat'] }
        });
        
        if (!course) {
            return res.status(400).json(formatError({ message: 'Cannot register, class is full or does not exist' }));
        }
        
        // Create a PayPal order
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'THB', // Using Thai baht for currency
                    value: course.price.toString()
                },
                custom_id: course._id.toString(), // course ID for tracking
                reference_id: student_id // student ID for tracking
            }]
        });
        
        // Execute the order creation request
        const order = await client.execute(request);

        console.log(order)
        
        // Send back the order ID to the frontend for the user to complete payment
        res.status(200).json({ 
            orderID: order.result.id 
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(formatError({ message: 'Server error' }));
    }
};

// Capture PayPal payment and confirm registration
module.exports.confirmRegistrationPayPal = async (req, res) => {
    const { orderID } = req.body;

    try {
        // Capture the PayPal payment using the order ID
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});

        const capture = await client.execute(request);

        console.log(capture);

        if (capture.result.status === 'COMPLETED') {
            const { purchase_units } = capture.result;
            const { reference_id: student_id, custom_id: course_id } = purchase_units[0];

            // Find the course and ensure it has available seats before confirming registration
            const course = type == "session" ?
            await Session.findOneAndUpdate(
                {
                    _id: course_id,
                    isBooked: false
                },
                {
                    student: student_id,
                    isBooked: true
                },
                {new: true}
            )
            :
            await Class.findOneAndUpdate(
                {
                    _id: course_id,
                    $expr: { $lt: ['$booked_seat', '$max_seat'] }
                },
                {
                    $push: { students: student_id },
                    $inc: { booked_seat: 1 }
                },
                { new: true }
            );

            if (!course) {
                return res.status(400).json(formatError({ message: 'Cannot register, class is full or does not exist' }));
            }

            // Return the updated course information as a confirmation of successful registration
            res.status(200).json(course);
        } else {
            res.status(400).json(formatError({ message: 'Payment not completed' }));
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(formatError({ message: 'Server error' }));
    }
};


