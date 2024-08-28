const {
    formatError,
    formatMongooseUniqueError,
} = require("../helpers/formatError");
const jwt = require("jsonwebtoken");
const { createCookie, getUserId } = require("../helpers/jwt");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const ejs = require("ejs");
const path = require("path");
const Otp = require("../model/OTP");
const { sendMail } = require("../helpers/sendMail");
const { permission } = require("process");


module.exports.registerUser = async (req, res) => {
    try {
        const otp_response = await Otp.findOne({ email: req.body.email });

        if (otp_response == null) {
            res.status(401).json(formatError({ otp: "Otp Needed" }));
            return;
        }

        if (otp_response.otp != req.body.otp){
            res.status(401).json(formatError({ otp: "Otp does not match"}));
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        await Otp.deleteOne({email: req.body.email});

        res.cookie("jwt", createCookie({ id: newUser._id, permission: "student" }));
        res.sendStatus(201);
    } catch (err) { 
        console.log(err);
        res.status(401).json(formatMongooseUniqueError(err.errors));
    }
};

module.exports.loginUser = async (req, res) => {
    try{
        const user = await User.findOne({email: req.body.email});
        console.log(user)
        
        if(user == null){
            return res.status(401).json(formatError({email: "Unregistered Email"}));
        }
        const passwordIsCorrect = await bcrypt.compare(
            req.body.password,
            user.password
        )
        if(!passwordIsCorrect){
            return res.status(401).json(formatError({password: "Incorrect Password"}))
        }
        res.cookie("jwt", createCookie({id: user._id, permission: "student"}));
        return res.sendStatus(200);
    } catch(err){
        console.log(err);
    }
}

module.exports.getOtp = async (req, res) =>{
    try{
        const otp = Math.floor(Math.random() * 1000000);
        console.log(otp, req.body.email)
        const createdOtp = await Otp.updateOne({email: req.body.email}, {
            email: req.body.email,
            otp: otp
        },
        {upsert: true},
        ()=>{console.log("UPdated")});

        const html = await ejs.renderFile(
            path.join(__dirname, "../views/templates/otpTemplate.ejs"),
            {OTP: otp}
        )
        sendMail(req.body.email, "Otp", html);

        res.send(createdOtp);
    } catch(err){
        console.log(err)
    }
}

module.exports.adminLogin = async(req, res) => {
    try{
        const adminPass = process.env.ADMIN_PASSWORD;
        if(req.body.password == adminPass){
            console.log(adminPass, req.body.password, adminPass == req.body.password);
            res.cookie("jwt", createCookie({permission: "admin"}));
            return res.sendStatus(200);
        } else {
            return res.status(401).json(formatError({message: "Wrorng Password"}))
        }
    } catch(err) {
        console.log(err);
    }
}
