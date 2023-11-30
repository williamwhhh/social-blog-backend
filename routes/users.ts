import express from 'express';
import mongoose from 'mongoose';
import User from '../models/user';
import Post from '../models/post';
import multer from 'multer';
import fs from 'fs';

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

router.post('/editProfile', upload.single('avatar'), function (req, res) {
  var updateUser = () => {
    return new Promise<void>((resolve, reject) => {
      if (req.file) {
        User.findOneAndUpdate(
          { username: req.body.username },
          {
            name: req.body.name,
            DOB: req.body.DOB,
            avatar: req.file.filename,
          },
          (err: any, user: any) => {
            if (err) {
              reject(err);
            }
            if (user.avatar) {
              fs.unlinkSync(`./public/images/${user.avatar}`);
            }
            resolve();
          }
        );
      } else {
        User.findOneAndUpdate(
          { username: req.body.username },
          {
            name: req.body.name,
            DOB: req.body.DOB,
          },
          (err: any, user: any) => {
            if (err) {
              reject(err);
            }
            resolve();
          }
        );
      }
    });
  };
  var updatePosts = () => {
    return new Promise<void>((resolve, reject) => {
      if (req.file) {
        Post.updateMany(
          { username: req.body.username },
          { name: req.body.name, avatar: req.file ? req.file.filename : null },
          (err: any, val: any) => {
            if (err) {
              reject(err);
            }
            resolve();
          }
        );
      } else {
        Post.updateMany(
          { username: req.body.username },
          { name: req.body.name },
          (err: any, val: any) => {
            if (err) {
              reject(err);
            }
            resolve();
          }
        );
      }
    });
  };
  var updateComments = () => {
    return new Promise<void>((resolve, reject) => {
      User.findOne({ username: req.body.username }, (err: any, user: any) => {
        if (user) {
          var promise = (id: string) => {
            return new Promise<void>((resolve, reject) => {
              Post.findById(id, function (err: any, post: any) {
                if (err) {
                  reject(err);
                }
                if (post) {
                  for (let comment of post.comments) {
                    if (comment.username === user.username) {
                      comment.name = req.body.name;
                      if (req.file) {
                        comment.avatar = req.file.filename;
                      }
                    }
                  }
                  Post.findByIdAndUpdate(
                    id,
                    { comments: post.comments },
                    (err: any, val: any) => {
                      if (err) {
                        reject(err);
                      }
                      resolve();
                    }
                  );
                } else {
                  //post got deleted so does comment
                  user.commentedPosts.splice(
                    user.commentedPosts.indexOf(id),
                    1
                  );
                  User.findOneAndUpdate(
                    { username: req.body.username },
                    {
                      commentedPosts: user.commentedPosts,
                    },
                    (err: any, val: any) => {
                      if (err) {
                        reject(err);
                      }
                      resolve();
                    }
                  );
                }
              });
            });
          };
          let promises = user.commentedPosts.map((id: string) => promise(id));
          Promise.all(promises).then(
            (val) => {
              resolve();
            },
            (err) => {
              reject(err);
            }
          );
        } else {
          reject(err);
        }
      });
    });
  };
  Promise.all([updateUser(), updatePosts(), updateComments()]).then(
    (val) => {
      if (req.file) {
        res.json({
          name: req.body.name,
          DOB: req.body.DOB,
          avatar: req.file.filename,
        });
      } else {
        res.json({
          name: req.body.name,
          DOB: req.body.DOB,
        });
      }
    },
    (err) => {
      res.status(404).json({ message: err.message });
    }
  );
});

router.get('/getAllUsers', function (req, res) {
  User.find({}, function (err: any, users: any) {
    if (err) {
      res.status(404).json({ message: err.message });
    }
    let contacts: any[] = [];
    users.forEach((user: any) => {
      contacts.push({
        username: user.username,
        name: user.name,
        avatar: user.avatar,
      });
    });
    res.json({ contacts: contacts });
  });
});

export default router;
