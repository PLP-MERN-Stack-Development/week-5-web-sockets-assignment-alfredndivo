const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const chat   = require('../controllers/chatController');

router.use(auth);

router.get('/messages/:room', chat.getMessages);
router.patch('/messages/:id/read', chat.markRead);
router.patch('/messages/:id/reaction', chat.addReaction);

module.exports = router;
