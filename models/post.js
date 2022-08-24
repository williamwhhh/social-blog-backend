var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
  username: String,
  name: String,
  text: String,
  images: [String],
  location: String,
});

module.exports = mongoose.model('post', postSchema);
