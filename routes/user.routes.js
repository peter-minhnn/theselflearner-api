const { verifySignUp, authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

module.exports = function (app) {
    app.post(
        "/api/user/create",
        [
            authJwt.verifyToken,
            verifySignUp.checkDuplicateEmail,
            authJwt.isAdmin
        ],
        controller.create
    );// Create user
    app.put("/api/user/update",
        [
            authJwt.verifyToken,
            authJwt.isAdmin
        ],
        controller.update
    ); //Update user
    app.get("/api/user/getAll",
        [
            authJwt.verifyToken,
            authJwt.isAdmin
        ],
        controller.getAll
    ); //Get all users
    app.get("/api/user/findOne",
        [
            authJwt.verifyToken,
            authJwt.isAdmin
        ],
        controller.findOne
    );// Get user by email
    app.delete("/api/user/delete",
        [
            authJwt.verifyToken,
            authJwt.isAdmin
        ],
        controller.delete
    );// Delete user by email
};
