import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user';

const router = express.Router();
mongoose.connect('mongodb://localhost/my_db');
// User.find({ name: 'will', age: 20 }, (err, res) => {
//   console.log(res);
// });

/* GET home page. */
router.post('/login', function (req, res, next) {
  User.findOne({ email: req.body.email }, (err: any, user: any) => {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        req.session.regenerate(function (err) {
          if (err) next(err);

          (req.session as any).user = user;
          req.session.save(function (err) {
            if (err) next(err);
            res.json({ message: 'successfully logged in', user: user });
          });
        });
      } else {
        res.json({ message: 'incorrect email address or password' });
      }
    }
  });
});

router.post('/signup', function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err: any, user: any) {
    if (err) {
      res.status(404).json({ message: err.message });
    }
    if (user) {
      res.status(400).json({ error: 'the email has been registered' });
    } else {
      User.findOne(
        { username: req.body.username },
        function (err: any, user: any) {
          if (err) {
            res.status(404).json({ message: err.message });
          }
          if (user) {
            res.status(400).json({ error: 'the username is already existed' });
          } else {
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, (err, salt) => {
              bcrypt.hash(req.body.password, salt, (err, hash) => {
                var newUser = new User({
                  username: req.body.username,
                  name: req.body.name,
                  email: req.body.email,
                  password: hash,
                  DOB: req.body.DOB ? req.body.DOB : Date(),
                  gender: req.body.gender ? req.body.gender : null,
                });
                newUser.save();
                res.json({ message: 'signed up successfully' });
              });
            });
          }
        }
      );
    }
  });
});

export default router;
