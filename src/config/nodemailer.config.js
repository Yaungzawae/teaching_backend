const nodemailer = require("nodemailer");

module.exports.transporter = nodemailer.createTransport({
    service: "Gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, //tls
    auth: {
        user:process.env.EMAIL,
        pass:process.env.EMAIL_PASSWORD
    },
    // tls: {
    //     ciphers:'SSLv3'
    // }
}); 