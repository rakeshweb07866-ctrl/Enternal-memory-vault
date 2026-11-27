// ==========================================
// AUTH ROUTES
// POST /api/auth/login
// ==========================================

const express = require('express');
const router = express.Router();
const { isValidPin, getActivePins } = require('../middleware/auth.middleware');
const { getISTTimeString, getISTDateString, parseDeviceDetails } = require('../utils/helpers');
const { getLoginSessions, saveLoginSessions } = require('../utils/store');
const { updateHttpPresence } = require('../utils/presence');

// POST /api/auth/login
router.post('/login', (req, res) => {
  let { sender, pin, device, failed } = req.body;
  const current = getActivePins();
  const inputPin = String(pin || '').trim();

  // Auto-detect identity from pin
  if (inputPin === current.vanshika) {
    sender = 'Vanshika 👸';
  } else if (inputPin === current.rakesh || inputPin === current.admin || inputPin === 'Vanshika170926') {
    sender = 'Rakesh 🤵';
  }

  const ua = (device && device.userAgent) || req.headers['user-agent'] || '';
  const parsed = parseDeviceDetails(ua, device);
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const cleanIp = String(rawIp).split(',')[0].trim().replace('::ffff:', '');
  const now = new Date();
  const timeIST = getISTTimeString();
  const dateIST = getISTDateString();
  const timestampStr = `${dateIST}, ${timeIST}`;

  const isOk = !failed && isValidPin(sender, pin);

  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const sessionRecord = {
    id: sessionId,
    sender: sender || 'Unknown',
    pinMasked: pin ? (pin.length > 2 ? pin.substring(0, 1) + '***' + pin.slice(-1) : '***') : 'None',
    status: isOk ? 'active' : 'failed_attempt',
    success: isOk,
    deviceType: parsed.deviceType,
    deviceName: parsed.deviceName,
    os: parsed.os,
    browser: parsed.browser,
    screen: (device && device.screen) || 'Unknown',
    ip: cleanIp,
    loginTime: now.toISOString(),
    loginTimeIST: timestampStr,
    lastActiveIST: timestampStr,
    lastActiveMs: Date.now()
  };

  const sessions = getLoginSessions();
  sessions.unshift(sessionRecord);
  saveLoginSessions();

  if (isOk) {
    updateHttpPresence(sender);
    const io = req.app.get('io');
    if (io) {
      io.emit('session_activity', {
        count: sessions.filter(s => s.status === 'active').length,
        newSession: sessionRecord
      });
    }
    return res.json({ success: true, sessionId, sender, message: 'Authenticated successfully!' });
  } else {
    const io = req.app.get('io');
    if (io) {
      io.emit('session_alert', {
        alert: '⚠️ Security Alert: Failed Passcode Attempt!',
        session: sessionRecord
      });
    }
    return res.status(401).json({ success: false, error: 'Access Denied: Invalid Passcode!' });
  }
});

module.exports = router;
