const nodemailer = require('nodemailer');
require('dotenv').config();



// create a transport later which would be used to send the email.

const options = {
    service: "gmail",
    auth: {
        user: "roradobo@gmail.com",
        pass: process.env.APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
};


const send = nodemailer.createTransport(options);



module.exports = {
    send

}