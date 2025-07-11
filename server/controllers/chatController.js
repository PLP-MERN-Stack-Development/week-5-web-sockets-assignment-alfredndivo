const Message = require('../models/Message');

// GET /api/messages/:room?page=1&limit=25&search=hello
exports.getMessages = async (req, res, next) => {
  const { page = 1, limit = 25, search = '' } = req.query;
  const { room } = req.params;

  const q = { room };
  if (search) q.text = { $regex: search, $options: 'i' };

  const msgs = await Message.find(q)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(+limit)
    .lean();

  res.json(msgs.reverse()); // oldest → newest
};

// PATCH /api/messages/:id/read
exports.markRead = async (req, res, next) => {
  const { id } = req.params;
  await Message.findByIdAndUpdate(id, { $addToSet: { readBy: req.user._id } });
  res.sendStatus(204);
};

// PATCH /api/messages/:id/reaction
// body: { type: 'like' }
exports.addReaction = async (req, res, next) => {
  const { id } = req.params;
  const { type } = req.body;
  await Message.findByIdAndUpdate(id, {
    $pull: { reactions: { userId: req.user._id } },       // replace existing
  });
  const msg = await Message.findByIdAndUpdate(
    id,
    { $push: { reactions: { userId: req.user._id, type } } },
    { new: true }
  ).lean();
  res.json(msg);
};
