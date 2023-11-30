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

export default mongoose.model('room', roomSchema);
