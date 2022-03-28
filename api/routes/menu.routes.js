const { authJwt } = require("../middlewares");
const controller = require("../controllers/menu.controller");

module.exports = function (app) {
    app.post("/api/menu/getAll", [authJwt.verifyToken, authJwt.isAdmin], controller.getAll);
    app.post("/api/menu/createMenu", [authJwt.verifyToken, authJwt.isAdmin], controller.create);
    app.put("/api/menu/updateMenu", [authJwt.verifyToken, authJwt.isAdmin], controller.update);
    app.post("/api/menu/deleteMenu", [authJwt.verifyToken, authJwt.isAdmin], controller.delete);
};
