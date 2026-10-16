// ==========================================
// CONFIGURATION, CONSTANTS & AUTH HELPERS
// ==========================================

// Google Firebase Realtime Cloud Configuration (Permanent 24/7 Live Sync)
window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
  apiKey: "AIzaSyAqygqdmAhCs58MEvYLUT5DRSeO8FSGphA",
  authDomain: "memory-vault-e88b0.firebaseapp.com",
  databaseURL: "https://memory-vault-e88b0-default-rtdb.firebaseio.com",
  projectId: "memory-vault-e88b0",
  storageBucket: "memory-vault-e88b0.firebasestorage.app",
  messagingSenderId: "1866879743538",
  appId: "1:1866879743538:web:708610f17db3cf4263ee2b"
};

// Storage Keys
const VAULT_MSG_STORAGE_KEY = 'eternal_vault_chat_messages_v3';
const FIREBASE_CONFIG_KEY = 'vault_firebase_config';
const PLAYLIST_STORAGE_KEY = 'love_vault_playlist';
const FEATURED_SONG_KEY = 'love_vault_featured_song';
const VOLUME_KEY = 'love_music_volume';

// Global Engine State Variables
let socket = null;
let fbApp = null;
let fbDb = null;
let isFirebaseActive = false;
let currentChatSender = sessionStorage.getItem('chat_user_name') || localStorage.getItem('chat_user_name') || '';
let currentChatPin = sessionStorage.getItem('chat_user_pin') || localStorage.getItem('chat_user_pin') || '';
let previousMsgCount = 0;
let isPlayingMusic = false;
let typingTimeout = null;
let annivAutoTriggered = false;
let offlinePendingQueue = [];
let unreadBelowCount = 0;
let latestPresenceState = { vanshika: { isOnline: false }, rakesh: { isOnline: false } };
let renderedMsgIds = new Set();
let renderedDatesSet = new Set();

// Helper: Scroll to element smoothly
function scrollToElement(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// Helper: Check user login before chat input focus
function checkUserLoginBeforeChat() {
  if (!currentChatSender || !currentChatPin) {
    openNameLoginModal();
  }
}

// Identity & PIN Login Modal
function openNameLoginModal() {
  const modal = document.getElementById('name-login-modal');
  const pinInput = document.getElementById('login-pin-input');
  const errEl = document.getElementById('login-error-msg');
  const eyeIcon = document.getElementById('eye-icon');

  if (pinInput) {
    pinInput.value = '';
    pinInput.type = 'password';
    setTimeout(() => pinInput.focus(), 100);
  }
  if (eyeIcon) eyeIcon.innerText = '👁️';
  if (errEl) errEl.classList.add('hidden');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function togglePasscodeVisibility() {
  const pinInput = document.getElementById('login-pin-input');
  const eyeIcon = document.getElementById('eye-icon');
  if (!pinInput || !eyeIcon) return;

  if (pinInput.type === 'password') {
    pinInput.type = 'text';
    eyeIcon.innerText = '🙈';
  } else {
    pinInput.type = 'password';
    eyeIcon.innerText = '👁️';
  }
}

function selectIdentity(name) {
  const input = document.getElementById('login-name-input');
  if (input) input.value = name;
  const btnV = document.getElementById('btn-identity-vanshika');
  const btnR = document.getElementById('btn-identity-rakesh');

  if (name.includes('Vanshika')) {
    if (btnV) btnV.className = 'flex-1 py-2.5 rounded-xl bg-rose-500/30 border-2 border-rose-400 text-xs font-bold text-rose-300 shadow-md';
    if (btnR) btnR.className = 'flex-1 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-xs font-bold text-slate-400 hover:text-amber-300';
  } else {
    if (btnR) btnR.className = 'flex-1 py-2.5 rounded-xl bg-amber-500/30 border-2 border-amber-400 text-xs font-bold text-amber-300 shadow-md';
    if (btnV) btnV.className = 'flex-1 py-2.5 rounded-xl bg-slate-900 border border-rose-500/40 text-xs font-bold text-slate-400 hover:text-rose-300';
  }
}

async function confirmNameLogin() {
  const nameInput = document.getElementById('login-name-input');
  const pinInput = document.getElementById('login-pin-input');
  const errEl = document.getElementById('login-error-msg');

  let name = nameInput ? nameInput.value.trim() : 'Vanshika 👸';
  const pin = pinInput ? pinInput.value.trim() : '';

  if (!pin) {
    if (errEl) {
      errEl.innerText = '⚠️ Please enter your secret passcode!';
      errEl.classList.remove('hidden');
    }
    if (pinInput) pinInput.focus();
    return;
  }

  const clientDevice = {
    userAgent: navigator.userAgent || '',
    platform: navigator.platform || '',
    screen: `${window.screen.width || 0}x${window.screen.height || 0}`,
    language: navigator.language || ''
  };

  // 1. Dynamic Server Passcode Verification with Auto-Identity Detection
  let authenticated = false;
  let authSessionId = null;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: name, pin: pin, device: clientDevice, failed: false })
    });
    const data = await res.json();
    if (res.ok && data && data.success) {
      authenticated = true;
      if (data.sender) name = data.sender;
      if (data.sessionId) authSessionId = data.sessionId;
    }
  } catch (err) {
    // Offline fallback if server is temporarily unreachable
    if (pin === '1212' || pin === 'Vanshika170926') {
      name = 'Rakesh 🤵';
      authenticated = true;
    } else if (pin === '1709') {
      name = 'Vanshika 👸';
      authenticated = true;
    }
  }

  if (!authenticated) {
    if (errEl) {
      errEl.innerText = '❌ Incorrect Security Passcode! Please try again.';
      errEl.classList.remove('hidden');
    }
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
    return;
  }

  // 2. Instant UI Unlock - Modal disappears immediately
  currentChatSender = name;
  currentChatPin = pin;
  sessionStorage.setItem('chat_user_name', name);
  sessionStorage.setItem('chat_user_pin', pin);
  localStorage.setItem('chat_user_name', name);
  if (authSessionId) {
    sessionStorage.setItem('chat_session_id', authSessionId);
  }

  const modal = document.getElementById('name-login-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  if (errEl) errEl.classList.add('hidden');
  updateUserBadge();

  if (socket && socket.connected) {
    socket.emit('user_join', { sender: currentChatSender, pin: currentChatPin });
  } else if (typeof initSocketConnection === 'function') {
    initSocketConnection();
  }
  if (typeof fetchLiveChatMessages === 'function') {
    fetchLiveChatMessages();
  }

  // 4. If Anniversary is active, trigger grand cinematic celebration
  if (typeof isAnniversaryActive === 'function' && isAnniversaryActive()) {
    setTimeout(playGrandCinematicAnniversaryAnimation, 350);
  }
}

function updateUserBadge() {
  const badge = document.getElementById('current-user-badge');
  if (badge) badge.innerText = currentChatSender || 'Not Set';
}

// ==========================================
// TIME & FORMATTING HELPERS
// ==========================================
function getISTTimeString(isoString) {
  const d = isoString ? new Date(isoString) : new Date();
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
}

function getISTDateString(isoString) {
  const d = isoString ? new Date(isoString) : new Date();
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' });
}

function getMessageDayLabel(isoString) {
  if (!isoString) return 'Today';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'Today';
  const now = new Date();
  const isToday = d.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }) === now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
  if (isToday) return 'Today';
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const isYesterday = d.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }) === yesterday.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeChatHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
