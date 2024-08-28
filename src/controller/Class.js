const Class = require("../model/Class");
const { getUserId } = require("../helpers/jwt");
const { formatError, serverError } = require("../helpers/formatError");
const User = require("../model/User");


module.exports.createClass = async (req, res) => {
    console.log(req.file)
    try{
        const newCourse = await Class.create({
            title: req.body.title,
            price: req.body.price,
            start_date: req.body.startDate,
            schedule: JSON.parse(req.body.schedule),
            description: req.body.description,
            max_seat: req.body.maxSeat,
            teacher: getUserId(req.cookies.jwt),
            text_book: `${req.file.destination}/${req.file.filename}`
        })
        res.status(200).json(newCourse);
    } catch(err) {
        console.log(err);
    }
}

module.exports.getAllClassesOfTeacher = async (req, res) => {
    const id = req.body._id ? req.body._id : getUserId(req.cookies.jwt);
    console.log(id)
    try{
        const courses = await Class.find({teacher : id});
        res.status(200).json(courses);
    } catch(err){
        console.log(err)
        res.sendStatus(500);
    }
}

module.exports.deleteClass = async (req, res) => {
    try{
        await Class.findByIdAndDelete(req.body.class_id);
        res.sendStatus(201);
    } catch(err){
        console.log(err)
        res.sendStatus(500);
    }
}

module.exports.getStudents = async (req, res) => {
    try {
        console.log(req.body.students)
        const students = await User.find({
            _id: { $in: req.body.students}
        })
        console.log(students)
        res.status(200).json(students);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};

module.exports.editClass = async (req, res) => {
    console.log(req.body)
    try {
        console.log(req.body);
        await Class.findByIdAndUpdate(req.body.courseId , 
            {
                title: req.body.title,
                price: req.body.price,
                start_date: req.body.startDate,
                schedule: JSON.parse(req.body.schedule),
                description: req.body.description,
                max_seat: req.body.maxSeat,
                teacher: getUserId(req.cookies.jwt),
                text_book: `${req.file.destination}/${req.file.filename}`
            }
        );
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
};


module.exports.registerClass = async (req, res) => {
    const student_id = getUserId(req.cookies.jwt);
    const {course_id} = req.body;
    try {
        const course = await Class.findOneAndUpdate(
            {
                _id: course_id,
                $expr: { $lt: ['$booked_seat', '$max_seat'] }
            },
            {
                $push: { students: student_id },
                $inc: { booked_seat: 1 }
            },
            { new: true } // return the updated document
        );

        if (!course) {
            return res.status(400).json(formatError({ message: 'Cannot register, class is full or does not exist' }));
        }
        res.status(200).json(course);
    } catch (err) {
        console.log(err);
        return serverError(res);
    }
}


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.registerClass = async (req, res) => {
    const student_id = getUserId(req.cookies.jwt);
    const { course_id } = req.body;

    try {
        const course = await Class.findOne({
            _id: course_id,
            $expr: { $lt: ['$booked_seat', '$max_seat'] }
        });

        if (!course) {
            return res.status(400).json({ message: 'Cannot register, class is full or does not exist' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: course.price * 100, // Stripe expects the amount in cents
            currency: 'thb', // Adjust the currency as needed
            payment_method_types: ['card'],
            metadata: {
                course_id: course._id.toString(),
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

// After successful payment, confirm the registration
module.exports.confirmRegistration = async (req, res) => {
    const { paymentIntentId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            const { course_id, student_id } = paymentIntent.metadata;

            const course = await Class.findOneAndUpdate(
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
                return res.status(400).json({ message: 'Cannot register, class is full or does not exist' });
            }

            res.status(200).json(course);
        } else {
            res.status(400).json({ message: 'Payment not completed' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.getOneClass = async(req, res)=>{
    try{
        const foundClass = await Class.findById(req.body._id);
        res.status(200).json(foundClass);
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
}