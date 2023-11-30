"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    DOB: Date,
    gender: String,
    avatar: String,
    likedPosts: [String],
    bookmarks: [String],
    commentedPosts: [String],
});
exports.default = mongoose.model('user', userSchema);
