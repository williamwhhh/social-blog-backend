var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/my_db');

var User = require('../models/user');
var Post = require('../models/post');

const multer = require('multer');
const { resolveContent } = require('nodemailer/lib/shared');

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

// User.find({ name: 'will', age: 20 }, (err, res) => {
//   console.log(res);
// });
router.post('/addPost', upload.array('images[]'), function (req, res) {
  let imagePaths = [];
  req.files.forEach((i) => {
    imagePaths.push(i.filename);
  });
  var newPost = new Post({
    username: req.body.username,
    name: req.body.name,
    text: req.body.text,
    images: imagePaths,
    location: req.body.location,
    avatar: req.body.avatar,
  });
  newPost.save(function (err, obj) {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.json({ message: 'Posted', post: obj });
    }
  });
});

router.get('/getAllPosts', function (req, res) {
  Post.find({}, function (err, posts) {
    if (err) {
      res.json({ message: err.message });
    } else {
      console.log(posts);
      res.json({ message: 'Posts loaded', posts: posts });
    }
  });
});

router.post('/bookmark', function (req, response) {
  User.findOne({ email: req.body.email }, (err, res) => {
    if (err) {
      response.status(404).json({ message: err.message });
    }
    res.bookmarks.push(req.body.postId);
    User.findOneAndUpdate(
      { email: req.body.email },
      { bookmarks: res.bookmarks },
      (err, res) => {
        if (err) {
          response.status(404).json({ message: err.message });
        }
      }
    );
    response.json({ message: 'added bookmark', bookmarks: res.bookmarks });
  });
});

router.get('/getBookmarks', function (req, res) {
  User.findOne({ email: req.headers.email }, (err, user) => {
    if (err) {
      res.status(404).json({ message: err.message });
    }

    var promise = (id) => {
      return new Promise((resolve, reject) => {
        Post.findById(id, function (err, post) {
          if (err) {
            reject(err);
          }
          resolve(post);
        });
      });
    };

    let promises = user.bookmarks.map((id) => promise(id));

    Promise.all(promises).then(
      (val) => {
        res.json({ message: 'bookmarks loaded', bookmarks: val });
      },
      (err) => {
        res.status(404).json({ message: err.message });
      }
    );
  });
});

module.exports = router;
