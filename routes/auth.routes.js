const { verifySignUp, authJwt } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
    app.post("/api/auth/signup", [verifySignUp.checkDuplicateEmail, verifySignUp.checkRolesExisted], controller.signup);// User Sign Up
    app.post("/api/auth/signin", controller.signin); //User Sign In 
    app.post("/api/auth/signin-admin", [authJwt.isLoginAdminOrMod], controller.signinAdmin); //User Sign In 
    app.post("/api/auth/refreshtoken", controller.refreshToken);// Get new access token when expired
    app.post("/api/auth/check-token-expire", controller.checkTokenExpire);// Get new access token when expired
    app.post("/api/auth/deleteRefreshToken", controller.deleteRefreshToken);// Delete refresh token
    app.post("/api/auth/sendEmailResetPws", controller.sendEmailResetPws);// Send email for reset password
    app.post("/api/auth/findUser", controller.findUser);// Find user by email
    app.post("/api/auth/updateProfile", controller.updateProfile);// Update profile user
};
