const mongoose = require("mongoose");
const Menus = mongoose.model(
  "Menus",
  new mongoose.Schema({
    name: String,
    parentIdx: String,
    path: String,
    order: String,
    status: String,
    createdDate: String,
    createdUser: String,
    updatedDate: String,
    updatedUser: String,
    roles: [{
      type: mongoose.Schema.Types.String,
      ref: "Role"
    }]
  },
    { strict: true }),
  'menus'
);

module.exports = Menus;
