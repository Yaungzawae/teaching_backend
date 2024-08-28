const { getOneUser, getAllUsers, editUserDetails } = require("../controller/User");
const { validate } = require("../model/ManualPayment");
const Router = require("express").Router();

Router.post("/get-one-user", getOneUser);

module.exports = Router;


