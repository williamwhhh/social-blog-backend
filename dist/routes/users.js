"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/user"));
const post_1 = __importDefault(require("../models/post"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
mongoose_1.default.connect('mongodb://localhost/my_db');
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        const user = req.session.user;
        cb(null, user.username + '-' + Date.now() + '-' + file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
router.post('/editProfile', upload.single('avatar'), function (req, res) {
    var updateUser = () => {
        return new Promise((resolve, reject) => {
            if (req.file) {
                user_1.default.findOneAndUpdate({ username: req.body.username }, {
                    name: req.body.name,
                    DOB: req.body.DOB,
                    avatar: req.file.filename,
                }, (err, user) => {
                    if (err) {
                        reject(err);
                    }
                    if (user.avatar) {
                        fs_1.default.unlinkSync(`./public/images/${user.avatar}`);
                    }
                    resolve();
                });
            }
            else {
                user_1.default.findOneAndUpdate({ username: req.body.username }, {
                    name: req.body.name,
                    DOB: req.body.DOB,
                }, (err, user) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            }
        });
    };
    var updatePosts = () => {
        return new Promise((resolve, reject) => {
            if (req.file) {
                post_1.default.updateMany({ username: req.body.username }, { name: req.body.name, avatar: req.file ? req.file.filename : null }, (err, val) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            }
            else {
                post_1.default.updateMany({ username: req.body.username }, { name: req.body.name }, (err, val) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            }
        });
    };
    var updateComments = () => {
        return new Promise((resolve, reject) => {
            user_1.default.findOne({ username: req.body.username }, (err, user) => {
                if (user) {
                    var promise = (id) => {
                        return new Promise((resolve, reject) => {
                            post_1.default.findById(id, function (err, post) {
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
                                    post_1.default.findByIdAndUpdate(id, { comments: post.comments }, (err, val) => {
                                        if (err) {
                                            reject(err);
                                        }
                                        resolve();
                                    });
                                }
                                else {
                                    //post got deleted so does comment
                                    user.commentedPosts.splice(user.commentedPosts.indexOf(id), 1);
                                    user_1.default.findOneAndUpdate({ username: req.body.username }, {
                                        commentedPosts: user.commentedPosts,
                                    }, (err, val) => {
                                        if (err) {
                                            reject(err);
                                        }
                                        resolve();
                                    });
                                }
                            });
                        });
                    };
                    let promises = user.commentedPosts.map((id) => promise(id));
                    Promise.all(promises).then((val) => {
                        resolve();
                    }, (err) => {
                        reject(err);
                    });
                }
                else {
                    reject(err);
                }
            });
        });
    };
    Promise.all([updateUser(), updatePosts(), updateComments()]).then((val) => {
        if (req.file) {
            res.json({
                name: req.body.name,
                DOB: req.body.DOB,
                avatar: req.file.filename,
            });
        }
        else {
            res.json({
                name: req.body.name,
                DOB: req.body.DOB,
            });
        }
    }, (err) => {
        res.status(404).json({ message: err.message });
    });
});
router.get('/getAllUsers', function (req, res) {
    user_1.default.find({}, function (err, users) {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        let contacts = [];
        users.forEach((user) => {
            contacts.push({
                username: user.username,
                name: user.name,
                avatar: user.avatar,
            });
        });
        res.json({ contacts: contacts });
    });
});
exports.default = router;
