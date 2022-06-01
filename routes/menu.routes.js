const { authJwt } = require("../middlewares");
const controller = require("../controllers/menu.controller");

module.exports = function (app) {
    app.get("/api/menu/getAll", [authJwt.verifyToken], controller.getAll);
    app.post("/api/menu/create-menu", [authJwt.verifyToken, authJwt.isAdmin], controller.create);
    app.put("/api/menu/update-menu", [authJwt.verifyToken, authJwt.isAdmin], controller.update);
    app.delete("/api/menu/delete-menu", [authJwt.verifyToken, authJwt.isAdmin], controller.delete);
    app.get("/api/menu/get-roles", [authJwt.verifyToken], controller.getRoles);
};
