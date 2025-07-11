// server/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  room: { type: String, default: 'global' },
  sender: String,
  senderId: String,
  senderUser: String,
  isPrivate: Boolean,
  timestamp: { type: Date, default: Date.now },
  attachments: [String],
  deliveredTo: [String],
  readBy: [String],
  reactions: [
    {
      userId: String,
      type: String,
    },
  ],
});

module.exports = mongoose.model('Message', messageSchema);
