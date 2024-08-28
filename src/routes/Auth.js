
const { register } = require("module");
const handleValidatorError = require("../middlewares/handleValidator");
const { userValidator} = require("../middlewares/validator/userValidator");
const { registerUser, getOtp, loginUser, adminLogin } = require("../controller/Auth");

const Router = require("express").Router();

Router.post("/register", userValidator, handleValidatorError, registerUser);

Router.post("/login", userValidator, handleValidatorError, loginUser);

Router.post("/getOtp", getOtp);

Router.post("/admin-login", adminLogin);

module.exports = Router;