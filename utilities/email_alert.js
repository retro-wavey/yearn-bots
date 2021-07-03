const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = (message) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: process.env.MAIL_USER,
        pass: process.env.EMAIL_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.MAIL_USER
    };

    mailOptions.to = process.env.MY_EMAIL;
    mailOptions.subject = "Yearn Vault Alert";
    mailOptions.html = message;
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Alert email sent: ' + info.response);
        }
    });
}