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

router.post('/editProfile', upload.single('avatar'), function (req, resp) {
  if (req.file) {
    User.findOneAndUpdate(
      { email: req.body.email },
      { name: req.body.name, DOB: req.body.DOB, avatar: req.file.filename },
      (err, res) => {
        if (err) {
          resp.status(404).json({ message: err.message });
        }
        if (res.avatar) {
          fs.unlinkSync(`./public/images/${res.avatar}`);
        }
      }
    );
    Post.updateMany(
      { email: req.body.email },
      { name: req.body.name, avatar: req.file.filename },
      (err, res) => {
        if (err) {
          resp.status(404).json({ message: err.message });
        }
      }
    );
    resp.json({
      name: req.body.name,
      DOB: req.body.DOB,
      avatar: req.file.filename,
    });
  } else {
    User.findOneAndUpdate(
      { email: req.body.email },
      { name: req.body.name, DOB: req.body.DOB },
      (err, res) => {
        if (err) {
          resp.status(404).json({ message: err.message });
        }
      }
    );
    Post.updateMany(
      { email: req.body.email },
      { name: req.body.name },
      (err, res) => {
        if (err) {
          resp.status(404).json({ message: err.message });
        }
      }
    );
    resp.json({
      name: req.body.name,
      DOB: req.body.DOB,
    });
  }
});

module.exports = router;
