// server.js

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const db = require("./models");
const Role = db.role;
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://admin:bdWdCKJ1xWw9E1Zb@minhnn.3k3a3.mongodb.net/theselflearner_db?retryWrites=true&w=majority', { useNewUrlParser: true }).then(
    () => {
        console.log('Database is connected');
        initial();
    },
    err => { console.log('Can not connect to the database' + err) }
).catch(err => {
    console.error("Connection error", err);
    process.exit();
});

function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'user' to roles collection");
            });

            new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'moderator' to roles collection");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'admin' to roles collection");
            });
        }
    });
}

var allowlist = ['https://localhost:3000', 'https://www.tselflearner.com'];
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors());
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/course.routes")(app);
require("./routes/menu.routes")(app);
require("./routes/s3.routes")(app);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const PORT = process.env.PORT || 4001;
http.listen(PORT, function () {
    console.log('Server is running on Port:', PORT);
});

var STATIC_CHANNELS = [];
io.on('connection', (socket) => { // socket object may be used to send specific messages to the new connected client
    console.log('new client connected');
    socket.emit('connection', null);
    socket.on('channel-join', id => {
        console.log('channel join', id);
        STATIC_CHANNELS.forEach(c => {
            if (c.id === id) {
                if (c.sockets.indexOf(socket.id) == (-1)) {
                    c.sockets.push(socket.id);
                    c.participants++;
                    io.emit('channel', c);
                }
            } else {
                let index = c.sockets.indexOf(socket.id);
                if (index != (-1)) {
                    c.sockets.splice(index, 1);
                    c.participants--;
                    io.emit('channel', c);
                }
            }
        });

        return id;
    });

    socket.on('send-message', message => {
        STATIC_CHANNELS.forEach(c => {
            if (c.id === message.channel_id) {
                if (!c.messages) {
                    c.messages = [message];
                } else {
                    c.messages.push(message);
                }
                if (message.senderName === 'admin') c.incomingAdminMsg += 1;
                if (message.senderName !== 'admin') c.incomingUserMsg += 1;
            }
        });
        io.emit('message', message);
    });

    socket.on('create-user-channel', message => {
        let obj = {
            name: message.senderName,
            participants: 0,
            id: message.channel_id,
            sockets: [],
            incomingUserMsg: 0,
            incomingAdminMsg: 0,
        }
        let index = STATIC_CHANNELS.findIndex(x => x.id === obj.id);
        if (index === -1) STATIC_CHANNELS.push(obj);
        io.emit('user-channel', STATIC_CHANNELS);
    });

    socket.on('badge-notification', badgeNoti => {
        STATIC_CHANNELS.map(elem => {
            if (elem.id == badgeNoti.channel_id) {
                if (badgeNoti.type === 'admin') elem.incomingUserMsg = 0;
                if (badgeNoti.type === 'user') elem.incomingAdminMsg = 0;
            }
        })
        io.emit('user-badge-notification', STATIC_CHANNELS);
    });

    socket.on('is-typing-message', message => {
        io.emit('is-typing', message);
    });

    socket.on('disconnect', () => {
        STATIC_CHANNELS.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--;
                io.emit('channel', c);
            }
        });
    });
});

/**
 * @description This methos retirves the static channels
 */
app.get('/getChannels', (req, res) => {
    res.status(200).send({
        channels: STATIC_CHANNELS
    })
});