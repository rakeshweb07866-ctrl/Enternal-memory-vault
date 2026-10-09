const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Persistent Storage Directory (Use os.tmpdir() on Vercel to avoid read-only filesystem EROFS error)
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

// Memory fallbacks
let inMemoryMessages = [
  {
    id: 'msg_welcome_1',
    sender: 'Soulmate ??',
    message: 'Dearest Vanshika, welcome to our private live chat room! Here we can talk anytime! ???',
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
  } catch (err) {
    console.error('File write error:', err);
  }
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

// REST API ENDPOINTS

// 1. Send Chat Message
app.post('/api/messages', (req, res) => {
  try {
    const { sender, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newMsg = {
      id: 'msg_' + Date.now(),
      sender: sender || 'Vanshika ??',
      message: message.trim(),
      timestamp: now.toISOString(),
      formattedTime: formattedTime,
      formattedDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    saveMessage(newMsg);
    return res.json({ success: true, message: 'Message sent!', data: newMsg });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Fetch Full Chat Conversation History
app.get('/api/messages', (req, res) => {
  try {
    const messages = getMessages();
    return res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
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
  try {
    const { wishText, sender } = req.body;
    if (!wishText || !wishText.trim()) {
      return res.status(400).json({ success: false, error: 'Wish text required' });
    }

    const newWish = {
      id: 'wish_' + Date.now(),
      sender: sender || 'Vanshika ??',
      text: wishText.trim(),
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    saveWish(newWish);
    return res.json({ success: true, data: newWish });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get Sky Lantern Wishes
app.get('/api/wishes', (req, res) => {
  try {
    const wishes = getWishes();
    return res.json({ success: true, count: wishes.length, data: wishes });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

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

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Vanshika Live Chat Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
