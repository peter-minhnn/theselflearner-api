const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const db = {};
db.mongoose = mongoose;
db.user = require("./user.model");
db.role = require("./role.model");
db.course = require("./course.model");
db.evaluate = require("./evaluate.model");
db.class = require("./class.model");
db.menu = require("./menus.model");
db.refreshToken = require("./refreshToken.model");
db.aws = require("./aws.model");
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
