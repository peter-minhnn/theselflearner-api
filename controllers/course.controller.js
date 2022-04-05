const db = require("../models");
const User = db.user;
const Course = db.course;
const Evaluate = db.evaluate;
const Class = db.class;
const { v4: uuidv4 } = require('uuid');
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const Users = require("../models/user.model");

exports.getAll = async (req, res) => {
    const coursePromise = new Promise((resolver, reject) => {
        return resolver(Course.find({}).exec());
    })
    const courseEvaluatePromise = new Promise((resolver, reject) => {
        return resolver(Evaluate.find({}).exec());
    })

    var courses = await coursePromise;
    var evaluates = await courseEvaluatePromise;
    var sortCourses = courses ? courses.sort().reverse() : [];
    var sortEvaluates = evaluates ? evaluates.sort().reverse() : [];
    res.status(200).send({
        courses: sortCourses,
        evaluates: sortEvaluates,
        code: 200,
        message: 'Get all courses and evaluates successfully!'
    });
}

exports.getCourseById = (req, res) => {
    Course.findOne({
        courseId: req.body.courseId
    }).exec((err, course) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        res.status(200).send({
            course: course,
            code: 200,
            message: 'Get user successfully!'
        });
    });
}

exports.createCourse = async (req, res) => {
    var id = uuidv4().toString();
    const course = new Course({
        courseId: id,
        title: req.body.title,
        courseType: req.body.courseType,
        trainerName: req.body.trainerName,
        courseFee: req.body.courseFee,
        duration: req.body.duration,
        discount: req.body.discount,
        sDate: req.body.sDate,
        eDate: req.body.eDate,
        objectives: req.body.objectives,
        courseOutline: req.body.courseOutline,
        createdDate: new Date().toISOString(),
        creadtedUser: req.body.createdUser,
        updatedDate: "",
        updatedUser: "",
        avatar: ''
    });

    course.save((err, course) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.send({ message: "Course was created successfully!", code: 201 });
    });
}

exports.updateCourse = async (req, res) => {
    const data = {
        title: req.body.title,
        courseType: req.body.courseType,
        trainerName: req.body.trainerName,
        courseFee: req.body.courseFee,
        duration: req.body.duration,
        discount: req.body.discount,
        sDate: req.body.sDate,
        eDate: req.body.eDate,
        objectives: req.body.objectives,
        courseOutline: req.body.courseOutline,
        updatedDate: new Date().toISOString(),
        updatedUser: req.body.updatedUser,
        avatar: ''
    };

    Course.updateOne({ "_id": req.body._id }, data).exec((err, course) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send({ message: "Course was updated successfully!", code: 201, data: course });
    });
}

exports.deleteCourse = (req, res) => {
    Course.deleteOne({ "_id": req.body._id }).exec((err, result) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send({
            code: 201,
            message: 'Course was deleted successfully!'
        });
    });
}

exports.deleteCourseEvaluate = (req, res) => {
    Evaluate.deleteOne({ "_id": req.body.id }).exec((err, result) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send({
            code: 201,
            message: 'Course was deleted successfully!'
        });
    });
}

exports.getCourses = async (req, res) => {
    const coursePromise = new Promise((resolver, reject) => {
        return resolver(Course.find({}).exec());
    })
    const courseEvaluatePromise = new Promise((resolver, reject) => {
        return resolver(Evaluate.find({}).exec());
    })

    var courses = await coursePromise;
    var evaluates = await courseEvaluatePromise;
    var sortCourses = courses ? courses.sort().reverse() : [];
    var sortEvaluates = evaluates ? evaluates.sort().reverse() : [];
    res.status(200).send({
        courses: sortCourses,
        evaluates: sortEvaluates,
        code: 200,
        message: 'Get all courses and evaluates successfully!'
    });
}

exports.getOneEvaluate = async (req, res) => {
    Evaluate.find({ 'courseId': req.query.courseId }).exec((err, data) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send({
            evaluates: data,
            code: 200,
            message: 'Get evaluate by course id successfully!'
        });
    })
}

exports.addEvaluate = (req, res) => {
    User.findOne({ 'email': req.body.studentEmail }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        if (user) {
            let data = {
                fullname: user.fullname ? user.fullname : req.body.studentName,
                phone: user.phone ? user.phone : req.body.studentPhone,
            }
            User.updateOne({ 'email': req.body.studentEmail }, data).exec((err, updated) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
            });

            Evaluate.findOne({ 'courseId': req.body.courseId, 'studentEmail': req.body.studentEmail }).exec((err, data) => {
                if (data) {
                    const update = {
                        courseId: req.body.courseId,
                        studentEmail: user.email,
                        studentName: user.fullname,
                        studentAvatar: user.avatar,
                        studentPhone: user.phone,
                        score: req.body.score,
                        comment: req.body.comment,
                        updatedDate: new Date().toISOString(),
                        updatedUser: req.body.updatedUser
                    }

                    Evaluate.updateOne({ '_id': data._id }, update).exec((err, response) => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        res.send({ message: "Evaluate was updated successfully!", code: 201 });
                    });
                }
                else {
                    const evaluate = new Evaluate({
                        courseId: req.body.courseId,
                        studentEmail: user.email,
                        studentName: user.fullname,
                        studentAvatar: user.avatar,
                        studentPhone: user.phone,
                        score: req.body.score,
                        comment: req.body.comment,
                        createdDate: new Date().toISOString(),
                        createdUser: req.body.createdUser
                    });

                    evaluate.save((err, response) => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        res.send({ message: "Evaluate was created successfully!", code: 201 });
                    });
                }
            })
        }
    })
}

exports.enroll = async (req, res) => {
    var transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
        auth: {
            user: process.env.EMAILNAME,
            pass: process.env.SMTP_PWD,
        },
        secure: true,
    });
    
    // point to the template folder
    var handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./mail-template/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./mail-template/'),
    };
    
    var mailOptions = {};
    mailOptions = {
        from: process.env.EMAILNAME, // sender address
        to: req.body.studentEmail
    }

    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))

    mailOptions.subject = `Enrollment of ${req.body.title} by ${req.body.studentName}`;
    mailOptions.template = 'enroll';

    Class.findOne({ 'courseId': req.body.courseId, 'studentEmail': req.body.studentEmail })
        .exec((err, result) => {
            if (err) {
                console.log('enroll findOne Class: ', err);
                res.status(500).send({ message: err });
                return;
            }
            if (!result) {
                //Define new object Class data
                const enrolClass = new Class({
                    courseId: req.body.courseId,
                    studentEmail: req.body.studentEmail,
                    studentName: req.body.studentName,
                    studentPhone: req.body.studentPhone,
                    status: 0,
                    sDate: req.body.sDate,
                    eDate: req.body.eDate,
                    createdDate: new Date().toISOString(),
                    createdUser: req.body.createdUser
                });

                enrolClass.save((err, response) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: ' + info.response);
                    });
                    res.status(200).send({ message: "User enroll was created and sent email confirmation successfully!", code: 201 });
                });
            }
            else {
                res.status(200).send({ message: "You have already signed up for a class!", code: 200 });
            }
        })
}