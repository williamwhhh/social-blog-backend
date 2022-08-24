var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/my_db');

// var userSchema = mongoose.Schema({
//   name: String,
//   age: Number,
//   nationality: String,
// });
// var User = mongoose.model('user', userSchema);

// var newUser = new User({
//   name: 'will',
//   age: 20,
//   nationality: 'aus',
// });

// newUser.save();

// User.find({ name: 'will', age: 20 }, (err, res) => {
//   console.log(res);
// });

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send('welcome');
});

router.get('/:id([0-9]{5})', function (req, res) {
  res.json({ name: 'willllllll' });
});

module.exports = router;
