const express = require('express');
    const { formatError } = require('../helpers/formatError');
const { getUserId } = require('../helpers/jwt');
const Class = require('../model/Class');
const paypal = require('@paypal/checkout-server-sdk');
const Session = require('../model/Session');
const Payments = require('../model/ManualPayment');
const User = require('../model/User');
const ejs = require("ejs");
const path = require('path');
const { sendMail } = require('../helpers/sendMail');


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

        console.log(order.result.id);
        
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
    console.log("Paypal Succ")
    const { course_id, type, orderID } = req.body;
    const student_id = getUserId(req.cookies.jwt);
    console.log(course_id, student_id)

    try {
        // Capture the PayPal payment using the order ID
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});

        const capture = await client.execute(request);
        console.log(capture, capture.purchase_units)

        if (capture.result.status === 'COMPLETED') {
            // const { purchase_units } = capture.result;
            // const { reference_id: student_id, custom_id: course_id } = purchase_units[0];


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

            const payment = await Payments.create({
                studentId: student_id,
                courseId: course_id,
                isAccepted: true,
                amount: course.price,
                type: type,
                paymentMethod: "Pay Pal"
            })

            const student = await User.findOne({_id: student_id});

            const html = await ejs.renderFile(
                path.join(__dirname, "../views/templates/courseRegisterationTemplate.ejs"),
            )

            const attachments = type == "session" ? [] : [
                {filename: `${course.text_book}`}
            ]; 
            
            sendMail(student.email, "Class Registeration", html, attachments);

            res.status(200).json(course);
        } else {
            res.status(400).json(formatError({ message: 'Payment not completed' }));
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(formatError({ message: 'Server error' }));
    }
};


