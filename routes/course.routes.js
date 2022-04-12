const { authJwt } = require("../middlewares");
const controller = require("../controllers/course.controller");

module.exports = function (app) {
    app.get("/api/course/getAll", [authJwt.verifyToken], controller.getAll); //Get all courses
    app.post("/api/course/createCourse", [authJwt.verifyToken], controller.createCourse);// Create course
    app.put("/api/course/updateCourse", [authJwt.verifyToken], controller.updateCourse)
    app.delete("/api/course/deleteCourse", [authJwt.verifyToken], controller.deleteCourse)
    app.delete("/api/course/deleteCourseEvaluate", [authJwt.verifyToken], controller.deleteCourseEvaluate)
    app.get("/api/course/getCourses", controller.getCourses); //Get all courses client
    app.get("/api/course/get-one-evaluate", controller.getOneEvaluate); //Get one evaluate by course id client
    app.post("/api/course/add-evaluate", [authJwt.verifyToken], controller.addEvaluate); //Add user rating
    app.post("/api/course/enroll", [authJwt.verifyToken], controller.enroll); //Add user enrol class
    app.post("/api/course/get-class-by-email", [authJwt.verifyToken], controller.getClassByEmail); //Add user enrol class
};
