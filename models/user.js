var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  DOB: Date,
  gender: String,
  avatar: Buffer,
  likedPosts: [String],
});

module.exports = mongoose.model('user', userSchema);