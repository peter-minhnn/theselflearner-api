const db = require("../models");
const Class = db.class;
const Course = db.course;

exports.getAll = async (req, res) => {
    const classesPromise = new Promise((resolver, reject) => {
        return resolver(Class.find({}).lean().exec());
    });
    const coursesPromise = new Promise((resolver, reject) => {
        return resolver(Course.find({}).lean().exec());
    })

    var classes = await classesPromise;
    var courses = await coursesPromise;
    var mapArr = [];

    if (classes) {
        classes.filter(async element => {
            let course = courses.find(courseItem => element.courseId === courseItem.courseId);
            if (course) {
                element['courseName'] = course.title;
                mapArr.push(element);
            }
        });
    }

    var sortClasses = mapArr ? mapArr.sort().reverse() : [];
    res.status(200).send({
        classes: sortClasses,
        code: 200,
        message: 'Lấy toàn bộ lớp học thành công'
    });
}

exports.update = async (req, res) => {
    const data = {
        status: req.body.status,
        updatedDate: new Date().toISOString(),
        updatedUser: req.body.updatedUser
    };

    Class.updateOne({ "_id": req.body._id }, data).exec((err, course) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send({ message: "Cập nhật thành công", code: 201, data: course });
    });
}