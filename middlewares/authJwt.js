const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const enums = require("../enum");
const User = db.user;
const Role = db.role;
const { TokenExpiredError } = jwt;
var msgError = '';

const catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
        return res.status(401).send({ message: "Unauthorized! Access Token was expired!", code: 401 });
    }
    return res.sendStatus(401).send({ message: "Unauthorized!", code: 401 });
}

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(400).send({ message: "No token provided!", code: 400 });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return catchError(err, res);
        }
        req.userId = decoded.id;
        //if (req.clientIp != decoded.clientIp) return res.status(401).send({ message: "Unauthorized! You're not the right person!", code: 401 });
        next();
    });
};

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === enums.ADMIN) {
                        next();
                        return;
                    }
                }
                msgError = new Error("Require Admin Role!");
                res.status(200).send({ message: "Require Admin Role!", code: 403 });
                next(msgError);
                return;
            }
        );
    });
};

isModerator = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === enums.MODERATOR) {
                        next();
                        return;
                    }
                }
                msgError = new Error("Require Moderator Role!");
                res.status(200).send({ message: "Require Moderator Role!", code: 403 });
                next(msgError);
                return;
            }
        );
    });
};

isLoginAdminOrMod = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .populate("roles", "-__v")
    .exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === enums.ADMIN || roles[i].name === enums.MODERATOR) {
                        next();
                        return;
                    }
                }
                msgError = new Error("Require Admin Or Moderator Role!");
                res.status(200).send({ message: "Require Admin Or Moderator Role!", code: 403 });
                next(msgError);
                return;
            }
        );
    });
};

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator,
    isLoginAdminOrMod
};

module.exports = authJwt;
