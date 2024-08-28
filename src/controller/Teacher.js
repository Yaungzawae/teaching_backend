const {
    formatError,
    formatMongooseUniqueError,
} = require("../helpers/formatError");
const jwt = require("jsonwebtoken");
const { createCookie, getUserId } = require("../helpers/jwt");
const bcrypt = require("bcrypt");
const Teacher = require("../model/Teacher");
const mongoose = require('mongoose');

var fs = require('fs');
const path = require("path");


module.exports.createTeacher = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(req.body.password, salt);

        const newTeacherId = new mongoose.Types.ObjectId();

        const extension = path.extname(req.file.originalname)
        console.log(extension)

        const newTeacher = await Teacher.create({
            _id: newTeacherId,
            name: req.body.name,
            email: req.body.email,
            password: hashed,
            description: req.body.description,
            contact: req.body.contact,
            img: `${req.file.destination}/${newTeacherId}${extension}`
        })

        fs.rename(`${req.file.path}` , `${req.file.destination}/${newTeacher._id}${extension}`, function(err){
            if(err){
                console.log(err)
            }
        } )

        

        res.cookie("jwt", createCookie({ id: newTeacher._id, permission: "teacher" }));
        res.sendStatus(201);
    } catch (err) {
        console.log(err);
        res.status(401).json(formatMongooseUniqueError(err.errors));
    }
}

module.exports.loginTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ email: req.body.email });

        if (teacher == null) {
            return res.status(401).json(formatError({ email: "Unregistered Email" }));
        }

        const passwordIsCorrect = await bcrypt.compare(
            req.body.password,
            teacher.password
        )
        if (!passwordIsCorrect) {
            return res.status(401).json(formatError({ password: "Incorrect Password" }))
        }

        res.cookie("jwt", createCookie({ id: teacher._id, permission: "teacher" }));
        return res.sendStatus(200);

    } catch (err) {
        console.log(err)
    }
}

module.exports.getOneTeacher = async (req, res) => {

    const id = req.body._id ? req.body._id : getUserId(req.cookies.jwt);
    console.log(req.body._id);

    try {
        const oneDetail = await Teacher.findOne({ _id: new mongoose.Types.ObjectId(id) });
        console.log(oneDetail)
        return res.status(200).json(oneDetail);
    } catch (err) {
        console.log(err);
    }

}

module.exports.getAllTeachers = async (req, res) => {

    try {
        const allTeachers = await Teacher.find();
        return res.status(200).json(allTeachers)
    } catch (err) {
        console.log(err)
    }

}

module.exports.editTeacherDetails = async (req, res) => {

    try {
        const extension = path.extname(req.file.originalname)
        const teacherUpdate = {};

        const tr_id = getUserId(req.cookies.jwt);

        if (req.body.name) {
            teacherUpdate.name = req.body.name;
        }

        if (req.body.email) {
            teacherUpdate.email = req.body.email;
        }

        if (req.body.description) {
            teacherUpdate.description = req.body.description;
        }

        if (req.file) {
            teacherUpdate.img = `${req.file.destination}/${tr_id}${extension}`;
        }

        console.log(teacherUpdate)

        const teacher = await Teacher.findOneAndUpdate(
            { _id: getUserId(req.cookies.jwt) },
            teacherUpdate,
            { new: true } 
        );

        fs.rename(`${req.file.path}` , `${req.file.destination}/${tr_id}${extension}`, function(err){
            if(err){
                console.log(err)
            }
        } )

        return res.sendStatus(200);
    } catch (err) {
        console.log(err);
    }
}

module.exports.deleteTeacher = async (req, res) => {
    try {
        const tr_id = req.body.teacher_id;

        const teacher = await Teacher.findById(tr_id);

        if (!teacher) {
            return res.status(404).json(formatError({ teacher: "Teacher not found" }));
        }

        if (teacher.img) {
            fs.unlink(teacher.img, (err) => {
                if (err) {
                    console.error(`Failed to delete image file: ${err}`);
                }
            });
        }

        await Teacher.deleteOne({ _id: tr_id });

        return res.sendStatus(200);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "An error occurred while deleting the teacher" });
    }
};