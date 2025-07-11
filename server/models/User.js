const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    avatar:   String,                     // optional profile image
    online:   { type: Boolean, default: false },
    lastSeen: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
