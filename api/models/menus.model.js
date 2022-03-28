const mongoose = require("mongoose");
const Menus = mongoose.model(
  "Menus",
  new mongoose.Schema({
    name: String,
    parentIdx: String,
    path: String,
    status: String,
    createdDate: String,
    createdUser: String,
    updatedDate: String,
    updatedUser: String
  }, 
  { strict: true }),
  'menus'
);

module.exports = Menus;
