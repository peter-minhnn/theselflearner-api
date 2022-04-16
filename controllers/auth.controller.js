require('dotenv').config();
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Evaluate = db.evaluate;
const Class = db.class;
const Role = db.role;
const RefreshToken = db.refreshToken;
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
        return res.status(200).send({ message: "Unauthorized! Access Token was expired!", code: 401 });
    }
    return res.status(200).send({ message: "Unauthorized!", code: 401 });
}

exports.signup = (req, res) => {
    const user = new User({
        fullname: req.body.fullname,
        email: req.body.email,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password, 8),
        rememberPwd: req.body.password,
        avatar: req.body.avatar,
        createdDate: new Date().toISOString(),
        createdUser: ""
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
                        res.send({ message: "Đăng ký thành công", code: 201 });
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
                    res.send({ message: "Đăng ký thành công", code: 201 });
                });
            });
        }
    });
};

exports.signin = (req, res) => {
    User.findOne({
        email: req.body.email
    })
        .populate("roles", "-__v")
        .exec(async (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if (!user) {
                return res.status(200).send({ message: "Email không tồn tại", code: 403 });
            }
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            //Check invalid password
            if (!passwordIsValid) {
                return res.status(200).send({
                    accessToken: null,
                    message: "Invalid Password!",
                    code: 400
                });
            }
            //Save ip user in case of trouble
            User.updateOne({ email: req.body.email }, { clientIp: req.clientIp }).exec();

            //Create token authorize for user
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            //Create refresh token
            let refreshToken = await RefreshToken.createToken(user);

            //Create roles for user
            // var authorities = [];
            // for (let i = 0; i < user.roles.length; i++) {
            //     authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            // }

            res.status(200).send({
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                phone: user.phone,
                roles: user.roles.name,
                avatar: user.avatar,
                accessToken: token,
                page: 'user',
                refreshToken: refreshToken,
                code: 201,
                message: 'Đăng nhập thành công'
            });
        });
};

exports.refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;
    if (requestToken == null) {
        return res.status(403).json({ message: "Refresh Token is required!", code: 403 });
    }
    try {
        let refreshToken = await RefreshToken.findOne({ token: requestToken });
        if (!refreshToken) {
            res.status(403).json({ message: "Refresh token is not in database!", code: 403 });
            return;
        }
        if (RefreshToken.verifyExpiration(refreshToken)) {
            RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

            res.status(403).json({
                message: "Refresh token was expired. Please make a new signin request",
                code: 403
            });
            return;
        }
        let newAccessToken = jwt.sign({ id: refreshToken.user._id }, config.secret, {
            expiresIn: config.jwtExpiration,
        });
        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token,
            code: 201
        });
    } catch (err) {
        return res.status(500).send({ message: err, code: 500 });
    }
};

exports.signinAdmin = (req, res) => {
    User.findOne({
        email: req.body.email
    })
        .populate("roles", "-__v")
        .exec(async (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if (!user) {
                return res.status(200).send({ message: "Email không tồn tại", code: 400 });
            }
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            if (!passwordIsValid) {
                return res.status(200).send({
                    accessToken: null,
                    message: "Mật khẩu không hợp lệ",
                    code: 400
                });
            }

            //Create token authorize for user
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 60 * 60 //1 hour
            });

            //Create refresh token authorize token
            let refreshToken = await RefreshToken.createToken(user);

            //Create roles for user
            // var authorities = [];
            // for (let i = 0; i < user.roles.length; i++) {
            //     authorities.push(user.roles[i].name.toLowerCase());
            // }

            res.status(200).send({
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                phone: user.phone,
                roles: user.roles.name,
                accessToken: token,
                refreshToken: refreshToken,
                page: 'admin',
                code: 201,
                message: 'Đăng nhập trang quản lý thành công'
            });
        });
};

exports.checkTokenExpire = (req, res) => {
    let token = req.body.token;
    if (!token) {
        return res.status(200).send({ message: "No token provided!", code: 403 });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return catchError(err, res);
        }
        req.userId = decoded.id;
        res.status(200).send({ message: 'Token is valid!', code: 200 });
    });
}

exports.deleteRefreshToken = (req, res) => {
    RefreshToken.deleteOne({
        token: req.body.refreshToken
    }).exec((err, result) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        res.status(200).send({ message: 'Delete refresh token successfully!', code: 200 });
    });
}

exports.sendEmailResetPws = (req, res) => {
    // initialize nodemailer
    const transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
        auth: {
            user: process.env.EMAILNAME,
            pass: process.env.SMTP_PWD,
        },
        secure: true,
    });

    var mailOptions = {};
    mailOptions = {
        from: process.env.EMAILNAME, // sender address
        to: req.body.email
    };
    // point to the template folder
    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./mail-template/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./mail-template/'),
    };

    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))

    if (req.body.type === 'provider') {
        mailOptions.subject = 'Chào mừng bạn đến với The Self-learner';
        mailOptions.template = 'registered';
        mailOptions.context = {
            provider: '',
            password: req.body.password,
            homeUrl: req.body.homeUrl
        };
        if (req.body.provider) mailOptions.context.provider = `Tài khoản của bạn đã được tạo mới thông qua đăng nhập với ${req.body.provider}`;
    }

    // trigger the sending of the E-mail
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        res.status(200).send({
            code: 201,
            message: 'Gửi email thành công'
        })
    });
}

