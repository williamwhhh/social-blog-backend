"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
var commentSchema = mongoose.Schema({
    avatar: String,
    username: String,
    name: String,
    text: String,
    images: [String],
    location: String,
});
var postSchema = mongoose.Schema({
    avatar: String,
    username: String,
    name: String,
    text: String,
    images: [String],
    location: String,
    comments: [Object],
    dateTime: String,
    numOfLike: Number,
    numOfRepost: Number,
});
exports.default = mongoose.model('post', postSchema);
