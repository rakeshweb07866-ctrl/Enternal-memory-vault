// ==========================================
// DATA STORE (In-Memory + File Persistence)
// Messages, Wishes, Sessions Storage
// ==========================================

const fs = require('fs');
const path = require('path');
const os = require('os');

// Determine data directory
let DATA_DIR;
try {
  if (process.env.VERCEL || fs.existsSync('/tmp')) {
    DATA_DIR = path.join(os.tmpdir(), 'vanshika_data');
  } else {
    DATA_DIR = path.join(__dirname, '../../data');
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

// In-memory caches
let inMemoryMessages = [];
let inMemoryWishes = [];
let inMemoryDeletedMessages = [];
let inMemorySessions = [];

// ==========================================
// MESSAGES
// ==========================================
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
  if (list.length > 500) list = list.slice(list.length - 500);
  inMemoryMessages = list;
  try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (err) {}
}

function clearMessages() {
  inMemoryMessages = [];
  try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2)); } catch (e) {}
}

// ==========================================
// DELETED MESSAGES
// ==========================================
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
  try { fs.writeFileSync(DELETED_MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (err) {}
}

function clearDeletedMessages() {
  inMemoryDeletedMessages = [];
  try { fs.writeFileSync(DELETED_MESSAGES_FILE, JSON.stringify([], null, 2)); } catch (e) {}
}

// ==========================================
// WISHES
// ==========================================
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
  try { fs.writeFileSync(WISHES_FILE, JSON.stringify(inMemoryWishes, null, 2)); } catch (err) {}
}

function clearWishes() {
  inMemoryWishes = [];
  try { fs.writeFileSync(WISHES_FILE, JSON.stringify([], null, 2)); } catch (e) {}
}

// ==========================================
// LOGIN SESSIONS
// ==========================================
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

function getInMemorySessions() { return inMemorySessions; }
function setInMemorySessions(arr) { inMemorySessions = arr; }
function getInMemoryMessages() { return inMemoryMessages; }

module.exports = {
  DATA_DIR, MESSAGES_FILE, WISHES_FILE, DELETED_MESSAGES_FILE, SESSIONS_FILE,
  getMessages, saveMessage, clearMessages,
  getDeletedMessages, saveDeletedMessage, clearDeletedMessages,
  getWishes, saveWish, clearWishes,
  getLoginSessions, saveLoginSessions,
  getInMemorySessions, setInMemorySessions, getInMemoryMessages
};
