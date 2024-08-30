const handleValidatorError = require("../middlewares/handleValidator");
const { userValidator} = require("../middlewares/validator/userValidator");
const { registerUser, getOtp, loginUser, adminLogin, forgotPassword } = require("../controller/Auth");

const Router = require("express").Router();

Router.post("/register", userValidator, handleValidatorError, registerUser);

Router.post("/login", userValidator, handleValidatorError, loginUser);

Router.post("/getOtp", getOtp);

Router.post("/admin-login", adminLogin);

Router.post("/forgot-password", forgotPassword);

module.exports = Router;