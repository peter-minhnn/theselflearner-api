const mongoose = require("mongoose");
const Users = mongoose.model(
  "Users",
  new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    rememberPwd: String,
    phone: String,
    createdDate: String,
    createdUser: String,
    updatedDate: String,
    updatedUser: String,
    avatar: String,
    status: String,
    roles: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }
  })
);

module.exports = Users;
