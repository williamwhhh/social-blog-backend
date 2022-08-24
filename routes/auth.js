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
  if (User.findOne({ email: req.body.email })) {
    var newUser = new User({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      DOB: req.body.DOB,
      gender: req.body.gender,
    });
    newUser.save();
    res.json({ message: 'signed up successfully' });
  } else {
    res.status(400).json({ message: 'user already exist' });
  }
});

// router.get('/:id([0-9]{5})', function (req, res) {
//   res.json({ name: 'willllllll' });
// });

module.exports = router;
