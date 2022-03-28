const db = require("../models");
const Menu = db.menu;

exports.getAll = (req, res) => {
    Menu.find().exec((err, menus) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send({
            result: menus,
            code: 200,
            message: 'Get all users successfully!'
        });
    });
}

exports.create = (req, res) => {
    const menu = new Menu({
        name: req.body.name,
        parentIdx: req.body.parentIdx,
        path: req.body.path,
        status: '0',
        createdDate: new Date().toISOString(),
        creadtedUser: req.body.createdUser,
        updatedDate: "",
        updatedUser: ""
    });
    menu.save((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        res.send({ message: "Menu was registered successfully!", code: 201 });
    });
}

exports.update = (req, res) => {
    let updateData = {};
    if (req.body.menus) {
        req.body.menus.forEach(o => {
            updateData = {
                name: o.name,
                parentIdx: o.parentIdx,
                path: o.path,
                status: o.status,
                updatedDate: new Date().toISOString(),
                updatedUser: o.updatedUser
            }
            Menu.updateOne({ '_id': o._id }, updateData).exec((err, menu) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
            });
        })
        res.status(200).send({
            code: 201,
            message: 'Menu was updated successfully!'
        });
    }
    else {
        updateData = {
            name: req.body.name,
            parentIdx: req.body.parentIdx,
            path: req.body.path,
            status: req.body.status,
            updatedDate: new Date().toISOString(),
            updatedUser: req.body.updatedUser
        }
        Menu.updateOne({ '_id': req.body._id }, updateData).exec((err, menu) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            res.status(200).send({
                code: 201,
                message: 'Menu was updated successfully!'
            });
        });
    }
}

exports.delete = (req, res) => {
    Menu.deleteOne({ '_id': req.body.id }).exec((err, result) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send({
            code: 201,
            message: 'Menu was deleted successfully!'
        });
    });
}