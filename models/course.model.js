const mongoose = require("mongoose");
const Courses = mongoose.model(
  "Courses",
  new mongoose.Schema({
    courseId: String,
    title: String,
    courseType: String,
    trainerName: String,
    courseFee: String,
    duration: String,
    discount: Number,
    sDate: String,
    eDate: String,
    objectives: String,
    courseOutline: String,
    avatar: String,
    createdDate: String,
    createdUser: String,
    updatedDate: String,
    updatedUser: String
  }, { strict: true }),
  'courses'
);

module.exports = Courses;
