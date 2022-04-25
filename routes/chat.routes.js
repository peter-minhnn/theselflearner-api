const controller = require("../controllers/chat.controller");

module.exports = function (app) {
    app.post("/api/chat/sendmail", controller.sendEmailOnChatBot);
};
