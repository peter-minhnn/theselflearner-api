const db = require("../models");
const User = db.user;
const Role = db.role;
var bcrypt = require("bcryptjs");

exports.getAll = (req, res) => {
    User.find().populate("roles", "-__v").exec((err, users) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        var sortUsers = users.sort().reverse();
        res.status(200).send({
            users: sortUsers,
            code: 200,
            message: 'Lấy dữ liệu thành công'
        });
    });
}

exports.findOne = (req, res) => {
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        
        res.status(200).send({
            user: user,
            code: 200,
            message: 'Lấy dữ liệu người dùng thành công'
        });
    });
}

exports.create = (req, res) => {
    const user = new User({
        fullname: req.body.fullname,
        email: req.body.email,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password, 8),
        rememberPwd: req.body.password,
        createdDate: new Date().toISOString(),
        creadtedUser: req.body.createdUser,
        updatedDate: "",
        updatedUser: "",
        status: req.body.status
    });
    user.save((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (req.body.roles) {
            Role.find(
                {
                    name: { $in: req.body.roles }
                },
                (err, roles) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    user.roles = roles.map(role => role._id);
                    user.save(err => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                        res.send({ message: "User was registered successfully!", code: 201 });
                    });
                }
            );
        } else {
            Role.findOne({ name: "user" }, (err, role) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                user.roles = role._id;
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    res.send({ message: "User was registered successfully!", code: 201 });
                });
            });
        }
    });
}

exports.update = (req, res) => {
    let updateData = {
        fullname: req.body.fullname,
        email: req.body.email,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password, 8),
        rememberPwd: req.body.password,
        updatedDate: new Date().toISOString(),
        updatedUser: req.body.updatedUser,
        roles: '',
        status: req.body.status
    }

    Role.find(
        {
            name: { $in: req.body.roles }
        },
        (err, roles) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            updateData.roles = roles.map(role => role._id);
            User.updateOne({ email: req.body.email }, updateData).exec((err, user) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                res.status(200).send({
                    code: 201,
                    message: 'User was updated successfully!'
                });
            });
        }
    );
}

exports.delete = (req, res) => {
    User.deleteOne({ '_id': req.body.id }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send({
            code: 201,
            message: 'User was deleted successfully!'
        });
    });
}