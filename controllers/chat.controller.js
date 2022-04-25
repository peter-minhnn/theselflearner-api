const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');

exports.sendEmailOnChatBot = (req, res) => {
    // initialize nodemailer
    const transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
        auth: {
            user: process.env.EMAILNAME,
            pass: process.env.SMTP_PWD,
        },
        secure: true,
    });

    var mailOptions = {};
    mailOptions = {
        from: process.env.EMAILNAME, // sender address
        to: 'tselflearner@gmail.com'
    };
    // point to the template folder
    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./mail-template/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./mail-template/'),
    };

    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))

    mailOptions.subject = `[TIỀN TỚI] ${req.body.firstname + " " + req.body.lastname} vừa liên hệ với vợ yêu trên ChatBot`;
    mailOptions.template = 'chatbot';
    mailOptions.context = {
        email: req.body.email,
        name: req.body.firstname + " " + req.body.lastname,
        phone: req.body.phone
    };

    // trigger the sending of the E-mail
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        res.status(200).send({
            code: 201,
            message: 'Gửi email thành công'
        })
    });
}