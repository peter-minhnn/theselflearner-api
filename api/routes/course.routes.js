const { verifySignUp, authJwt } = require("../middlewares");
const controller = require("../controllers/course.controller");

module.exports = function (app) {
    app.get("/api/course/getAll",
        [
            authJwt.verifyToken,
        ],
        controller.getAll
    ); //Get all courses
    app.post(
        "/api/course/createCourse",
        [
            authJwt.verifyToken
        ],
        controller.createCourse
    );// Create course
    app.put(
        "/api/course/updateCourse",
        [
            authJwt.verifyToken
        ],
        controller.updateCourse
    )
    app.delete(
        "/api/course/deleteCourse",
        [
            authJwt.verifyToken
        ],
        controller.deleteCourse
    )
    app.delete(
        "/api/course/deleteCourseEvaluate",
        [
            authJwt.verifyToken
        ],
        controller.deleteCourseEvaluate
    )
};
