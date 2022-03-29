const mongoose = require("mongoose");
const Evaluates = mongoose.model(
  "Evaluates",
  new mongoose.Schema({
    evaluateId: String,
    courseId: String,
    studentEmail: String,
    score: Number,
    comment: String,
    createdDate: String,
    createdUser: String,
    updatedDate: String,
    updatedUser: String
  }, { strict: true }),
  'evaluates'
);

module.exports = Evaluates;
