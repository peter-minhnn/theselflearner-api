const { authJwt } = require("../middlewares");
const controller = require("../controllers/s3.controller");

module.exports = function (app) {
    app.post("/api/s3/upload", [authJwt.verifyToken], controller.upload);
    app.get("/api/s3/getListS3Objects", [authJwt.verifyToken, authJwt.isAdmin], controller.getListS3Objects);
    app.post("/api/s3/uploadS3Object", [authJwt.verifyToken, authJwt.isAdmin], controller.uploadS3Object);
    app.delete("/api/s3/deleteS3Object", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteS3Object);
};
