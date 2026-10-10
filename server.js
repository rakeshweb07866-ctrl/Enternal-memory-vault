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

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
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

// Strict Private Security Passcodes
const VALID_PINS = {
  'vanshika': ['1709'],
  'rakesh': ['1212'],
  'soulmate': ['1212']
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

// Presence State Tracker
let onlineUsers = {
  vanshika: { isOnline: false, lastSeen: null, lastPing: 0 },
  rakesh: { isOnline: false, lastSeen: null, lastPing: 0 }
};

function updateHttpPresence(sender) {
  if (!sender) return;
  const s = sender.toLowerCase();
  const now = Date.now();
  const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

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
  if (onlineUsers.vanshika.isOnline && now - onlineUsers.vanshika.lastPing > 6000) {
    onlineUsers.vanshika.isOnline = false;
  }
  if (onlineUsers.rakesh.isOnline && now - onlineUsers.rakesh.lastPing > 6000) {
    onlineUsers.rakesh.isOnline = false;
  }
}

// Default Memory Fallbacks
let inMemoryMessages = [
  {
    id: 'msg_welcome_1',
    sender: 'Soulmate 🤵',
    message: 'Dearest Vanshika, welcome to our private secure chat room! ❤️✨',
    timestamp: new Date().toISOString(),
    formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    formattedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
];

let inMemoryWishes = [];

function getMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {}
  return inMemoryMessages;
}

function saveMessage(msgObj) {
  let list = getMessages();
  list.push(msgObj);
  if (list.length > 30) {
    list = list.slice(list.length - 30);
  }
  inMemoryMessages = list;
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2));
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
      const { sender, pin, message } = data || {};
      if (!isValidPin(sender, pin)) {
        socket.emit('chat_error', { message: 'Access Denied: Invalid Security Passcode.' });
        return;
      }

      if (!message || !message.trim()) return;
      updateHttpPresence(sender);

      const now = new Date();
      const newMsg = {
        id: 'msg_' + Date.now(),
        sender: sender,
        message: message.trim(),
        timestamp: now.toISOString(),
        formattedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        formattedDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };

      saveMessage(newMsg);
      io.to('love_chat_room').emit('new_message', newMsg);
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
        formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      };

      saveWish(newWish);
      io.to('love_chat_room').emit('new_sky_lantern', newWish);
    });

    socket.on('typing_start', (data) => {
      socket.to('love_chat_room').emit('user_typing', { sender: data.sender, isTyping: true });
    });

    socket.on('typing_stop', (data) => {
      socket.to('love_chat_room').emit('user_typing', { sender: data.sender, isTyping: false });
    });

    socket.on('disconnect', () => {
      if (socketUserRole) {
        const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
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
  const { sender, pin } = req.body;
  if (isValidPin(sender, pin)) {
    updateHttpPresence(sender);
    return res.json({ success: true, message: 'Authenticated successfully!' });
  } else {
    return res.status(401).json({ success: false, error: 'Access Denied: Invalid Passcode!' });
  }
});

app.post('/api/messages', (req, res) => {
  try {
    const { sender, pin, message } = req.body;
    if (!isValidPin(sender, pin)) {
      return res.status(401).json({ success: false, error: 'Access Denied: Invalid Passcode!' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    updateHttpPresence(sender);

    const now = new Date();
    const newMsg = {
      id: 'msg_' + Date.now(),
      sender: sender,
      message: message.trim(),
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      formattedDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    saveMessage(newMsg);
    if (io) io.to('love_chat_room').emit('new_message', newMsg);
    return res.json({ success: true, data: newMsg });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/messages', (req, res) => {
  try {
    const sender = req.query.sender;
    if (sender) updateHttpPresence(sender);
    cleanExpiredPresence();

    return res.json({ success: true, count: getMessages().length, data: getMessages(), presence: onlineUsers });
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
    const welcomeMsg = {
      id: 'msg_welcome_' + Date.now(),
      sender: 'Soulmate 🤵',
      message: 'Chat cleared! Start a fresh conversation ❤️✨',
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      formattedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    inMemoryMessages = [welcomeMsg];
    try {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(inMemoryMessages, null, 2));
    } catch (err) {}

    if (io) io.to('love_chat_room').emit('chat_cleared', { messages: inMemoryMessages });
    return res.json({ success: true, message: 'Chat room cleared successfully!', data: inMemoryMessages });
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
      formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
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
