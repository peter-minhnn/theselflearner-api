const { authJwt } = require("../middlewares");
const controller = require("../controllers/s3.controller");

module.exports = function (app) {
    app.post("/api/s3/upload", [authJwt.verifyToken], controller.upload);
    app.get("/api/s3/getListS3Objects", [authJwt.verifyToken], controller.getListS3Objects);
    app.post("/api/s3/uploadS3Object", [authJwt.verifyToken], controller.uploadS3Object);
};
