// ==========================================
// ADMIN ROUTES
// All /api/admin/* endpoints
// ==========================================

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { isAdminAuth, getActivePins, saveSecurityPins, ADMIN_SECRET } = require('../middleware/auth.middleware');
const { getISTTimeString, getISTDateString } = require('../utils/helpers');
const {
  getMessages, getDeletedMessages, getWishes, clearMessages, clearDeletedMessages, clearWishes,
  getLoginSessions, saveLoginSessions, getInMemorySessions, setInMemorySessions
} = require('../utils/store');

// POST /api/admin/verify
router.post('/verify', (req, res) => {
  if (isAdminAuth(req)) {
    return res.json({ success: true, message: 'Admin verified successfully' });
  }
  return res.status(401).json({ success: false, error: 'Invalid admin passcode' });
});

// GET /api/admin/pins
router.get('/pins', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  const current = getActivePins();
  return res.json({
    success: true,
    pins: {
      vanshika: current.vanshika,
      rakesh: current.rakesh,
      admin: current.admin,
      updatedAtIST: current.updatedAtIST || 'Initial Default Setup'
    }
  });
});

// POST /api/admin/pins/update
router.post('/pins/update', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  const { target, newPin } = req.body;
  if (!target || !['vanshika', 'rakesh', 'admin'].includes(target)) {
    return res.status(400).json({ success: false, error: 'Invalid target user' });
  }
  const cleanPin = String(newPin || '').trim();
  if (!cleanPin || cleanPin.length < 3) {
    return res.status(400).json({ success: false, error: 'Passcode must be at least 3 characters long' });
  }
  const current = getActivePins();
  current[target] = cleanPin;
  current.updatedAtIST = `${getISTDateString()}, ${getISTTimeString()}`;
  saveSecurityPins(current);

  const io = req.app.get('io');
  if (io) io.emit('pins_updated', { target, updatedAtIST: current.updatedAtIST });

  return res.json({
    success: true,
    message: `Passcode for ${target.toUpperCase()} updated successfully!`,
    pins: {
      vanshika: current.vanshika,
      rakesh: current.rakesh,
      admin: current.admin,
      updatedAtIST: current.updatedAtIST
    }
  });
});

