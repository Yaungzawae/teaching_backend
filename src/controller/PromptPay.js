const path = require('path');
const { formatError } = require('../helpers/formatError');
const { getUserId } = require('../helpers/jwt');
const { sendMail } = require('../helpers/sendMail');
const Class = require('../model/Class');
const User = require('../model/User');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ejs = require("ejs");
const Session = require('../model/Session');
const Payments = require('../model/ManualPayment');


module.exports.registerClassPromptPay = async (req, res) => {
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

        const paymentIntent = await stripe.paymentIntents.create({
            amount: course.price * 100, // Stripe expects the amount in cents
            currency: 'thb', // Adjust the currency as needed
            payment_method_types: ['promptpay'],
            metadata: {
                course_id: course._id.toString(),
                student_id: student_id,
            }
        });

        console.log(paymentIntent)
        res.status(200).json({ 
            clientSecret: paymentIntent.client_secret,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json(formatError({ message: 'Server error' }));
    }
}

module.exports.confirmRegistrationPromptPay = async (req, res) => {
    const { paymentIntentId, type } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            const { course_id, student_id } = paymentIntent.metadata;

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
        

            const student = await User.findOne({_id: student_id});

            const payment = await Payments.create({
                studentId: student_id,
                courseId: course_id,
                isAccepted: true,
                amount: course.price,
                type: type,
                paymentMethod: "Prompt Pay"
            })

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
}