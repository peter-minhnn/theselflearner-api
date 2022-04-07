const { authJwt } = require("../middlewares");
const controller = require("../controllers/menu.controller");

module.exports = function (app) {
    app.get("/api/menu/getAll", [authJwt.verifyToken], controller.getAll);
    app.post("/api/menu/createMenu", [authJwt.verifyToken, authJwt.isAdmin], controller.create);
    app.put("/api/menu/updateMenu", [authJwt.verifyToken, authJwt.isAdmin], controller.update);
    app.delete("/api/menu/deleteMenu", [authJwt.verifyToken, authJwt.isAdmin], controller.delete);
    app.get("/api/menu/getRoles", [authJwt.verifyToken], controller.getRoles);
};
