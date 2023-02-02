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
  numOfLike: Number,
  numOfRepost: Number,
  comments: [Object],
});

module.exports = mongoose.model('post', postSchema);
