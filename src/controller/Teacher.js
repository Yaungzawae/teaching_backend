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

        const img = req.file ? `${req.file.destination}/${newTeacherId}${path.extname(req.file.originalname)}` : null;

        const newTeacher = await Teacher.create({
            _id: newTeacherId,
            name: req.body.name,
            email: req.body.email,
            password: hashed,
            description: req.body.description,
            contact: req.body.contact,
            img: img
        })

        if(img){
            fs.rename(`${req.file.path}` , `${req.file.destination}/${newTeacher._id}${path.extname(req.file.originalname)}`, function(err){
                if(err){
                    console.log(err)
                }
            })
        }


        res.cookie("jwt", createCookie({ id: newTeacher._id, permission: "teacher", admin: true }));
        res.sendStatus(201);
    } catch (err) {
        console.log(err);
        res.status(401).json(err);
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
    
    
    try {
        const id = req.body._id ?  req.body._id : getUserId(req.cookies.jwt);
        const oneDetail = await Teacher.findOne({ _id: new mongoose.Types.ObjectId(id) });
        console.log(oneDetail)
        return res.status(200).json(oneDetail);
    } catch (err) {
        console.log(err);
        return res.status(401).json({message: "This Page is only for teachers"})
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

        if (req.body.contact) {
            teacherUpdate.contact = req.body.contact;
        }

        if (req.file) {
            const extension = path.extname(req.file.originalname)

            teacherUpdate.img = `${req.file.destination}/${tr_id}${extension}`;

            fs.rename(`${req.file.path}` , `${req.file.destination}/${tr_id}${extension}`, function(err){
                if(err){
                    console.log(err)
                }
            } )    
        }

        const teacher = await Teacher.findOneAndUpdate(
            { _id: getUserId(req.cookies.jwt) },
            teacherUpdate, 
            { new: true } 
        );

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


module.exports.accessTeacher = async(req, res) => {
    try{
        const teacher = await Teacher.findOne({_id: req.body._id});

        if(!teacher) return res.status(404).json({message: "Teacher Not Found"});

        res.cookie("jwt", createCookie({ id: teacher._id, permission: "teacher", admin: true}));
        return res.sendStatus(200);
    } catch(err) {
        console.log(err)
    }
}