const express = require('express');
const http = require('http');
let Server;
try { Server = require('socket.io').Server; } catch (e) {}

const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const server = http.createServer(app);

let io = null;
if (Server) {
  try {
    io = new Server(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] }
    });
  } catch (e) {}
}

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Persistent Storage Directory
let DATA_DIR;
try {
  if (process.env.VERCEL || fs.existsSync('/tmp')) {
    DATA_DIR = path.join(os.tmpdir(), 'vanshika_data');
  } else {
    DATA_DIR = path.join(__dirname, 'data');
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  DATA_DIR = os.tmpdir();
}

const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.json');
const DELETED_MESSAGES_FILE = path.join(DATA_DIR, 'deleted_messages.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'login_sessions.json');

// Device & User-Agent Parser for Instagram-Style Device Tracker
function parseDeviceDetails(uaString, clientDevice = {}) {
  const ua = uaString || '';
  let deviceType = 'desktop';
  let deviceName = 'Windows PC';
  let os = 'Windows';
  let browser = 'Chrome';

  // 1. Detect OS
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) {
    const v = ua.match(/Android\s+([\d.]+)/i);
    os = v ? `Android ${v[1]}` : 'Android';
    deviceType = 'mobile';
  } else if (/iPhone/i.test(ua)) {
    const v = ua.match(/OS\s+([\d_]+)/i);
    os = v ? `iOS ${v[1].replace(/_/g, '.')}` : 'iOS';
    deviceType = 'mobile';
  } else if (/iPad/i.test(ua)) {
    const v = ua.match(/OS\s+([\d_]+)/i);
    os = v ? `iPadOS ${v[1].replace(/_/g, '.')}` : 'iPadOS';
    deviceType = 'tablet';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // 2. Detect Browser
  if (/Edg\/([\d.]+)/i.test(ua)) {
    browser = `Edge ${ua.match(/Edg\/([\d.]+)/i)[1].split('.')[0]}`;
  } else if (/SamsungBrowser\/([\d.]+)/i.test(ua)) {
    browser = `Samsung Internet ${ua.match(/SamsungBrowser\/([\d.]+)/i)[1].split('.')[0]}`;
  } else if (/OPR\/([\d.]+)/i.test(ua)) {
    browser = 'Opera';
  } else if (/Chrome\/([\d.]+)/i.test(ua)) {
    browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/i)[1].split('.')[0]}`;
  } else if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox\/([\d.]+)/i.test(ua)) {
    browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/i)[1].split('.')[0]}`;
  }

  // 3. Detect Device Model / Friendly Name
  if (/iPhone/i.test(ua)) {
    deviceType = 'mobile';
    deviceName = 'Apple iPhone';
  } else if (/iPad/i.test(ua)) {
    deviceType = 'tablet';
    deviceName = 'Apple iPad';
  } else if (/Android/i.test(ua)) {
    deviceType = 'mobile';
    const modelMatch = ua.match(/;\s*([^;]+?)\s*(?:Build\/|\))/i);
    if (modelMatch && modelMatch[1]) {
      let rawModel = modelMatch[1].trim();
      rawModel = rawModel.replace(/^Linux;\s*/i, '').replace(/^wv;\s*/i, '');
      if (rawModel.length > 2 && rawModel.length < 35 && !rawModel.includes('Android')) {
        deviceName = rawModel;
      } else {
        deviceName = 'Android Phone';
      }
    } else {
      deviceName = 'Android Phone';
    }
  } else if (/Windows/i.test(ua)) {
    deviceType = 'desktop';
    deviceName = 'Windows PC / Laptop';
  } else if (/Macintosh/i.test(ua)) {
    deviceType = 'desktop';
    deviceName = 'MacBook / Mac';
  }

  return { deviceType, deviceName, os, browser };
}

let inMemorySessions = [];
function getLoginSessions() {
  if (inMemorySessions.length > 0) return inMemorySessions;
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      inMemorySessions = JSON.parse(data);
    }
  } catch (e) {
    inMemorySessions = [];
  }
  return inMemorySessions;
}

function saveLoginSessions() {
  try {
    if (inMemorySessions.length > 150) {
      inMemorySessions = inMemorySessions.slice(0, 150);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(inMemorySessions, null, 2));
  } catch (e) {}
}


// Strict Private Security Passcodes
const VALID_PINS = {
  'vanshika': ['1709'],
  'rakesh': ['1212', 'Vanshika170926'],
  'soulmate': ['1212', 'Vanshika170926']
};

