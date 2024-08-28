const multer = require("multer");
const { createManualPayment, getManualPayments, confirmManualPayment, denylManualPayment, getPaymentsOfUser } = require("../controller/ManualPayment");
const { registerClassStripe, confirmRegistrationStripe } = require("../controller/Stripe");
const { isStudent, validateCookie } = require("../middlewares/validateCookie");
const path = require("path");
const { confirmRegistrationPromptPay, registerClassPromptPay } = require("../controller/PromptPay");
const { registerPayPal, confirmRegistrationPayPal } = require("../controller/Paypal");



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/manual_payments')
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + extension)
    }
  })
  
const upload = multer({ storage: storage })


const Router = require("express").Router();

Router.post("/stripe/register-class", validateCookie, isStudent ,registerClassStripe);

Router.post("/stripe/confirm-registration", validateCookie, isStudent ,confirmRegistrationStripe);

Router.post("/prompt-pay/register-class", validateCookie, isStudent, registerClassPromptPay);

Router.post("/prompt-pay/confirm-registration", validateCookie, isStudent, confirmRegistrationPromptPay);

Router.post("/manual/register", validateCookie, isStudent, upload.single("img") ,createManualPayment);

Router.post("/manual/get", getManualPayments);

Router.post("/manual/confirm", confirmManualPayment);

Router.post("/manual/deny", denylManualPayment);

Router.post("/paypal/register", validateCookie, isStudent, registerPayPal);

Router.post("/paypal/confirm", validateCookie, isStudent, confirmRegistrationPayPal)

Router.post("/get", validateCookie, isStudent, getPaymentsOfUser);


module.exports = Router; 