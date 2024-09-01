const handleValidatorError = require("../middlewares/handleValidator");
const { userValidator} = require("../middlewares/validator/userValidator");
const { registerUser, getOtp, loginUser, adminLogin, forgotPassword, getAuthStatus } = require("../controller/Auth");
const { isAdmin } = require("../middlewares/validateCookie");

const Router = require("express").Router();

Router.post("/register", userValidator, handleValidatorError, registerUser);

Router.post("/login", userValidator, handleValidatorError, loginUser);

Router.post("/getOtp", getOtp);

Router.post("/admin-login", adminLogin);

Router.post("/check-admin", isAdmin, (req,res) => res.sendStatus(200));

Router.post("/get-status", getAuthStatus);

Router.post("/forgot-password", forgotPassword);

module.exports = Router;