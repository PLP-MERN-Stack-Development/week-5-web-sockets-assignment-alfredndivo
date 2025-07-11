// server/socket/index.js
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

module.exports = (io, { JWT_SECRET }) => {
  const onlineUsers = {};
  const typingUsers = {};

  io.on('connection', (socket) => {
    const { userId, username } = socket.user;
    onlineUsers[socket.id] = { userId, username };
    io.emit('user_list', Object.values(onlineUsers));
    io.emit('user_joined', { userId, username });

    socket.on('join_room', (room) => socket.join(room));

    socket.on('send_message', async (payload, cb) => {
      const {
        text,
        room = 'global',
        isPrivate = false,
        to,
        attachments = [],
      } = payload;

      const msg = await Message.create({
        text,
        room,
        sender: username,
        senderId: socket.id,
        senderUser: userId,
        isPrivate,
        attachments,
        deliveredTo: [userId],
      });

      if (isPrivate && to) {
        socket.to(to).emit('private_message', msg);
        cb?.(msg._id);
      } else {
        io.to(room).emit('receive_message', msg);
        cb?.(msg._id);
      }
    });

    socket.on('delivered', async (id) => {
      await Message.findByIdAndUpdate(id, { $addToSet: { deliveredTo: userId } });
    });

    socket.on('read', async (id) => {
      await Message.findByIdAndUpdate(id, { $addToSet: { readBy: userId } });
      const msg = await Message.findById(id).lean();
      io.to(msg.room).emit('message_read', { id, readBy: msg.readBy });
    });

    socket.on('reaction', async ({ id, type }) => {
      await Message.findByIdAndUpdate(id, {
        $pull: { reactions: { userId } },
      });
      const msg = await Message.findByIdAndUpdate(
        id,
        { $push: { reactions: { userId, type } } },
        { new: true }
      ).lean();
      io.to(msg.room).emit('reaction_update', msg);
    });

    socket.on('typing', ({ room = 'global', isTyping }) => {
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      io.to(room).emit('typing_users', Object.values(typingUsers));
    });

    socket.on('disconnect', async () => {
      delete onlineUsers[socket.id];
      delete typingUsers[socket.id];

      io.emit('user_left', { userId, username });
      io.emit('user_list', Object.values(onlineUsers));

      await User.findByIdAndUpdate(userId, {
        online: false,
        lastSeen: new Date(),
      });
    });
  });
};
