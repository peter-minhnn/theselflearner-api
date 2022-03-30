const { authJwt } = require("../middlewares");
const controller = require("../controllers/s3.controller");

module.exports = function (app) {
    app.post("/api/s3/upload", [authJwt.verifyToken], controller.upload);
};
