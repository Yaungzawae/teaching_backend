const { check } = require("express-validator");
const Otp = require("../../model/OTP");

const nameValidator = check("name")
  .trim()
  .notEmpty()
  .withMessage("Name cannot be empty")
  .bail()

const emailValidator = check("email")
  .trim()
  .notEmpty()
  .withMessage("Email cannot be empty")
  .bail()
  .isEmail()
  .withMessage("Invalid email address")
  .bail();

module.exports.emailValidator = emailValidator;

const passwordValidator = check("password")
  .trim()
  .notEmpty()
  .withMessage("Password cannot be empty")
  .bail()
  .isLength({ min: 6 })
  .withMessage("Password needs to be at least six characters")
  .bail();


module.exports.passwordValidator = passwordValidator;

module.exports.userValidator = [
  emailValidator,
  passwordValidator,
];
