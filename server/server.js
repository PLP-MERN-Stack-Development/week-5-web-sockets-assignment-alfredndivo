// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const morgan = require('morgan');
const path = require('path');

dotenv.config();

const verifyToken = require('./middleware/authMiddleware');
const Message = require('./models/Message');
const authRouter = require('./routes/auth');

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'chat_secret';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB error:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
});

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

const upload = multer({ dest: path.join(__dirname, 'uploads') });

// SOCKET AUTH
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    return next();
  } catch {
    return next(new Error('Invalid token'));
  }
});

const onlineUsers = {};
const typingUsers = {};

io.on('connection', (socket) => {
  const { id, username } = socket.user;
  onlineUsers[socket.id] = { id, username };

  io.emit('user_list', Object.values(onlineUsers));
  io.emit('user_joined', { id: socket.id, username });

  socket.on('join_room', (room) => socket.join(room));

  socket.on('send_message', async ({ text, room = 'global', isPrivate = false, to, fileUrl }) => {
    const msg = await Message.create({
      text,
      room,
      sender: username,
      senderId: socket.id,
      isPrivate,
      fileUrl,
    });
    if (isPrivate && to) {
      socket.to(to).emit('private_message', msg);
      socket.emit('private_message', msg);
    } else {
      io.to(room).emit('receive_message', msg);
    }
  });

  socket.on('typing', ({ room = 'global', isTyping }) => {
    if (isTyping) typingUsers[socket.id] = username;
    else delete typingUsers[socket.id];
    io.to(room).emit('typing_users', Object.values(typingUsers));
  });

  socket.on('react_to_message', async ({ messageId, emoji }) => {
    const message = await Message.findById(messageId);
    if (!message) return;

    if (!message.reactionsByUser) message.reactionsByUser = new Map();

    message.reactionsByUser.set(socket.user.userId, emoji);

    const counts = {};
    for (let reaction of message.reactionsByUser.values()) {
      counts[reaction] = (counts[reaction] || 0) + 1;
    }

    message.reactions = counts;
    await message.save();

    io.emit('message_reacted', { messageId, reactions: counts });
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    delete typingUsers[socket.id];
    io.emit('user_left', { id: socket.id, username });
    io.emit('user_list', Object.values(onlineUsers));
  });
});

// Routes
app.use('/api', authRouter);

app.get('/api/messages/:room', verifyToken, async (req, res) => {
  const msgs = await Message.find({ room: req.params.room }).sort({ timestamp: 1 }).limit(100);
  res.json(msgs);
});

app.post('/api/upload', verifyToken, upload.single('file'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.get('/', (req, res) => res.send('Chat server running'));

server.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