function isValidPin(sender, pin) {
  if (!pin) return false;
  const s = (sender || '').toLowerCase();
  const inputPin = String(pin).trim();
  
  if (s.includes('vanshika')) {
    return VALID_PINS['vanshika'].includes(inputPin);
  } else if (s.includes('rakesh') || s.includes('soulmate')) {
    return VALID_PINS['rakesh'].includes(inputPin);
  }
  return false;
}

// Helper: Format time strictly in Indian Standard Time (IST)
function getISTTimeString() {
  return new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
}

function getISTDateString() {
  return new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' });
}

// Presence State Tracker
let onlineUsers = {
  vanshika: { isOnline: false, lastSeen: null, lastPing: 0 },
  rakesh: { isOnline: false, lastSeen: null, lastPing: 0 }
};

function updateHttpPresence(sender) {
  if (!sender) return;
  const s = sender.toLowerCase();
  const now = Date.now();
  const nowStr = getISTTimeString();

  if (s.includes('vanshika')) {
    onlineUsers.vanshika.isOnline = true;
    onlineUsers.vanshika.lastSeen = nowStr;
    onlineUsers.vanshika.lastPing = now;
  } else if (s.includes('rakesh') || s.includes('soulmate')) {
    onlineUsers.rakesh.isOnline = true;
    onlineUsers.rakesh.lastSeen = nowStr;
    onlineUsers.rakesh.lastPing = now;
  }
}

function cleanExpiredPresence() {
  const now = Date.now();
  if (onlineUsers.vanshika.isOnline && now - onlineUsers.vanshika.lastPing > 12000) {
    onlineUsers.vanshika.isOnline = false;
  }
  if (onlineUsers.rakesh.isOnline && now - onlineUsers.rakesh.lastPing > 12000) {
    onlineUsers.rakesh.isOnline = false;
  }
}

// Default Memory Fallbacks
let inMemoryMessages = [];
let inMemoryWishes = [];
let inMemoryDeletedMessages = [];

function getMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {}
  return inMemoryMessages;
}

function saveMessage(msgObj) {
  let list = getMessages();
  const existingIdx = list.findIndex(m => m.id === msgObj.id);
  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...msgObj };
  } else {
    // Check for twin duplicate by sender, message, mediaUrl, and time within 4s
    const msgTime = new Date(msgObj.timestamp || 0).getTime();
    const dupeIdx = list.findIndex(m => {
      const prevTime = new Date(m.timestamp || 0).getTime();
      return m.sender === msgObj.sender &&
             (m.message || '') === (msgObj.message || '') &&
             (m.mediaUrl || '') === (msgObj.mediaUrl || '') &&
             Math.abs(prevTime - msgTime) < 4000;
    });
    if (dupeIdx !== -1) {
      list[dupeIdx] = { ...list[dupeIdx], ...msgObj };
    } else {
      list.push(msgObj);
    }
  }
  if (list.length > 500) {
    list = list.slice(list.length - 500);
  }
  inMemoryMessages = list;
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2));
  } catch (err) {}
}

