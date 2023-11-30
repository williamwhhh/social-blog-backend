import express from 'express';
import mongoose from 'mongoose';
import User from '../models/user';
import Post from '../models/post';
import fs from 'fs';
import multer from 'multer';

const router = express.Router();
mongoose.connect('mongodb://localhost/my_db');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const user = (req.session as any).user;
    cb(null, user.username + '-' + Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/addPost', upload.array('images[]'), function (req, res) {
  let imagePaths: string[] = [];
  const files = (req as any).files;
  files.forEach((i: any) => {
    imagePaths.push(i.filename);
  });
  let date = new Date();
  var newPost = new Post({
    username: req.body.username,
    name: req.body.name,
    text: req.body.text,
    images: imagePaths,
    location: req.body.location,
    avatar: req.body.avatar,
    dateTime:
      date.toLocaleTimeString().slice(0) + ', ' + date.toDateString().slice(4),
    comments: [],
  });
  newPost.save(function (err: any, obj: any) {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      res.json({ message: 'Posted', post: obj });
    }
  });
});

router.post('/removePost', function (req, res) {
  Post.findByIdAndRemove(req.body.id, function (err: any, val: any) {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      req.body.images.forEach((image: string) => {
        fs.unlinkSync(`./public/images/${image}`);
      });
      res.json({ message: 'Deleted' });
    }
  });
});

router.get('/getAllPosts', function (req, res) {
  Post.find({}, function (err: any, posts: any) {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      res.json({ message: 'All Posts Loaded', posts: posts });
    }
  });
});

router.get('/getMyPosts', function (req, res) {
  Post.find(
    { username: req.headers.username },
    function (err: any, posts: any) {
      if (err) {
        res.status(404).json({ message: err.message });
      } else {
        res.json({ message: 'My Posts Loaded', posts: posts });
      }
    }
  );
});

router.get('/getPost', function (req, res) {
  Post.findById(req.headers.id, function (err: any, post: any) {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      res.json({ post: post });
    }
  });
});

router.post('/bookmark', function (req, response) {
  User.findOne({ email: req.body.email }, (err: any, res: any) => {
    if (err) {
      response.status(404).json({ message: err.message });
    }
    res.bookmarks.push(req.body.postId);
    User.findOneAndUpdate(
      { email: req.body.email },
      { bookmarks: res.bookmarks },
      (err: any, res: any) => {
        if (err) {
          response.status(404).json({ message: err.message });
        }
      }
    );
    response.json({ message: 'Added Bookmark', bookmarks: res.bookmarks });
  });
});

