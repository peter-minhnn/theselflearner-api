const { authJwt } = require("../middlewares");
const controller = require("../controllers/classes.controller");

module.exports = function (app) {
    app.get("/api/classes/all", controller.getAll); //Get all classes
};