exports.findUser = (req, res) => {
    User.findOne({
        email: req.body.provider.email
    }).populate("roles", "-__v").exec(async (err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (!user) {
            return res.status(200).send({ message: "Email không tồn tại", code: 400 });
        }
        if (!user.avatar) {
            User.updateOne(
                { '_id': user._id },
                {
                    avatar: req.body.provider.imageUrl ?? '',
                    fullname: req.body.provider.name ?? ''
                }
            ).exec();
        }

        //Create token authorize for user
        var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 60 * 60 //1 hour
        });

        //Create refresh token authorize token
        let refreshToken = await RefreshToken.createToken(user);

        User.findOne({
            email: req.body.provider.email
        }).populate("roles", "-__v").exec(async (err, userUpdate) => {
            if (userUpdate) {
                res.status(200).send({
                    id: userUpdate._id,
                    email: userUpdate.email,
                    fullname: userUpdate.fullname,
                    phone: userUpdate.phone,
                    avatar: userUpdate.avatar,
                    roles: userUpdate.roles.name,
                    status: userUpdate.status,
                    accessToken: token,
                    refreshToken: refreshToken,
                    code: 200,
                    message: 'Đăng nhập thành công'
                });
            }
            else {
                res.status(200).send({
                    code: 204,
                    message: 'Tài khoản không tồn tại'
                });
            }
        })

    });
}

exports.updateProfile = (req, res) => {
    User.findOne({
        email: req.body.email
    }).populate("roles", "-__v").exec(async (err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (!user) {
            return res.status(200).send({ message: "Email không tồn tại", code: 400 });
        }

        if (req.body.oldpassword && req.body.password) {
            var passwordIsValid = bcrypt.compareSync(
                req.body.oldpassword,
                user.password
            );

            //Check invalid password
            if (!passwordIsValid) {
                return res.status(200).send({
                    accessToken: null,
                    message: "Mật khẩu không hợp lệ",
                    code: 400
                });
            }
        }

        let updateUser = {
            fullname: req.body.fullname ? req.body.fullname : user.fullname,
            phone: req.body.phone ? req.body.phone : user.phone,
            password: req.body.password ? bcrypt.hashSync(req.body.password, 8) : user.password,
            rememberPwd: req.body.password ? req.body.password : user.rememberPwd,
            avatar: req.body.avatar ? req.body.avatar : user.avatar,
            updatedUser: req.body.updatedUser,
            updatedDate: new Date().toISOString()
        }

        Evaluate.updateMany({ 'studentEmail': req.body.email },
            {
                studentName: updateUser.fullname,
                studentPhone: updateUser.phone,
                studentAvatar: updateUser.avatar,
                updatedUser: updateUser.updatedUser,
                updatedDate: new Date().toISOString()
            }).exec((errorUpdateEva, newEva) => {
                if (errorUpdateEva) {
                    res.status(500).send({ message: errorUpdateEva });
                    return;
                }
                if (newEva.modifiedCount == 1) {
                    console.log('Cập nhật thông tin đánh giá thành công.')
                }
            });

        Class.updateMany({ 'studentEmail': req.body.email },
            {
                studentName: updateUser.fullname,
                studentPhone: updateUser.phone,
                updatedUser: updateUser.updatedUser,
                updatedDate: new Date().toISOString()
            }).exec((errorUpdateEva, newEva) => {
                if (errorUpdateEva) {
                    res.status(500).send({ message: errorUpdateEva });
                    return;
                }
                if (newEva.modifiedCount == 1) {
                    console.log('Cập nhật thông tin lớp học thành công.')
                }
            });

        User.updateOne({ 'email': req.body.email }, updateUser).exec((err, updated) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if (updated.modifiedCount == 1) {
                User.findOne({
                    email: req.body.email
                }).populate("roles", "-__v").exec(async (err, newUser) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    if (newUser) {
                        res.status(200).send({
                            fullname: newUser.fullname,
                            phone: newUser.phone,
                            avatar: newUser.avatar,
                            code: 201,
                            message: 'Cập nhật thông tin tài khoản thành công'
                        });
                    }
                    else {
                        res.status(200).send({
                            code: 403,
                            message: 'Không tìm tháy thông tin tài khoản'
                        });
                    }
                })
            } else {
                res.status(200).send({
                    code: 403,
                    message: 'Cập nhật không thành công'
                });
            }
        })
    });
}