router.get('/getBookmarks', function (req, res) {
  User.findOne({ email: req.headers.email }, (err: any, user: any) => {
    if (err) {
      res.status(404).json({ message: err.message });
    }

    var promise = (id: string) => {
      return new Promise((resolve, reject) => {
        Post.findById(id, function (err: any, post: any) {
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

    let promises = user.bookmarks.map((id: any) => promise(id));

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
  User.findOne({ email: req.body.email }, (err: any, res: any) => {
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
      (err: any, res: any) => {
        if (err) {
          response.status(404).json({ message: err.message });
        }
      }
    );
    response.json({ message: 'removed bookmark', bookmarks: res.bookmarks });
  });
});

router.post('/likePost', function (req, response) {
  User.findOne({ email: req.body.email }, (err: any, res: any) => {
    if (err) {
      response.status(404).json({ message: err.message });
    }
    res.likedPosts.push(req.body.postId);
    User.findOneAndUpdate(
      { email: req.body.email },
      { likedPosts: res.likedPosts },
      (err: any, res: any) => {
        if (err) {
          response.status(404).json({ message: err.message });
        }
      }
    );
    response.json({ message: 'Liked', likedPosts: res.likedPosts });
  });
});

router.get('/getLikedPosts', function (req, res) {
  User.findOne({ email: req.headers.email }, (err: any, user: any) => {
    if (err) {
      res.status(404).json({ message: err.message });
    }

    var promise = (id: string) => {
      return new Promise((resolve, reject) => {
        Post.findById(id, function (err: any, post: any) {
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

    let promises = user.likedPosts.map((id: string) => promise(id));

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
  User.findOne({ email: req.body.email }, (err: any, res: any) => {
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
      (err: any, res: any) => {
        if (err) {
          response.status(404).json({ message: err.message });
        }
      }
    );
    response.json({
      message: 'unliked the post',
      likedPosts: res.likedPosts,
    });
  });
});

router.post('/addComment', upload.array('images[]'), function (req, res) {
  let imagePaths: string[] = [];
  const files = (req as any).files;
  files.forEach((i: any) => {
    imagePaths.push(i.filename);
  });
  var comments: any[] = [];

  const updatePost = new Promise<void>((resolve, reject) => {
    Post.findById(req.body.postId, (err: any, val: any) => {
      if (err) {
        reject(err);
      }
      let date = new Date();
      val.comments.push({
        username: req.body.username,
        name: req.body.name,
        text: req.body.text,
        images: imagePaths,
        location: req.body.location,
        avatar: req.body.avatar,
        dateTime:
          date.toLocaleTimeString() + ', ' + date.toDateString().slice(4),
      });
      Post.findByIdAndUpdate(
        req.body.postId,
        { comments: val.comments },
        (err: any, val2: any) => {
          if (err) {
            reject(err);
          }
          comments = val.comments;
          resolve();
        }
      );
    });
  });

  const updateUser = new Promise<void>((resolve, reject) => {
    User.findOne({ username: req.body.username }, (err: any, val: any) => {
      if (err) {
        reject(err);
      }
      if (val.commentedPosts.includes(req.body.postId)) {
        resolve();
        return;
      }
      val.commentedPosts.push(req.body.postId);
      User.findOneAndUpdate(
        { username: req.body.username },
        { commentedPosts: val.commentedPosts },
        (err: any, val2: any) => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  });

  Promise.all([updatePost, updateUser]).then(
    (val) => {
      res.json({
        message: 'Added a comment',
        comments: comments,
      });
    },
    (err) => {
      res.status(404).json({ message: err.message });
    }
  );
});

router.post('/removeComment', async function (req, res) {
  const updatePost = new Promise((resolve, reject) => {
    Post.findById(req.body.postId, function (err: any, val: any) {
      if (err) {
        reject();
      } else {
        for (let i = 0; i < val.comments.length; i++) {
          if (
            val.comments[i].username === req.body.username &&
            val.comments[i].text === req.body.text
          ) {
            val.comments.splice(i, 1);
            req.body.images.forEach((image: string) => {
              fs.unlinkSync(`./public/images/${image}`);
            });
            break;
          }
        }
        Post.findByIdAndUpdate(
          req.body.postId,
          { comments: val.comments },
          (err: any, val2: any) => {
            if (err) {
              reject();
            }
            resolve(val.comments);
          }
        );
      }
    });
  });

  const updateUser = (comments: any) =>
    new Promise<void>((resolve, reject) => {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].username === req.body.username) {
          resolve();
          res.json({
            message: 'Deleted a comment',
            comments: comments,
          });
          return;
        }
      }
      User.findOne({ username: req.body.username }, (err: any, val: any) => {
        if (err) {
          reject(err);
        }
        val.commentedPosts.splice(
          val.commentedPosts.indexOf(req.body.postId),
          1
        );
        User.findOneAndUpdate(
          { username: req.body.username },
          { commentedPosts: val.commentedPosts },
          (err: any, val2: any) => {
            if (err) {
              reject(err);
            }
            resolve(comments);
            res.json({
              message: 'Deleted a comment',
              comments: comments,
            });
          }
        );
      });
    });

  updatePost.then(
    (val) => updateUser(val),
    (err) => {
      res.status(404).json({ message: err.message });
    }
  );
});

export default router;
