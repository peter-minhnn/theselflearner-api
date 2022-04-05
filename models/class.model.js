const mongoose = require("mongoose");
const Classes = mongoose.model(
  "Classes",
  new mongoose.Schema({
    courseId: String,
    studentEmail: String,
    studentName: String,
    studentPhone: String,
    status: String,
    sDate: String,
    eDate: String,
    createdDate: String,
    createdUser: String,
    updatedDate: String,
    updatedUser: String
  }, 
  { strict: true }),
  'classes'
);

module.exports = Classes;
