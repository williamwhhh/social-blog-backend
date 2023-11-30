"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = mongoose.model('room', roomSchema);
