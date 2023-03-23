var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

mongoose.connect('mongodb://localhost/my_db');

var User = require('../models/user');
var Room = require('../models/room');

router.get('/getRoomDetails', function (req, res) {
  Room.findOne(
    {
      $or: [
        { participants: [req.headers.user1, req.headers.user2] },
        { participants: [req.headers.user2, req.headers.user1] },
      ],
    },
    function (err, room) {
      if (err) {
        res.status(404).json({ message: err.message });
      }
      if (room) {
        res.json({ roomId: room._id, messages: room.messages });
      } else {
        var newRoom = new Room({
          participants: [req.headers.user1, req.headers.user2],
        });
        newRoom.save().then((room) => {
          res.json({ roomId: room._id, messages: [] });
        });
      }
    }
  );
});

router.get('/deleteRoom', function (req, res) {
  Room.findOneAndDelete(
    {
      $or: [
        { participants: [req.headers.user1, req.headers.user2] },
        { participants: [req.headers.user2, req.headers.user1] },
      ],
    },
    function (err, val) {
      if (err) {
        res.status(404).json({ message: err.message });
      }
      if (val) {
        res.json({ messages: 'Deleted' });
      }
    }
  );
});

router.get('/getContacts', function (req, res) {
  Room.find({ participants: req.headers.username }, function (err, rooms) {
    if (err) {
      res.status(404).json({ message: err.message });
    }
    if (rooms) {
      contacts = [];
      for (let room of rooms) {
        contacts = contacts.concat(
          room.participants.filter((p) => p !== req.headers.username)
        );
      }
      User.find({ username: { $all: contacts } }, function (err, users) {
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
  Room.findById(req.body.roomId, (err, room) => {
    let date = new Date();
    room.messages.push({
      sender: req.body.sender,
      receiver: req.body.receiver,
      message: req.body.message,
      dateTime: date,
    });
    Room.findByIdAndUpdate(
      req.body.roomId,
      { messages: room.messages },
      (err, val) => {
        if (err) {
          res.status(404).json({ message: err.message });
        } else {
          res.json({ message: 'message sent' });
        }
      }
    );
  });
});

const httpServer = createServer(express);
const io = new Server(httpServer, {
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

module.exports = router;
