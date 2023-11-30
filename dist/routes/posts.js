"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/user"));
const post_1 = __importDefault(require("../models/post"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
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
router.post('/addPost', upload.array('images[]'), function (req, res) {
    let imagePaths = [];
    const files = req.files;
    files.forEach((i) => {
        imagePaths.push(i.filename);
    });
    let date = new Date();
    var newPost = new post_1.default({
        username: req.body.username,
        name: req.body.name,
        text: req.body.text,
        images: imagePaths,
        location: req.body.location,
        avatar: req.body.avatar,
        dateTime: date.toLocaleTimeString().slice(0) + ', ' + date.toDateString().slice(4),
        comments: [],
    });
    newPost.save(function (err, obj) {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        else {
            res.json({ message: 'Posted', post: obj });
        }
    });
});
router.post('/removePost', function (req, res) {
    post_1.default.findByIdAndRemove(req.body.id, function (err, val) {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        else {
            req.body.images.forEach((image) => {
                fs_1.default.unlinkSync(`./public/images/${image}`);
            });
            res.json({ message: 'Deleted' });
        }
    });
});
router.get('/getAllPosts', function (req, res) {
    post_1.default.find({}, function (err, posts) {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        else {
            res.json({ message: 'All Posts Loaded', posts: posts });
        }
    });
});
router.get('/getMyPosts', function (req, res) {
    post_1.default.find({ username: req.headers.username }, function (err, posts) {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        else {
            res.json({ message: 'My Posts Loaded', posts: posts });
        }
    });
});
router.get('/getPost', function (req, res) {
    post_1.default.findById(req.headers.id, function (err, post) {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        else {
            res.json({ post: post });
        }
    });
});
router.post('/bookmark', function (req, response) {
    user_1.default.findOne({ email: req.body.email }, (err, res) => {
        if (err) {
            response.status(404).json({ message: err.message });
        }
        res.bookmarks.push(req.body.postId);
        user_1.default.findOneAndUpdate({ email: req.body.email }, { bookmarks: res.bookmarks }, (err, res) => {
            if (err) {
                response.status(404).json({ message: err.message });
            }
        });
        response.json({ message: 'Added Bookmark', bookmarks: res.bookmarks });
    });
});
router.get('/getBookmarks', function (req, res) {
    user_1.default.findOne({ email: req.headers.email }, (err, user) => {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        var promise = (id) => {
            return new Promise((resolve, reject) => {
                post_1.default.findById(id, function (err, post) {
                    if (err) {
                        reject(err);
                    }
                    if (post) {
                        resolve(post);
                    }
                    else {
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
        Promise.all(promises).then((val) => {
            res.json({ message: 'bookmarks loaded', bookmarks: val });
        }, (err) => {
            res.status(404).json({ message: err.message });
        });
    });
});
router.post('/removeBookmark', function (req, response) {
    user_1.default.findOne({ email: req.body.email }, (err, res) => {
        if (err) {
            response.status(404).json({ message: err.message });
        }
        let index = res.bookmarks.indexOf(req.body.postId);
        if (index !== -1) {
            res.bookmarks.splice(index, 1);
        }
        user_1.default.findOneAndUpdate({ email: req.body.email }, { bookmarks: res.bookmarks }, (err, res) => {
            if (err) {
                response.status(404).json({ message: err.message });
            }
        });
        response.json({ message: 'removed bookmark', bookmarks: res.bookmarks });
    });
});
router.post('/likePost', function (req, response) {
    user_1.default.findOne({ email: req.body.email }, (err, res) => {
        if (err) {
            response.status(404).json({ message: err.message });
        }
        res.likedPosts.push(req.body.postId);
        user_1.default.findOneAndUpdate({ email: req.body.email }, { likedPosts: res.likedPosts }, (err, res) => {
            if (err) {
                response.status(404).json({ message: err.message });
            }
        });
        response.json({ message: 'Liked', likedPosts: res.likedPosts });
    });
});
router.get('/getLikedPosts', function (req, res) {
    user_1.default.findOne({ email: req.headers.email }, (err, user) => {
        if (err) {
            res.status(404).json({ message: err.message });
        }
        var promise = (id) => {
            return new Promise((resolve, reject) => {
                post_1.default.findById(id, function (err, post) {
                    if (err) {
                        reject(err);
                    }
                    if (post) {
                        resolve(post);
                    }
                    else {
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
        Promise.all(promises).then((val) => {
            res.json({ message: 'liked posts loaded', likedPosts: val });
        }, (err) => {
            res.status(404).json({ message: err.message });
        });
    });
});
router.post('/unlikePost', function (req, response) {
    user_1.default.findOne({ email: req.body.email }, (err, res) => {
        if (err) {
            response.status(404).json({ message: err.message });
        }
        let index = res.likedPosts.indexOf(req.body.postId);
        if (index !== -1) {
            res.likedPosts.splice(index, 1);
        }
        user_1.default.findOneAndUpdate({ email: req.body.email }, { likedPosts: res.likedPosts }, (err, res) => {
            if (err) {
                response.status(404).json({ message: err.message });
            }
        });
        response.json({
            message: 'unliked the post',
            likedPosts: res.likedPosts,
        });
    });
});
router.post('/addComment', upload.array('images[]'), function (req, res) {
    let imagePaths = [];
    const files = req.files;
    files.forEach((i) => {
        imagePaths.push(i.filename);
    });
    var comments = [];
    const updatePost = new Promise((resolve, reject) => {
        post_1.default.findById(req.body.postId, (err, val) => {
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
                dateTime: date.toLocaleTimeString() + ', ' + date.toDateString().slice(4),
            });
            post_1.default.findByIdAndUpdate(req.body.postId, { comments: val.comments }, (err, val2) => {
                if (err) {
                    reject(err);
                }
                comments = val.comments;
                resolve();
            });
        });
    });
    const updateUser = new Promise((resolve, reject) => {
        user_1.default.findOne({ username: req.body.username }, (err, val) => {
            if (err) {
                reject(err);
            }
            if (val.commentedPosts.includes(req.body.postId)) {
                resolve();
                return;
            }
            val.commentedPosts.push(req.body.postId);
            user_1.default.findOneAndUpdate({ username: req.body.username }, { commentedPosts: val.commentedPosts }, (err, val2) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    });
    Promise.all([updatePost, updateUser]).then((val) => {
        res.json({
            message: 'Added a comment',
            comments: comments,
        });
    }, (err) => {
        res.status(404).json({ message: err.message });
    });
});
router.post('/removeComment', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatePost = new Promise((resolve, reject) => {
            post_1.default.findById(req.body.postId, function (err, val) {
                if (err) {
                    reject();
                }
                else {
                    for (let i = 0; i < val.comments.length; i++) {
                        if (val.comments[i].username === req.body.username &&
                            val.comments[i].text === req.body.text) {
                            val.comments.splice(i, 1);
                            req.body.images.forEach((image) => {
                                fs_1.default.unlinkSync(`./public/images/${image}`);
                            });
                            break;
                        }
                    }
                    post_1.default.findByIdAndUpdate(req.body.postId, { comments: val.comments }, (err, val2) => {
                        if (err) {
                            reject();
                        }
                        resolve(val.comments);
                    });
                }
            });
        });
        const updateUser = (comments) => new Promise((resolve, reject) => {
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
            user_1.default.findOne({ username: req.body.username }, (err, val) => {
                if (err) {
                    reject(err);
                }
                val.commentedPosts.splice(val.commentedPosts.indexOf(req.body.postId), 1);
                user_1.default.findOneAndUpdate({ username: req.body.username }, { commentedPosts: val.commentedPosts }, (err, val2) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(comments);
                    res.json({
                        message: 'Deleted a comment',
                        comments: comments,
                    });
                });
            });
        });
        updatePost.then((val) => updateUser(val), (err) => {
            res.status(404).json({ message: err.message });
        });
    });
});
exports.default = router;
