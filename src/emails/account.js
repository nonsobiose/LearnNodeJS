// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name)=> {
    sgMail.send({
        to: email,
        from: "web@node.js",
        subject: "Thanks for signing up",
        text: `Hi ${name}, you are welcome to Nodejs`,
    });
};

const sendExitEmail = (email, name)=> {
    sgMail.send({
        to: email,
        from: "web@node.js",
        subject: "Unsubscribe from Service",
        text: `Hi ${name}, sorry to see you go, it's quite a shame though`,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendExitEmail,
};

