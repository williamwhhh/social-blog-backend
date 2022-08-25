var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
  username: String,
  avatar: String,
  comment: String,
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
  comments: [commentSchema],
});

module.exports = mongoose.model('post', postSchema);
