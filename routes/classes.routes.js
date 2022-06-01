const { authJwt } = require("../middlewares");
const controller = require("../controllers/classes.controller");

module.exports = function (app) {
    app.get("/api/classes/all", [authJwt.verifyToken], controller.getAll); //Get all classes
    app.put("/api/classes/update", [authJwt.verifyToken], controller.update); //Update student status
};
