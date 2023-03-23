var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  dateTime: Date,
});

var roomSchema = mongoose.Schema({
  participants: [],
  messages: [messageSchema],
});

module.exports = mongoose.model('room', roomSchema);
