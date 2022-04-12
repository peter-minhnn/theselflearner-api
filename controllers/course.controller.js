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
        message: 'Lấy toàn bộ khóa học thành công'
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
            message: 'Lấy khóa học thành công'
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
        res.send({ message: "Khóa học tạo thành công", code: 201 });
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
        res.status(200).send({ message: "Cập nhật thành công", code: 201, data: course });
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
            message: 'Xóa thành công'
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
            message: 'Xóa thành công'
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
        message: 'Lấy toàn bộ đánh giá thành công'
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
            message: `Lấy đánh giá theo khóa học thành công`
        });
    })
}

exports.addEvaluate = (req, res) => {
    User.findOne({ 'email': req.body.studentEmail }).exec((errFindUser, user) => {
        if (errFindUser) {
            res.status(500).send({ message: errFindUser });
            return;
        }
        if (user) {
            let data = {
                fullname: req.body.studentName ? req.body.studentName : user.fullname,
                phone: req.body.studentPhone ? req.body.studentPhone : user.phone,
                updatedDate: new Date().toISOString(),
                updatedUser: req.body.studentEmail
            }

            User.updateOne({ 'email': req.body.studentEmail }, data).exec((err, updated) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                if (updated.modifiedCount == 1) {
                    User.findOne({ 'email': req.body.studentEmail }).exec((errUserUpdated, userUpdated) => {
                        if (errUserUpdated) {
                            res.status(500).send({ message: errUserUpdated });
                            return;
                        }
                        if (userUpdated) {
                            Evaluate.findOne({ 'courseId': req.body.courseId, 'studentEmail': req.body.studentEmail })
                            .exec((errEvaluate, evaluateData) => {
                                if (errEvaluate) {
                                    res.status(500).send({ message: errEvaluate });
                                    return;
                                }
                                if (evaluateData) {
                                    const update = {
                                        courseId: req.body.courseId,
                                        studentEmail: req.body.studentEmail,
                                        studentName: userUpdated.fullname,
                                        studentPhone: userUpdated.phone,
                                        studentAvatar: userUpdated.avatar,
                                        score: req.body.score,
                                        comment: req.body.comment,
                                        updatedDate: new Date().toISOString(),
                                        updatedUser: req.body.studentEmail
                                    }

                                    Evaluate.updateOne({ '_id': evaluateData._id }, update).exec((errUpdateEvaluate, response) => {
                                        if (errUpdateEvaluate) {
                                            res.status(500).send({ message: errUpdateEvaluate });
                                            return;
                                        }
                                        res.send({
                                            fullname: data.fullname,
                                            phone: data.phone,
                                            message: "Đánh giá thành công!", code: 201
                                        });
                                    });
                                }
                                else {
                                    const evaluate = new Evaluate({
                                        courseId: req.body.courseId,
                                        studentEmail: req.body.studentEmail,
                                        studentName: userUpdated.fullname,
                                        studentPhone: userUpdated.phone,
                                        studentAvatar: userUpdated.avatar,
                                        score: req.body.score,
                                        comment: req.body.comment,
                                        createdDate: new Date().toISOString(),
                                        createdUser: req.body.studentEmail
                                    });

                                    evaluate.save((errSave, response) => {
                                        if (errSave) {
                                            res.status(500).send({ message: errSave });
                                            return;
                                        }
                                        res.send({
                                            fullname: userUpdated.fullname,
                                            phone: userUpdated.phone,
                                            message: "Đánh giá thành công!", code: 201
                                        });
                                    });
                                }
                            })
                        }
                    })
                }
            });


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
    mailOptions.context = {
        title: 'Xác nhận!',
        message: 'Đăng ký khóa học thành công.'
    }

    User.findOne({ 'email': req.body.studentEmail }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        if (user) {
            let data = {
                fullname: user.fullname ? user.fullname : req.body.studentName,
                phone: user.phone ? user.phone : req.body.studentPhone,
                updatedDate: new Date().toISOString(),
                updatedUser: req.body.studentEmail
            }

            User.updateOne({ 'email': req.body.studentEmail }, data).exec((errUser, updated) => {
                if (errUser) {
                    res.status(500).send({ message: errUser });
                    return;
                }
                if (updated.modifiedCount == 1) {
                    User.findOne({ 'email': req.body.studentEmail }).exec((errUserUpdated, userUpdated) => {
                        if (errUserUpdated) {
                            res.status(500).send({ message: errUserUpdated });
                            return;
                        }
                        //Update user evaluate
                        Evaluate.findOne({ 'courseId': req.body.courseId, 'studentEmail': req.body.studentEmail }).exec((errEvaluateFindOne, evaluate) => {
                            if (errEvaluateFindOne) {
                                res.status(500).send({ message: errEvaluateFindOne });
                                return;
                            }
                            if (evaluate) {
                                const update = {
                                    courseId: req.body.courseId,
                                    studentEmail: req.body.studentEmail,
                                    studentName: userUpdated.fullname,
                                    studentPhone: userUpdated.phone,
                                    studentAvatar: userUpdated.avatar,
                                    updatedDate: new Date().toISOString(),
                                    updatedUser: req.body.studentEmail
                                }

                                Evaluate.updateOne({ '_id': evaluate._id }, update).exec((errUpdate, response) => {
                                    if (errUpdate) {
                                        res.status(500).send({ message: errUpdate });
                                        return;
                                    }
                                });
                            }
                        })

                        //Create class by courseId
                        Class.findOne({ 'courseId': req.body.courseId, 'studentEmail': req.body.studentEmail })
                            .exec((errClass, classResult) => {
                                if (errClass) {
                                    console.log('enroll findOne Class: ', errClass);
                                    res.status(500).send({ message: errClass });
                                    return;
                                }
                                if (!classResult) {
                                    //Define new object Class data
                                    const enrolClass = new Class({
                                        courseId: req.body.courseId,
                                        studentEmail: req.body.studentEmail,
                                        studentName: req.body.studentName,
                                        studentPhone: req.body.studentPhone,
                                        studentAvatar: user.avatar,
                                        status: 0,
                                        sDate: req.body.sDate,
                                        eDate: req.body.eDate,
                                        createdDate: new Date().toISOString(),
                                        createdUser: req.body.createdUser
                                    });

                                    enrolClass.save((errSave, response) => {
                                        if (errSave) {
                                            res.status(500).send({ message: errSave });
                                            return;
                                        }

                                        transporter.sendMail(mailOptions, function (errorSendMail, info) {
                                            if (errorSendMail) {
                                                return console.log(errorSendMail);
                                            }
                                            console.log('Message sent: ' + info.response);
                                        });
                                        res.status(200).send({
                                            fullname: data.fullname,
                                            phone: data.phone,
                                            message: "User enroll was created and sent email confirmation successfully!",
                                            code: 201
                                        });
                                    });
                                }
                                else {
                                    res.status(200).send({ message: "Bạn đã đăng ký khóa học", code: 200 });
                                }
                            })
                    })
                }
            });
        }
    })
}

exports.getClassByEmail = (req, res) => {
    Class.findOne({ "courseId": req.body.courseId, "studentEmail": req.body.email })
        .exec((err, response) => {
            if (!response) {
                res.status(200).send({
                    code: 204,
                    message: 'Bạn chưa đăng ký khóa học nên không thể đánh giá',
                })
            }
            else {
                res.status(200).send({
                    code: 200,
                    message: 'Bạn đã đăng ký khóa học',
                })
            }
        })
}