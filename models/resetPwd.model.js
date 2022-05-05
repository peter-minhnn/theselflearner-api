const mongoose = require("mongoose");
const ResetPwd = mongoose.model(
  "ResetPwd",
  new mongoose.Schema({
    email: String,
    tsltoken: String,
    expiredDate: String,
    expiredTime: String,
    createdDate: String,
    createdUser: String,
    status: String
  })
);

module.exports = ResetPwd;
