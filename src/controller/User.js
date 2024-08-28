const {
    formatError,
    formatMongooseUniqueError,
} = require("../helpers/formatError");
const jwt = require("jsonwebtoken");
const { createCookie, getUserId } = require("../helpers/jwt");
const bcrypt = require("bcrypt");
const User = require("../model/User");
const mongoose = require('mongoose');

var fs = require('fs');
const path = require("path");


module.exports.getOneUser = async (req, res) => {

    const id = req.body.id ? req.body.id : getUserId(req.cookies.jwt);

    try {
        const oneDetail = await User.findOne({ _id: new mongoose.Types.ObjectId(id) });
        return res.status(200).json(oneDetail);
    } catch (err) {
        console.log(err);
    }

}

module.exports.getAllUsers = async (req, res) => {

    try {
        const allUsers = await User.find();
        return res.status(200).json(allUsers)
    } catch (err) {
        console.log(err)
    }

}

module.exports.editUserDetails = async (req, res) => {

    console.log(req.body.description)

    try {
        const UserUpdate = {};

        if (req.body.name) {
            UserUpdate.name = req.body.name;
        }

        if (req.body.description) {
            UserUpdate.description = req.body.description;
        }

        if (req.body.img) {
            console.log(req.body.img)
            UserUpdate.img = req.body.img;
        }

        const User = await User.findOneAndUpdate(
            { _id: getUserId(req.cookies.jwt) },
            UserUpdate,
            { new: true } // This option returns the updated document
        );

        return res.sendStatus(200);
    } catch (err) {
        console.log(err);
    }
}

