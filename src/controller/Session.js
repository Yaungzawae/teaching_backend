const Session = require("../model/Session");
const { getUserId } = require("../helpers/jwt");
const { formatError, serverError } = require("../helpers/formatError");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a new session
module.exports.createSession = async (req, res) => {
    console.log(req.file);
    try {
        const newSession = await Session.create({
            title: req.body.title,
            price: req.body.price,
            date: req.body.date,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            description: req.body.description,
            teacher: getUserId(req.cookies.jwt),
        });
        res.status(200).json(newSession);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

// Get all sessions of a specific teacher
module.exports.getAllSessionsOfTeacher = async (req, res) => {
    const id = req.body._id ? req.body._id : getUserId(req.cookies.jwt);
    try {
        const sessions = await Session.find({ teacher: id });
        res.status(200).json(sessions);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

// Register a student for a session
module.exports.registerSession = async (req, res) => {
    const student_id = getUserId(req.cookies.jwt);
    const { session_id } = req.body;

    try {
        const session = await Session.findOne({
            _id: session_id,
            booked: false
        });

        if (!session) {
            return res.status(400).json({ message: 'Cannot register, session is already booked or does not exist' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: session.price * 100, // Stripe expects the amount in cents
            currency: 'thb', // Adjust the currency as needed
            payment_method_types: ['card'],
            metadata: {
                session_id: session._id.toString(),
                student_id: student_id
            }
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Confirm registration after successful payment
module.exports.confirmSessionRegistration = async (req, res) => {
    const { paymentIntentId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            const { session_id, student_id } = paymentIntent.metadata;

            const session = await Session.findOneAndUpdate(
                {
                    _id: session_id,
                    booked: false
                },
                {
                    students: student_id,
                    booked: true
                },
                { new: true }
            );

            if (!session) {
                return res.status(400).json({ message: 'Cannot register, session is already booked or does not exist' });
            }

            res.status(200).json(session);
        } else {
            res.status(400).json({ message: 'Payment not completed' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.getOneSession = async(req, res)=>{
    try{
        const session = await Session.findById(req.body._id);
        res.status(200).json(session);
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.editSession = async (req, res) => {
    console.log(req.body);
    try {
        const updateData = {};

        if (req.body.title) {
            updateData.title = req.body.title;
        }

        if (req.body.price) {
            updateData.price = req.body.price;
        }

        if (req.body.date) {
            updateData.date = req.body.date;
        }

        if (req.body.start_time) {
            updateData.start_time = req.body.start_time;
        }

        if (req.body.end_time) {
            updateData.end_time = req.body.end_time;
        }

        if (req.body.description) {
            updateData.description = req.body.description;
        }

        if (req.body.teacher) {
            updateData.teacher = req.body.teacher;
        }

        if (req.file) {
            updateData.text_book = `${req.file.destination}/${req.file.filename}`;
        }

        await Session.findByIdAndUpdate(req.body.sessionId, updateData);
        res.sendStatus(200);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};

module.exports.deleteSession = async (req, res) => {
    try{
        await Session.findByIdAndDelete(req.body.class_id);
        res.sendStatus(201);
    } catch(err){
        console.log(err)
        res.sendStatus(500);
    }
}