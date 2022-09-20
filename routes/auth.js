var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/my_db');

var User = require('../models/user');

// User.find({ name: 'will', age: 20 }, (err, res) => {
//   console.log(res);
// });

/* GET home page. */
router.post('/login', function (req, res, next) {
  User.findOne({ email: req.body.email }, (err, arr) => {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      if (arr && arr.password === req.body.password) {
        res.json({ message: 'successfully logged in', user: arr });
      } else {
        res.json({ message: 'incorrect email address or password' });
      }
    }
  });
});

router.post('/signup', function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      res.status(404).json({ message: err.message });
    }
    if (user) {
      res.status(400).json({ error: 'the email has been registered' });
    } else {
      User.findOne({ username: req.body.username }, function (err, user) {
        if (err) {
          res.status(404).json({ message: err.message });
        }
        if (user) {
          res.status(400).json({ error: 'the username is already existed' });
        } else {
          var newUser = new User({
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            DOB: req.body.DOB ? req.body.DOB : Date(),
            gender: req.body.gender ? req.body.gender : null,
          });
          newUser.save();
          res.json({ message: 'signed up successfully' });
        }
      });
    }
  });
});

module.exports = router;
