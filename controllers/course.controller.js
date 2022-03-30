const db = require("../models");
const Course = db.course;
const Evaluate = db.evaluate;
const { v4: uuidv4 } = require('uuid');

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