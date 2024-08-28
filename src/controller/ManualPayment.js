const path = require("path");
const { formatError } = require("../helpers/formatError");
const { getUserId } = require("../helpers/jwt");
const Class = require("../model/Class");
const Payments  = require("../model/ManualPayment");
const Session = require("../model/Session");
const User = require("../model/User");
const { sendMail } = require("../helpers/sendMail");
const ejs = require("ejs");

module.exports.createManualPayment = async(req, res) => {
    try{
        const studentId = getUserId(req.cookies.jwt);
        const {courseId, type, amount} = req.body;
    
        const payment = await Payments.create({
            studentId,
            courseId,
            type,
            amount,
            img: `${req.file.destination}/${req.file.filename}`
        })
        return res.sendStatus(201);

    } catch(err) {
        console.log(err)
    }
}

module.exports.getManualPayments = async (req, res) => {
    try {
        const groupedPayments = await Payments.aggregate([
            {
                $group: {
                    _id: "$isAccepted",
                    payments: { $push: "$$ROOT" } 
                }
            }
        ]);

        let acceptedPayments = [];
        let nonAcceptedPayments = [];
        let nullPayments = [];

        groupedPayments.forEach(group => {
            if (group._id === true) {
                acceptedPayments = group.payments;
            } else if (group._id === false) {
                nonAcceptedPayments = group.payments;
            } else if (group._id === null) {
                nullPayments = group.payments;
            }
        });

        return res.status(200).json([
            nullPayments,
            acceptedPayments,
            nonAcceptedPayments,
        ]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "An error occurred while retrieving payments." });
    }
};
module.exports.confirmManualPayment = async(req, res) => {
    try{
        console.log(req.body.payment_id)
        const payment = await Payments.findOneAndUpdate({_id: req.body.payment_id}, {
            isAccepted: true,
            message: req.body.message
        })

        const {studentId, courseId} = payment;

        const type = payment.type;

        console.log(studentId, courseId);

        console.log(type)

            const course = type == "session" ?
            await Session.findOneAndUpdate(
                {
                    _id: courseId,
                    isBooked: false
                },
                {
                    student: studentId,
                    isBooked: true
                },
                {new: true}
            )
            :
            await Class.findOneAndUpdate(
                {
                    _id: courseId,
                },
                {
                    $push: { students: studentId },
                    $inc: { booked_seat: 1 }
                },
                { new: true }
            );

            console.log(course)

            if (!course) {
                return res.status(400).json(formatError({ message: 'Cannot register, class is full or does not exist' }));
            }
        
            const student = await User.findOne({_id: studentId});

            console.log(student, "AAAAAA")
            console.log(student.email)

            const html = await ejs.renderFile(
                path.join(__dirname, "../views/templates/courseRegisterationTemplate.ejs"),
            )

            const attachments = type == "session" ? [] : [
                {filename: `${course.text_book}`}
            ];
            
            sendMail(student.email, "Class Registeration", html, attachments);
            res.status(200).json(course);

    } catch(err) {
        console.log(err);
    }
}

module.exports.denylManualPayment = async(req, res) => {
    try{
        const payment = await Payments.findOneAndUpdate({_id: req.body.payment_id}, {
            isAccepted: false,
            message: req.body.message
        })

        return res.status(200).json(payment);
    } catch(err) {
        console.log(err);
    }
}

module.exports.getPaymentsOfUser = async(req, res) => {
    try{
        const payments = await Payments.find({studentId: getUserId(req.cookies.jwt)});
        return res.status(200).json(payments);
    } catch(err){
        console.log(err);
    }
}  