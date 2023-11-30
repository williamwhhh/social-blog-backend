"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const user_1 = __importDefault(require("../models/user"));
const room_1 = __importDefault(require("../models/room"));
const router = express_1.default.Router();
mongoose_1.default.connect('mongodb://localhost/my_db');
router.get('/getRoomDetails', function (req, res) {
    room_1.default.findOne({
        $or: [
            { participants: [req.headers.user1, req.headers.user2] },
            { participants: [req.headers.user2, req.headers.user1] },
        ],
    }, function (err, room) {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        if (room) {
            res.json({ roomId: room._id, messages: room.messages });
        }
        else {
            var newRoom = new room_1.default({
                participants: [req.headers.user1, req.headers.user2],
            });
            newRoom.save().then((room) => {
                res.json({ roomId: room._id, messages: [] });
            });
        }
    });
});
router.get('/deleteRoom', function (req, res) {
    room_1.default.findOneAndDelete({
        $or: [
            { participants: [req.headers.user1, req.headers.user2] },
            { participants: [req.headers.user2, req.headers.user1] },
        ],
    }, function (err, val) {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        if (val) {
            res.json({ messages: 'Deleted' });
        }
    });
});
router.get('/getContacts', function (req, res) {
    room_1.default.find({ participants: req.headers.username }, function (err, rooms) {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        if (rooms) {
            let contacts = [];
            for (let room of rooms) {
                contacts = contacts.concat(room.participants.filter((p) => p !== req.headers.username));
            }
            user_1.default.find({ username: { $all: contacts } }, function (err, users) {
                if (err) {
                    res.status(404).json({ message: err.message });
                }
                let contacts = [];
                users.forEach((user) => {
                    contacts.push({
                        username: user.username,
                        name: user.name,
                        avatar: user.avatar,
                    });
                });
                res.json({ contacts: contacts });
            });
        }
    });
});
router.post('/sendMessage', function (req, res) {
    room_1.default.findById(req.body.roomId, (err, room) => {
        let date = new Date();
        room.messages.push({
            sender: req.body.sender,
            receiver: req.body.receiver,
            message: req.body.message,
            dateTime: date,
        });
        room_1.default.findByIdAndUpdate(req.body.roomId, { messages: room.messages }, (err, val) => {
            if (err) {
                res.status(404).json({ message: err.message });
            }
            else {
                res.json({ message: 'message sent' });
            }
        });
    });
});
const httpServer = (0, http_1.createServer)(express_1.default);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: true,
        credentials: true,
    },
});
io.on('connection', (socket) => {
    // console.log('A user connected');
    let connRoomId;
    socket.on('room', (roomId) => {
        socket.join(roomId);
        connRoomId = roomId;
        // console.log(socket.rooms);
    });
    socket.on('sendMessage', (data) => {
        // console.log(data);
        socket.to(connRoomId).emit('message', data);
    });
});
httpServer.listen(8080);
exports.default = router;
