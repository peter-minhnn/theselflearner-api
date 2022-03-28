const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateEmail = (req, res, next) => {
    // Email
    var msgError = '';
    var isCheck = true;

    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            next(err);
            res.status(500).send({ message: err });
            return;
        }
        if (user) {
            isCheck = false;
            msgError = new Error('Failed! Email is already in use!');
            res.status(200).send({ message: 'Failed! Email is already in use!', code: 400 });
            next(msgError);
            return;
        }
        else next();
    });
};

checkRolesExisted = (req, res, next) => {
    var msgError = '';
    var isCheck = true;
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                isCheck = false;
                msgError = new Error(`Failed! Role ${req.body.roles[i]} does not exist!`);
                res.status(200).send({ message: `Failed! Role ${req.body.roles[i]} does not exist!`, code: 400 });
                next(msgError);
                return;
            }
        }
    }
    if (isCheck) next();
};

const verifySignUp = {
    checkDuplicateEmail,
    checkRolesExisted
};

module.exports = verifySignUp;