// GET /api/admin/reels
router.get('/reels', (req, res) => {
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ success: false, error: 'Admin access denied' });
  try {
    const primary = path.join(__dirname, '../../assests');
    let reels = [];
    if (fs.existsSync(primary)) {
      reels = fs.readdirSync(primary)
        .filter(f => f.endsWith('.mp4'))
        .map(f => {
          const fullPath = path.join(primary, f);
          const stat = fs.statSync(fullPath);
          return {
            filename: f,
            url: `assests/${f}`,
            size: stat.size,
            sizeMB: (stat.size / (1024 * 1024)).toFixed(2) + ' MB',
            createdAt: stat.birthtime
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return res.json({ success: true, count: reels.length, data: reels });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/reels/:filename
router.delete('/reels/:filename', (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) return res.status(401).json({ success: false, error: 'Admin access denied' });
  try {
    const safeName = path.basename(req.params.filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!safeName.endsWith('.mp4')) return res.status(400).json({ success: false, error: 'Only .mp4 files allowed' });
    let deleted = 0;
    [path.join(__dirname, '../../assests', safeName), path.join(__dirname, '../../public/assests', safeName)].forEach(fp => {
      if (fs.existsSync(fp)) { fs.unlinkSync(fp); deleted++; }
    });
    return res.json({ success: true, deleted, message: `${safeName} deleted successfully` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/messages/clear
router.post('/messages/clear', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  try {
    clearMessages();
    const io = req.app.get('io');
    if (io) io.to('love_chat_room').emit('chat_cleared', { messages: [] });
    return res.json({ success: true, message: 'All messages cleared!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/messages/:id
router.delete('/messages/:id', (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) return res.status(401).json({ success: false, error: 'Admin access denied' });
  try {
    const { id } = req.params;
    let msgs = getMessages();
    const before = msgs.length;
    msgs = msgs.filter(m => m.id !== id);
    const { MESSAGES_FILE } = require('../utils/store');
    try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(msgs, null, 2)); } catch (e) {}
    const io = req.app.get('io');
    if (io) io.to('love_chat_room').emit('message_deleted', { id });
    return res.json({ success: true, deleted: before - msgs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/wishes/clear
router.post('/wishes/clear', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  try {
    clearWishes();
    return res.json({ success: true, message: 'All wishes cleared!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/deleted-messages
router.get('/deleted-messages', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  const list = getDeletedMessages();
  return res.json({ success: true, count: list.length, data: list });
});

// POST /api/admin/deleted-messages (alias for GET)
router.post('/deleted-messages', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  const list = getDeletedMessages();
  return res.json({ success: true, count: list.length, data: list });
});

// POST /api/admin/deleted-messages/clear
router.post('/deleted-messages/clear', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  clearDeletedMessages();
  return res.json({ success: true, message: 'Deleted messages vault cleared!' });
});

// GET /api/admin/sessions
router.get('/sessions', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  const sessions = getLoginSessions();
  const nowMs = Date.now();
  const enriched = sessions.map(s => ({
    ...s,
    isOnlineNow: s.status === 'active' && (nowMs - (s.lastActiveMs || 0) < 3 * 60 * 1000)
  }));
  return res.json({ success: true, count: enriched.length, data: enriched });
});

// POST /api/admin/sessions/terminate
router.post('/sessions/terminate', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  const { sessionId } = req.body;
  const sessions = getLoginSessions();
  const target = sessions.find(s => s.id === sessionId);
  if (target) {
    target.status = 'terminated';
    target.terminatedAt = new Date().toISOString();
    target.terminatedAtIST = `${getISTDateString()}, ${getISTTimeString()}`;
    saveLoginSessions();
    const io = req.app.get('io');
    if (io) {
      io.emit('force_logout', {
        sessionId,
        sender: target.sender,
        reason: `Session terminated remotely by Rakesh for ${target.deviceName}.`
      });
    }
    return res.json({ success: true, message: `Session for ${target.deviceName} (${target.sender}) terminated!` });
  }
  return res.status(404).json({ success: false, error: 'Session not found' });
});

// POST /api/admin/sessions/terminate-all
router.post('/sessions/terminate-all', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  const sessions = getLoginSessions();
  let count = 0;
  sessions.forEach(s => {
    if (s.status === 'active') {
      s.status = 'terminated';
      s.terminatedAt = new Date().toISOString();
      s.terminatedAtIST = `${getISTDateString()}, ${getISTTimeString()}`;
      count++;
    }
  });
  saveLoginSessions();
  const io = req.app.get('io');
  if (io) io.emit('force_logout', { reason: 'All active sessions were terminated by Admin.' });
  return res.json({ success: true, count, message: `All ${count} active sessions terminated!` });
});

// DELETE /api/admin/sessions/:id
router.delete('/sessions/:id', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  const { id } = req.params;
  const filtered = getLoginSessions().filter(s => s.id !== id);
  setInMemorySessions(filtered);
  saveLoginSessions();
  return res.json({ success: true, message: 'Session log removed' });
});

// POST /api/admin/sessions/clear
router.post('/sessions/clear', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  setInMemorySessions([]);
  saveLoginSessions();
  return res.json({ success: true, message: 'All session logs cleared' });
});

// GET /api/admin/status
router.get('/status', (req, res) => {
  if (!isAdminAuth(req)) return res.status(401).json({ success: false, error: 'Admin access denied' });
  try {
    let reelCount = 0;
    const reelDir = path.join(__dirname, '../../public/assests');
    if (fs.existsSync(reelDir)) {
      reelCount = fs.readdirSync(reelDir).filter(f => f.endsWith('.mp4')).length;
    }
    const { onlineUsers } = require('../utils/presence');
    const allSessions = getLoginSessions();
    return res.json({
      success: true,
      stats: {
        totalMessages: getMessages().length,
        totalDeletedMessages: getDeletedMessages().length,
        totalWishes: getWishes().length,
        totalReelsOnServer: reelCount,
        totalActiveSessions: allSessions.filter(s => s.status === 'active').length,
        totalSessions: allSessions.length,
        onlineUsers,
        serverTime: new Date().toISOString(),
        serverTimeIST: getISTTimeString()
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
