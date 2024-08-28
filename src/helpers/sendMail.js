const { transporter } = require("../config/nodemailer.config");
const path = require("path");

module.exports.sendMail = async(receiver,subject, data, attachments)=>{
    const assetPath = path.join(__dirname, "../../uploads")
    const attachmentsData = [];
    if(attachments){
        attachments.forEach(({filename,cid}) => attachmentsData.push({
            filename, path: `${filename}`
        }))
    } 
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: receiver,
        subject: subject,
        html: data,
        attachments: attachmentsData
      });
    return 
}