function getDeletedMessages() {
  try {
    if (fs.existsSync(DELETED_MESSAGES_FILE)) {
      const data = JSON.parse(fs.readFileSync(DELETED_MESSAGES_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {}
  return inMemoryDeletedMessages;
}

function saveDeletedMessage(delObj) {
  let list = getDeletedMessages();
  list.unshift(delObj);
  if (list.length > 500) list = list.slice(0, 500);
  inMemoryDeletedMessages = list;
  try {
    fs.writeFileSync(DELETED_MESSAGES_FILE, JSON.stringify(list, null, 2));
  } catch (err) {}
}

function getWishes() {
  try {
    if (fs.existsSync(WISHES_FILE)) {
      return JSON.parse(fs.readFileSync(WISHES_FILE, 'utf8'));
    }
  } catch (err) {}
  return inMemoryWishes;
}

function saveWish(wishObj) {
  inMemoryWishes.unshift(wishObj);
  try {
    fs.writeFileSync(WISHES_FILE, JSON.stringify(inMemoryWishes, null, 2));
  } catch (err) {}
}

// Socket.io Real-Time Event System (if io available)
if (io) {
  io.on('connection', (socket) => {
    let socketUserRole = null;

    socket.on('user_join', (data) => {
      const { sender, pin } = data || {};
      if (!isValidPin(sender, pin)) {
        socket.emit('auth_error', { message: 'Invalid Passcode! Access Denied.' });
        return;
      }

      updateHttpPresence(sender);

      const s = (sender || '').toLowerCase();
      if (s.includes('vanshika')) socketUserRole = 'vanshika';
      else socketUserRole = 'rakesh';

      socket.join('love_chat_room');
      socket.emit('auth_success', { sender, onlineUsers, messages: getMessages() });
      io.to('love_chat_room').emit('presence_update', onlineUsers);
    });

    socket.on('send_message', (data) => {
      const { sender, pin, message, mediaType, mediaUrl, fileName } = data || {};
      if (!isValidPin(sender, pin)) {
        socket.emit('chat_error', { message: 'Access Denied: Invalid Security Passcode.' });
        return;
      }

      if ((!message || !message.trim()) && !mediaUrl) return;
      updateHttpPresence(sender);

      const now = new Date();
      const newMsg = {
        id: data.id || ('msg_' + Date.now()),
        sender: sender,
        message: (message || '').trim(),
        mediaType: mediaType || null,
        mediaUrl: mediaUrl || null,
        fileName: fileName || null,
        timestamp: data.timestamp || now.toISOString(),
        formattedTime: data.formattedTime || getISTTimeString(),
        formattedDate: data.formattedDate || getISTDateString(),
        status: data.status || 'sent',
        replyTo: data.replyTo || null
      };

      saveMessage(newMsg);
      io.to('love_chat_room').emit('new_message', newMsg);
    });

    socket.on('delete_message', (data) => {
      const { messageId, deleteType, deletedBy, pin } = data || {};
      if (!isValidPin(deletedBy, pin) && pin !== 'Vanshika170926') return;
      if (!messageId) return;

      let list = getMessages();
      const targetIdx = list.findIndex(m => m.id === messageId);
      const targetMsg = targetIdx !== -1 ? list[targetIdx] : null;

      const delType = deleteType === 'for_everyone' ? 'for_everyone' : 'for_me';
      const now = new Date();

      const auditRecord = {
        id: 'del_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        messageId: messageId,
        deleteType: delType,
        deletedBy: deletedBy || 'Unknown',
        deletedAt: now.toISOString(),
        deletedAtFormatted: getISTTimeString(now) + ' (' + getISTDateString(now) + ')',
        originalSender: targetMsg ? targetMsg.sender : 'Unknown',
        message: targetMsg ? targetMsg.message : (data.message || ''),
        mediaType: targetMsg ? targetMsg.mediaType : (data.mediaType || null),
        mediaUrl: targetMsg ? targetMsg.mediaUrl : (data.mediaUrl || null),
        fileName: targetMsg ? targetMsg.fileName : (data.fileName || null),
        originalTimestamp: targetMsg ? targetMsg.timestamp : null
      };

      saveDeletedMessage(auditRecord);

      if (delType === 'for_everyone') {
        if (targetIdx !== -1) {
          list.splice(targetIdx, 1);
          inMemoryMessages = list;
          try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (e) {}
        }
      } else {
        if (targetIdx !== -1) {
          list[targetIdx].deletedFor = list[targetIdx].deletedFor || [];
          const cleanUser = (deletedBy || '').toLowerCase();
          if (!list[targetIdx].deletedFor.includes(cleanUser)) {
            list[targetIdx].deletedFor.push(cleanUser);
          }
          inMemoryMessages = list;
          try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (e) {}
        }
      }

      io.to('love_chat_room').emit('message_deleted', {
        messageId: messageId,
        deleteType: delType,
        deletedBy: deletedBy
      });
    });

    socket.on('launch_wish', (data) => {
      const { wishText, sender } = data || {};
      if (!wishText || !wishText.trim()) return;

      updateHttpPresence(sender);

      const newWish = {
        id: 'wish_' + Date.now(),
        sender: sender || 'Vanshika 👸',
        text: wishText.trim(),
        timestamp: new Date().toISOString(),
        formattedTime: getISTTimeString()
      };

      saveWish(newWish);
      io.to('love_chat_room').emit('new_sky_lantern', newWish);
    });

    socket.on('typing', (data) => {
      const isTyping = data && data.isTyping !== false;
      socket.to('love_chat_room').emit('user_typing', { sender: (data && data.sender) || 'Partner', isTyping: isTyping });
    });

    socket.on('typing_start', (data) => {
      socket.to('love_chat_room').emit('user_typing', { sender: data.sender, isTyping: true });
    });

    socket.on('typing_stop', (data) => {
      socket.to('love_chat_room').emit('user_typing', { sender: data.sender, isTyping: false });
    });

    socket.on('disconnect', () => {
      if (socketUserRole) {
        const nowStr = getISTTimeString();
        if (socketUserRole === 'vanshika') {
          onlineUsers.vanshika.isOnline = false;
          onlineUsers.vanshika.lastSeen = nowStr;
        } else if (socketUserRole === 'rakesh') {
          onlineUsers.rakesh.isOnline = false;
          onlineUsers.rakesh.lastSeen = nowStr;
        }
        io.to('love_chat_room').emit('presence_update', onlineUsers);
      }
    });
  });
}

// REST API Endpoints (Vercel Production & Fallback)
app.post('/api/auth/login', (req, res) => {
  const { sender, pin, device, failed } = req.body;
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
    if (typeof io !== 'undefined') {
      io.emit('session_activity', { count: sessions.filter(s => s.status === 'active').length, newSession: sessionRecord });
    }
    return res.json({ success: true, sessionId: sessionId, message: 'Authenticated successfully!' });
  } else {
    if (typeof io !== 'undefined') {
      io.emit('session_alert', { alert: '⚠️ Security Alert: Failed Passcode Attempt!', session: sessionRecord });
    }
    return res.status(401).json({ success: false, error: 'Access Denied: Invalid Passcode!' });
  }
});

app.post('/api/messages', (req, res) => {
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
      sender: sender,
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
    if (io) io.to('love_chat_room').emit('new_message', newMsg);
    return res.json({ success: true, data: newMsg });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/messages/status', (req, res) => {
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
        inMemoryMessages = list;
        try {
          fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2));
        } catch (e) {}
        if (io) io.to('love_chat_room').emit('messages_status_update', { messageIds, status: status || 'read' });
      }
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/presence/ping', (req, res) => {
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

app.get('/api/messages', (req, res) => {
  try {
    const sender = req.query.sender;
    if (sender) updateHttpPresence(sender);
    cleanExpiredPresence();

    let all = getMessages();
    if (sender) {
      const cleanSender = sender.toLowerCase();
      all = all.filter(m => !m.deletedFor || !m.deletedFor.some(u => cleanSender.includes(u) || u.includes(cleanSender)));
    }

    return res.json({ success: true, count: all.length, data: all, presence: onlineUsers });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/messages/delete', (req, res) => {
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
      messageId: messageId,
      deleteType: delType,
      deletedBy: deletedBy || 'Unknown',
      deletedAt: now.toISOString(),
      deletedAtFormatted: getISTTimeString(now) + ' (' + getISTDateString(now) + ')',
      originalSender: targetMsg ? targetMsg.sender : 'Unknown',
      message: targetMsg ? targetMsg.message : (req.body.message || ''),
      mediaType: targetMsg ? targetMsg.mediaType : (req.body.mediaType || null),
      mediaUrl: targetMsg ? targetMsg.mediaUrl : (req.body.mediaUrl || null),
      fileName: targetMsg ? targetMsg.fileName : (req.body.fileName || null),
      originalTimestamp: targetMsg ? targetMsg.timestamp : null
    };

    saveDeletedMessage(auditRecord);

    if (delType === 'for_everyone') {
      if (targetIdx !== -1) {
        list.splice(targetIdx, 1);
        inMemoryMessages = list;
        try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (e) {}
      }
    } else {
      if (targetIdx !== -1) {
        list[targetIdx].deletedFor = list[targetIdx].deletedFor || [];
        const cleanUser = (deletedBy || '').toLowerCase();
        if (!list[targetIdx].deletedFor.includes(cleanUser)) {
          list[targetIdx].deletedFor.push(cleanUser);
        }
        inMemoryMessages = list;
        try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (e) {}
      }
    }

    if (io) {
      io.to('love_chat_room').emit('message_deleted', {
        messageId: messageId,
        deleteType: delType,
        deletedBy: deletedBy
      });
    }

    return res.json({ success: true, messageId: messageId, deleteType: delType });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/messages/clear', (req, res) => {
  try {
    const { sender, pin } = req.body;
    if (!isValidPin(sender, pin)) {
      return res.status(401).json({ success: false, error: 'Access Denied: Invalid Passcode!' });
    }
    inMemoryMessages = [];
    try {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
    } catch (err) {}

    if (io) io.to('love_chat_room').emit('chat_cleared', { messages: [] });
    return res.json({ success: true, message: 'Chat room cleared successfully!', data: [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/wishes', (req, res) => {
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
    if (io) io.to('love_chat_room').emit('new_sky_lantern', newWish);
    return res.json({ success: true, data: newWish });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/wishes', (req, res) => {
  try {
    return res.json({ success: true, count: getWishes().length, data: getWishes() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Permanent Reel Video File Uploader (Supports multiple reels with custom filename or indexed names)
app.post('/api/upload-reel', express.raw({ type: '*/*', limit: '200mb' }), (req, res) => {
  try {
    if (!req.body || !req.body.length) {
      return res.status(400).json({ success: false, error: 'Empty video payload' });
    }
    const rawName = (req.query.name || req.headers['x-reel-name'] || 'vanshika-reel.mp4').toString();
    const safeName = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetFilename = safeName.endsWith('.mp4') ? safeName : `${safeName}.mp4`;

    const targetDir = path.join(__dirname, 'assests');
    const publicTargetDir = path.join(__dirname, 'public', 'assests');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    if (!fs.existsSync(publicTargetDir)) fs.mkdirSync(publicTargetDir, { recursive: true });

    const filePath = path.join(targetDir, targetFilename);
    const publicFilePath = path.join(publicTargetDir, targetFilename);

    fs.writeFileSync(filePath, req.body);
    fs.writeFileSync(publicFilePath, req.body);

    if (targetFilename.includes('reel-1') || targetFilename === 'vanshika-reel.mp4') {
      try {
        fs.writeFileSync(path.join(targetDir, 'vanshika-reel.mp4'), req.body);
        fs.writeFileSync(path.join(publicTargetDir, 'vanshika-reel.mp4'), req.body);
      } catch (e) {}
    }

    return res.json({ success: true, url: `assests/${targetFilename}`, filename: targetFilename });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ADMIN-ONLY PROTECTED API ENDPOINTS
// Only Rakesh (PIN: 1212) can access these
// ==========================================

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'rakesh1212admin';

function isAdminAuth(req) {
  const pin = req.body && req.body.admin_pin;
  const secret = req.headers['x-admin-secret'] || (req.body && req.body.admin_secret);
  return pin === 'Vanshika170926' || secret === ADMIN_SECRET;
}

// GET: List all saved reel files on disk
app.get('/api/admin/reels', (req, res) => {
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  try {
    const dirs = [
      path.join(__dirname, 'assests'),
      path.join(__dirname, 'public', 'assests')
    ];
    let reels = [];
    const primary = dirs[0];
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

// DELETE: Remove a specific reel file from disk
app.delete('/api/admin/reels/:filename', (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  try {
    const rawName = req.params.filename;
    const safeName = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!safeName.endsWith('.mp4')) {
      return res.status(400).json({ success: false, error: 'Only .mp4 files allowed' });
    }

    let deleted = 0;
    const dirs = [
      path.join(__dirname, 'assests', safeName),
      path.join(__dirname, 'public', 'assests', safeName)
    ];
    dirs.forEach(fp => {
      if (fs.existsSync(fp)) {
        fs.unlinkSync(fp);
        deleted++;
      }
    });

    return res.json({ success: true, deleted, message: `${safeName} deleted successfully` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Clear all messages (Admin only)
app.post('/api/admin/messages/clear', (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  try {
    inMemoryMessages = [];
    try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2)); } catch (e) {}
    if (io) io.to('love_chat_room').emit('chat_cleared', { messages: [] });
    return res.json({ success: true, message: 'All messages cleared!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Clear all wishes (Admin only)
app.post('/api/admin/wishes/clear', (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  try {
    inMemoryWishes = [];
    try { fs.writeFileSync(WISHES_FILE, JSON.stringify([], null, 2)); } catch (e) {}
    return res.json({ success: true, message: 'All wishes cleared!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Delete a single message by ID (Admin only)
app.delete('/api/admin/messages/:id', (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  try {
    const { id } = req.params;
    const before = inMemoryMessages.length;
    inMemoryMessages = inMemoryMessages.filter(m => m.id !== id);
    try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(inMemoryMessages, null, 2)); } catch (e) {}
    if (io) io.to('love_chat_room').emit('message_deleted', { id });
    return res.json({ success: true, deleted: before - inMemoryMessages.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET / POST: List all deleted messages (Admin only)
app.get('/api/admin/deleted-messages', (req, res) => {
  const pin = req.headers['x-admin-pin'] || req.query.admin_pin;
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (pin !== 'Vanshika170926' && secret !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  const list = getDeletedMessages();
  return res.json({ success: true, count: list.length, data: list });
});

app.post('/api/admin/deleted-messages', (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  const list = getDeletedMessages();
  return res.json({ success: true, count: list.length, data: list });
});

app.post('/api/admin/deleted-messages/clear', (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  inMemoryDeletedMessages = [];
  try { fs.writeFileSync(DELETED_MESSAGES_FILE, JSON.stringify([], null, 2)); } catch (e) {}
  return res.json({ success: true, message: 'Deleted messages vault cleared!' });
});

// GET: List all login sessions and devices
app.get('/api/admin/sessions', (req, res) => {
  const pin = req.headers['x-admin-pin'] || req.query.admin_pin;
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (pin !== 'Vanshika170926' && secret !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  const sessions = getLoginSessions();
  const nowMs = Date.now();
  const enriched = sessions.map(s => {
    const isOnlineNow = s.status === 'active' && (nowMs - (s.lastActiveMs || 0) < 3 * 60 * 1000);
    return {
      ...s,
      isOnlineNow: isOnlineNow
    };
  });
  return res.json({ success: true, count: enriched.length, data: enriched });
});

// POST: Terminate a specific device session
app.post('/api/admin/sessions/terminate', (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  const { sessionId } = req.body;
  const sessions = getLoginSessions();
  const target = sessions.find(s => s.id === sessionId);
  if (target) {
    target.status = 'terminated';
    target.terminatedAt = new Date().toISOString();
    target.terminatedAtIST = `${getISTDateString()}, ${getISTTimeString()}`;
    saveLoginSessions();

    if (typeof io !== 'undefined') {
      io.emit('force_logout', { sessionId: sessionId, sender: target.sender, reason: `Session terminated remotely by Rakesh for ${target.deviceName}.` });
    }
    return res.json({ success: true, message: `Session for ${target.deviceName} (${target.sender}) terminated successfully!` });
  } else {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }
});

// POST: Terminate all active sessions (Logout all other devices)
app.post('/api/admin/sessions/terminate-all', (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
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
  if (typeof io !== 'undefined') {
    io.emit('force_logout', { reason: 'All active sessions were terminated by Admin.' });
  }
  return res.json({ success: true, count, message: `All ${count} active sessions terminated successfully!` });
});

// DELETE: Delete a session log entry
app.delete('/api/admin/sessions/:id', (req, res) => {
  const pin = req.headers['x-admin-pin'] || req.query.admin_pin;
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (pin !== 'Vanshika170926' && secret !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  const { id } = req.params;
  inMemorySessions = getLoginSessions().filter(s => s.id !== id);
  saveLoginSessions();
  return res.json({ success: true, message: 'Session log removed' });
});

// POST: Clear all session logs
app.post('/api/admin/sessions/clear', (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  inMemorySessions = [];
  try { fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2)); } catch (e) {}
  return res.json({ success: true, message: 'All session logs cleared' });
});

// GET: Full admin dashboard status
app.get('/api/admin/status', (req, res) => {
  const pin = req.headers['x-admin-pin'] || req.query.admin_pin;
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (pin !== 'Vanshika170926' && secret !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Admin access denied' });
  }
  try {
    // Count server reels
    let reelCount = 0;
    const reelDir = path.join(__dirname, 'public', 'assests');
    if (fs.existsSync(reelDir)) {
      reelCount = fs.readdirSync(reelDir).filter(f => f.endsWith('.mp4')).length;
    }
    const allSessions = getLoginSessions();
    const activeSessionsCount = allSessions.filter(s => s.status === 'active').length;

    return res.json({
      success: true,
      stats: {
        totalMessages: getMessages().length,
        totalDeletedMessages: getDeletedMessages().length,
        totalWishes: getWishes().length,
        totalReelsOnServer: reelCount,
        totalActiveSessions: activeSessionsCount,
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

// Admin Panel Route (returns admin.html)
app.get('/admin', (req, res) => {
  const publicAdmin = path.join(__dirname, 'public', 'admin.html');
  if (fs.existsSync(publicAdmin)) return res.sendFile(publicAdmin);
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('*', (req, res) => {
  const publicIndex = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(publicIndex)) return res.sendFile(publicIndex);
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`🚀 Realtime Hybrid Chat Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

