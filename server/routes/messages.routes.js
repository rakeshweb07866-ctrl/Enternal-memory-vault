// ==========================================
// CHAT / MESSAGES ROUTES
// GET/POST /api/messages
// POST /api/presence/ping
// POST /api/wishes
// GET /api/wishes
// ==========================================

const express = require('express');
const router = express.Router();
const { isValidPin } = require('../middleware/auth.middleware');
const { getISTTimeString, getISTDateString } = require('../utils/helpers');
const {
  getMessages, saveMessage, getDeletedMessages, saveDeletedMessage,
  getWishes, saveWish, getInMemoryMessages
} = require('../utils/store');
const { updateHttpPresence, cleanExpiredPresence } = require('../utils/presence');

// POST /api/messages — Send a message
router.post('/', (req, res) => {
  try {
    const { sender, pin, message, mediaType, mediaUrl, fileName } = req.body;
    if (!isValidPin(sender, pin)) {
      return res.status(401).json({ success: false, error: 'Access Denied: Invalid Passcode!' });
    }
    if ((!message || !message.trim()) && !mediaUrl) {
      return res.status(400).json({ success: false, error: 'Message or media required' });
    }

    updateHttpPresence(sender);
    const now = new Date();
    const newMsg = {
      id: req.body.id || ('msg_' + Date.now()),
      sender,
      message: (message || '').trim(),
      mediaType: mediaType || null,
      mediaUrl: mediaUrl || null,
      fileName: fileName || null,
      timestamp: req.body.timestamp || now.toISOString(),
      formattedTime: req.body.formattedTime || getISTTimeString(),
      formattedDate: req.body.formattedDate || getISTDateString(),
      status: req.body.status || 'sent',
      replyTo: req.body.replyTo || null
    };

    saveMessage(newMsg);
    const io = req.app.get('io');
    if (io) io.to('love_chat_room').emit('new_message', newMsg);
    return res.json({ success: true, data: newMsg });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/messages — Fetch messages
router.get('/', (req, res) => {
  try {
    const sender = req.query.sender;
    if (sender) updateHttpPresence(sender);
    cleanExpiredPresence();

    let all = getMessages();
    if (sender) {
      const cleanSender = sender.toLowerCase();
      all = all.filter(m => !m.deletedFor || !m.deletedFor.some(u => cleanSender.includes(u) || u.includes(cleanSender)));
    }

    const { onlineUsers } = require('../utils/presence');
    return res.json({ success: true, count: all.length, data: all, presence: onlineUsers });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/messages/status — Update message read status
router.post('/status', (req, res) => {
  try {
    const { sender, pin, status, messageIds } = req.body;
    if (!isValidPin(sender, pin)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    updateHttpPresence(sender);
    if (Array.isArray(messageIds) && messageIds.length > 0) {
      let list = getMessages();
      let modified = false;
      list.forEach(m => {
        if (messageIds.includes(m.id)) {
          m.status = status || 'read';
          modified = true;
        }
      });
      if (modified) {
        const fs = require('fs');
        const { MESSAGES_FILE } = require('../utils/store');
        try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (e) {}
        const io = req.app.get('io');
        if (io) io.to('love_chat_room').emit('messages_status_update', { messageIds, status: status || 'read' });
      }
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/messages/delete — Delete a message
router.post('/delete', (req, res) => {
  try {
    const { messageId, deleteType, deletedBy, pin } = req.body || {};
    if (!isValidPin(deletedBy, pin) && pin !== 'Vanshika170926') {
      return res.status(401).json({ success: false, error: 'Access denied: invalid pin' });
    }
    if (!messageId) {
      return res.status(400).json({ success: false, error: 'messageId required' });
    }

    let list = getMessages();
    const targetIdx = list.findIndex(m => m.id === messageId);
    const targetMsg = targetIdx !== -1 ? list[targetIdx] : null;
    const delType = deleteType === 'for_everyone' ? 'for_everyone' : 'for_me';
    const now = new Date();

    const auditRecord = {
      id: 'del_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      messageId,
      deleteType: delType,
      deletedBy: deletedBy || 'Unknown',
      deletedAt: now.toISOString(),
      deletedAtFormatted: `${getISTTimeString()} (${getISTDateString()})`,
      originalSender: targetMsg ? targetMsg.sender : 'Unknown',
      message: targetMsg ? targetMsg.message : (req.body.message || ''),
      mediaType: targetMsg ? targetMsg.mediaType : (req.body.mediaType || null),
      mediaUrl: targetMsg ? targetMsg.mediaUrl : (req.body.mediaUrl || null),
      fileName: targetMsg ? targetMsg.fileName : (req.body.fileName || null),
      originalTimestamp: targetMsg ? targetMsg.timestamp : null
    };
    saveDeletedMessage(auditRecord);

    const fs = require('fs');
    const { MESSAGES_FILE, getInMemoryMessages } = require('../utils/store');
    if (delType === 'for_everyone') {
      if (targetIdx !== -1) {
        list.splice(targetIdx, 1);
        try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (e) {}
      }
    } else {
      if (targetIdx !== -1) {
        list[targetIdx].deletedFor = list[targetIdx].deletedFor || [];
        const cleanUser = (deletedBy || '').toLowerCase();
        if (!list[targetIdx].deletedFor.includes(cleanUser)) {
          list[targetIdx].deletedFor.push(cleanUser);
        }
        try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (e) {}
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.to('love_chat_room').emit('message_deleted', { messageId, deleteType: delType, deletedBy });
    }
    return res.json({ success: true, messageId, deleteType: delType });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/messages/clear — Clear all messages
router.post('/clear', (req, res) => {
  try {
    const { sender, pin } = req.body;
    if (!isValidPin(sender, pin)) {
      return res.status(401).json({ success: false, error: 'Access Denied: Invalid Passcode!' });
    }
    const { clearMessages } = require('../utils/store');
    clearMessages();
    const io = req.app.get('io');
    if (io) io.to('love_chat_room').emit('chat_cleared', { messages: [] });
    return res.json({ success: true, message: 'Chat room cleared successfully!', data: [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
