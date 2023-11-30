"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const router = express_1.default.Router();
mongoose_1.default.connect('mongodb://localhost/my_db');
// User.find({ name: 'will', age: 20 }, (err, res) => {
//   console.log(res);
// });
/* GET home page. */
router.post('/login', function (req, res, next) {
    user_1.default.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        else {
            if (user && bcrypt_1.default.compareSync(req.body.password, user.password)) {
                req.session.regenerate(function (err) {
                    if (err)
                        next(err);
                    req.session.user = user;
                    req.session.save(function (err) {
                        if (err)
                            next(err);
                        res.json({ message: 'successfully logged in', user: user });
                    });
                });
            }
            else {
                res.json({ message: 'incorrect email address or password' });
            }
        }
    });
});
router.post('/signup', function (req, res, next) {
    user_1.default.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        if (user) {
            res.status(400).json({ error: 'the email has been registered' });
        }
        else {
            user_1.default.findOne({ username: req.body.username }, function (err, user) {
                if (err) {
                    res.status(404).json({ message: err.message });
                }
                if (user) {
                    res.status(400).json({ error: 'the username is already existed' });
                }
                else {
                    const saltRounds = 10;
                    bcrypt_1.default.genSalt(saltRounds, (err, salt) => {
                        bcrypt_1.default.hash(req.body.password, salt, (err, hash) => {
                            var newUser = new user_1.default({
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
            });
        }
    });
});
exports.default = router;
