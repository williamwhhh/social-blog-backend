var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/my_db');

var User = require('../models/user');
var Post = require('../models/post');
// User.find({ name: 'will', age: 20 }, (err, res) => {
//   console.log(res);
// });
const multer = require('multer');

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

router.post('/editAvatar', upload.single('avatar'), function (req, res) {
  console.log(req.body.email);
  console.log(req.file.filename);
  User.findOneAndUpdate(
    { email: req.body.email },
    { avatar: req.file.filename },
    (err, res) => {
      if (err) {
        console.log(err);
      }
    }
  );
  Post.updateMany(
    { email: req.body.email },
    { avatar: req.file.filename },
    (err, res) => {
      if (err) {
        console.log(err);
      }
    }
  );
  res.json({ avatar: req.file.filename });
});
module.exports = router;
