const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Persistent Storage Directories
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.json');

// Memory fallbacks for serverless environments (Vercel)
let inMemoryMessages = [
  {
    id: 'msg_welcome_1',
    sender: 'Humsafar 🤵',
    message: 'Dearest Vanshika, this is our private live chat room. Here we can talk to each other anytime! ❤️',
    timestamp: new Date().toISOString(),
    formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    formattedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
];

let inMemoryWishes = [];

// Helper functions for reading & writing data
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
  list.push(msgObj); // append chronologically for chat
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

// ================= REST API ENDPOINTS =================

// 1. Send Chat Message (Supports both Vanshika and Him!)
app.post('/api/messages', (req, res) => {
  const { sender, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Message cannot be empty' });
  }

  const newMsg = {
    id: 'msg_' + Date.now(),
    sender: sender || 'Vanshika ❤️',
    message: message.trim(),
    timestamp: new Date().toISOString(),
    formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    formattedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };

  saveMessage(newMsg);
  console.log(`💬 [CHAT] ${newMsg.sender}: ${newMsg.message}`);
  return res.json({ success: true, message: 'Message sent!', data: newMsg });
});

// 2. Fetch Full Chat Conversation History
app.get('/api/messages', (req, res) => {
  const messages = getMessages();
  return res.json({ success: true, count: messages.length, data: messages });
});

// 3. Clear Chat History
app.post('/api/messages/clear', (req, res) => {
  inMemoryMessages = [];
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
    }
  } catch (e) {}
  return res.json({ success: true, message: 'Chat cleared' });
});

// 4. Save Sky Lantern Wish
app.post('/api/wishes', (req, res) => {
  const { wishText, sender } = req.body;
  if (!wishText || !wishText.trim()) {
    return res.status(400).json({ success: false, error: 'Wish text required' });
  }

  const newWish = {
    id: 'wish_' + Date.now(),
    sender: sender || 'Vanshika',
    text: wishText.trim(),
    timestamp: new Date().toISOString(),
    formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };

  saveWish(newWish);
  return res.json({ success: true, data: newWish });
});

// 5. Get Sky Lantern Wishes
app.get('/api/wishes', (req, res) => {
  const wishes = getWishes();
  return res.json({ success: true, count: wishes.length, data: wishes });
});

// Serve frontend files (Supports both root directory and public folder uploads)
if (fs.existsSync(path.join(__dirname, 'public'))) {
  app.use(express.static(path.join(__dirname, 'public')));
}
app.use(express.static(__dirname));

app.get('/admin', (req, res) => {
  const publicAdmin = path.join(__dirname, 'public', 'admin.html');
  if (fs.existsSync(publicAdmin)) return res.sendFile(publicAdmin);
  const rootAdmin = path.join(__dirname, 'admin.html');
  if (fs.existsSync(rootAdmin)) return res.sendFile(rootAdmin);
  res.send('Admin Inbox file pending upload.');
});

app.get('*', (req, res) => {
  const publicIndex = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(publicIndex)) return res.sendFile(publicIndex);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Vanshika Live Fullstack Chat Server running on http://localhost:${PORT}`);
    console.log(`📌 Admin Inbox available at http://localhost:${PORT}/admin.html`);
  });
}

module.exports = app;
