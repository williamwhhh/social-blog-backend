var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/my_db');

var User = require('../models/user');
var Post = require('../models/post');
var fs = require('fs');
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
    comments: [],
  });
  newPost.save(function (err, obj) {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      res.json({ message: 'Posted', post: obj });
    }
  });
});

router.post('/removePost', function (req, res) {
  Post.findByIdAndRemove(req.body.id, function (err, val) {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      req.body.images.forEach((image) => {
        fs.unlinkSync(`./public/images/${image}`);
      });
      res.json({ message: 'Deleted' });
    }
  });
});

router.get('/getAllPosts', function (req, res) {
  Post.find({}, function (err, posts) {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      res.json({ message: 'All Posts Loaded', posts: posts });
    }
  });
});

router.get('/getPost', function (req, res) {
  Post.findById(req.headers.id, function (err, post) {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      res.json({ post: post });
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
    response.json({ message: 'Added Bookmark', bookmarks: res.bookmarks });
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
          if (post) {
            resolve(post);
          } else {
            resolve({
              _id: id,
              name: '',
              username: '',
              text: 'This post has been deleted by its poster',
              images: [],
              avatar: null,
            });
          }
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

router.post('/removeBookmark', function (req, response) {
  User.findOne({ email: req.body.email }, (err, res) => {
    if (err) {
      response.status(404).json({ message: err.message });
    }
    let index = res.bookmarks.indexOf(req.body.postId);
    if (index !== -1) {
      res.bookmarks.splice(index, 1);
    }
    User.findOneAndUpdate(
      { email: req.body.email },
      { bookmarks: res.bookmarks },
      (err, res) => {
        if (err) {
          response.status(404).json({ message: err.message });
        }
      }
    );
    response.json({ message: 'removed bookmark', bookmarks: res.bookmarks });
  });
});

router.post('/likePost', function (req, response) {
  User.findOne({ email: req.body.email }, (err, res) => {
    if (err) {
      response.status(404).json({ message: err.message });
    }
    res.likedPosts.push(req.body.postId);
    User.findOneAndUpdate(
      { email: req.body.email },
      { likedPosts: res.likedPosts },
      (err, res) => {
        if (err) {
          response.status(404).json({ message: err.message });
        }
      }
    );
    response.json({ message: 'Liked', likedPosts: res.likedPosts });
  });
});

router.get('/getLikedPosts', function (req, res) {
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
          if (post) {
            resolve(post);
          } else {
            resolve({
              _id: id,
              name: '',
              username: '',
              text: 'This post has been deleted by its poster',
              images: [],
              avatar: null,
            });
          }
        });
      });
    };

    let promises = user.likedPosts.map((id) => promise(id));

    Promise.all(promises).then(
      (val) => {
        res.json({ message: 'liked posts loaded', likedPosts: val });
      },
      (err) => {
        res.status(404).json({ message: err.message });
      }
    );
  });
});

router.post('/unlikePost', function (req, response) {
  User.findOne({ email: req.body.email }, (err, res) => {
    if (err) {
      response.status(404).json({ message: err.message });
    }
    let index = res.likedPosts.indexOf(req.body.postId);
    if (index !== -1) {
      res.likedPosts.splice(index, 1);
    }
    User.findOneAndUpdate(
      { email: req.body.email },
      { likedPosts: res.likedPosts },
      (err, res) => {
        if (err) {
          response.status(404).json({ message: err.message });
        }
      }
    );
    response.json({ message: 'unliked the post', likedPosts: res.likedPosts });
  });
});

router.post('/addComment', upload.array('images[]'), function (req, res) {
  let imagePaths = [];
  req.files.forEach((i) => {
    imagePaths.push(i.filename);
  });
  Post.findById(req.body.postId, (err, val) => {
    if (err) {
      res.status(404).json({ message: err.message });
    }

    val.comments.push({
      username: req.body.username,
      name: req.body.name,
      text: req.body.text,
      images: imagePaths,
      location: req.body.location,
      avatar: req.body.avatar,
    });
    Post.findByIdAndUpdate(
      req.body.postId,
      { comments: val.comments },
      (err, val2) => {
        if (err) {
          res.status(404).json({ message: err.message });
        }
        res.json({
          message: 'Added a comment',
          comments: val.comments,
        });
      }
    );
  });
});

router.post('/removeComment', function (req, res) {
  Post.findById(req.body.postId, function (err, val) {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      for (let i = 0; i < val.comments.length; i++) {
        if (
          val.comments[i].username === req.body.username &&
          val.comments[i].text === req.body.text
        ) {
          val.comments.splice(i, 1);
          req.body.images.forEach((image) => {
            fs.unlinkSync(`./public/images/${image}`);
          });
          break;
        }
      }
      Post.findByIdAndUpdate(
        req.body.postId,
        { comments: val.comments },
        (err, val2) => {
          if (err) {
            res.status(404).json({ message: err.message });
          }
          res.json({
            message: 'Deleted a comment',
            comments: val.comments,
          });
        }
      );
    }
  });
});

module.exports = router;
