// ==========================================
// PRESENCE & WISHES ROUTES
// POST /api/presence/ping
// GET /api/wishes
// POST /api/wishes
// ==========================================

const express = require('express');
const router = express.Router();
const { isValidPin } = require('../middleware/auth.middleware');
const { getISTTimeString } = require('../utils/helpers');
const { getWishes, saveWish } = require('../utils/store');
const { updateHttpPresence, cleanExpiredPresence, onlineUsers } = require('../utils/presence');

// POST /api/presence/ping
router.post('/ping', (req, res) => {
  try {
    const { sender, pin } = req.body;
    if (isValidPin(sender, pin)) {
      updateHttpPresence(sender);
    }
    cleanExpiredPresence();
    return res.json({ success: true, presence: onlineUsers });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/wishes
router.post('/', (req, res) => {
  try {
    const { wishText, sender } = req.body;
    if (!wishText || !wishText.trim()) {
      return res.status(400).json({ success: false, error: 'Wish text required' });
    }
    updateHttpPresence(sender);
    const newWish = {
      id: 'wish_' + Date.now(),
      sender: sender || 'Vanshika 👸',
      text: wishText.trim(),
      timestamp: new Date().toISOString(),
      formattedTime: getISTTimeString()
    };
    saveWish(newWish);
    const io = req.app.get('io');
    if (io) io.to('love_chat_room').emit('new_sky_lantern', newWish);
    return res.json({ success: true, data: newWish });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/wishes
router.get('/', (req, res) => {
  try {
    const wishes = getWishes();
    return res.json({ success: true, count: wishes.length, data: wishes });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
