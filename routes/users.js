var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/my_db');

var User = require('../models/user');
var Post = require('../models/post');

const multer = require('multer');
var fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + '-' + Math.random().toString() + '-' + file.originalname
    );
  },
});

const upload = multer({ storage: storage });

router.post('/editProfile', upload.single('avatar'), function (req, res) {
  if (req.file) {
    var updateUser = () => {
      return new Promise((resolve, reject) => {
        User.findOneAndUpdate(
          { username: req.body.username },
          { name: req.body.name, DOB: req.body.DOB, avatar: req.file.filename },
          (err, user) => {
            if (err) {
              reject(err);
            }
            if (user.avatar) {
              fs.unlinkSync(`./public/images/${user.avatar}`);
            }
            resolve();
          }
        );
      });
    };
    var updatePosts = () => {
      return new Promise((resolve, reject) => {
        Post.updateMany(
          { username: req.body.username },
          { name: req.body.name, avatar: req.file.filename },
          (err, val) => {
            if (err) {
              reject(err);
            }
            resolve();
          }
        );
      });
    };
    Promise.all([updateUser(), updatePosts()]).then(
      (val) => {
        res.json({
          message: 'profile updated',
          name: req.body.name,
          DOB: req.body.DOB,
          avatar: req.file.filename,
        });
      },
      (err) => {
        res.status(404).json({ message: err.message });
      }
    );
  } else {
    var updateUser = () => {
      return new Promise((resolve, reject) => {
        User.findOneAndUpdate(
          { username: req.body.username },
          { name: req.body.name, DOB: req.body.DOB },
          (err, user) => {
            if (err) {
              reject(err);
            }
            resolve();
          }
        );
      });
    };
    var updatePosts = () => {
      return new Promise((resolve, reject) => {
        Post.updateMany(
          { username: req.body.username },
          { name: req.body.name },
          (err, val) => {
            if (err) {
              reject(err);
            }
            resolve();
          }
        );
      });
    };
    Promise.all([updateUser(), updatePosts()]).then(
      (val) => {
        res.json({
          message: 'profile updated',
          name: req.body.name,
          DOB: req.body.DOB,
        });
      },
      (err) => {
        res.status(404).json({ message: err.message });
      }
    );
  }
});

router.get('/getAllUsers', function (req, res) {
  User.find({}, function (err, users) {
    if (err) {
      res.status(404).json({ message: err.message });
    }
    res.json({ users: users });
  });
});

module.exports = router;
