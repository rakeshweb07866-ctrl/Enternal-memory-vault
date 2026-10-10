const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

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
  vanshika: { isOnline: false, lastSeen: null },
  rakesh: { isOnline: false, lastSeen: null }
};

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

// Socket.io Real-Time Event System
io.on('connection', (socket) => {
  let socketUserRole = null;

  socket.on('user_join', (data) => {
    const { sender, pin } = data || {};
    if (!isValidPin(sender, pin)) {
      socket.emit('auth_error', { message: 'Invalid Passcode! Access Denied.' });
      return;
    }

    const s = (sender || '').toLowerCase();
    if (s.includes('vanshika')) {
      socketUserRole = 'vanshika';
      onlineUsers.vanshika.isOnline = true;
    } else {
      socketUserRole = 'rakesh';
      onlineUsers.rakesh.isOnline = true;
    }

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

  // REALTIME SKY LANTERN WISH BROADCAST
  socket.on('launch_wish', (data) => {
    const { wishText, sender } = data || {};
    if (!wishText || !wishText.trim()) return;

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

// REST API Endpoints with Strict Authentication
app.post('/api/auth/login', (req, res) => {
  const { sender, pin } = req.body;
  if (isValidPin(sender, pin)) {
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
    return res.json({ success: true, data: newMsg });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/messages', (req, res) => {
  try {
    return res.json({ success: true, count: getMessages().length, data: getMessages(), presence: onlineUsers });
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

    const newWish = {
      id: 'wish_' + Date.now(),
      sender: sender || 'Vanshika 👸',
      text: wishText.trim(),
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    saveWish(newWish);
    io.to('love_chat_room').emit('new_sky_lantern', newWish);
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
    console.log(`🚀 Realtime Socket.io Chat Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
