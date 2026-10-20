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
let currentChatPin = sessionStorage.getItem('chat_user_pin') || '';
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

  // Pre-select previous user identity if available
  const savedUser = localStorage.getItem('chat_user_name');
  if (savedUser) {
    selectIdentity(savedUser);
  }

  // Remove any fast-gate hide style
  const fastGateStyle = document.getElementById('auth-fast-gate');
  if (fastGateStyle) fastGateStyle.remove();

  if (pinInput) {
    pinInput.value = '';
    pinInput.type = 'password';
    setTimeout(() => pinInput.focus(), 150);
  }
  if (eyeIcon) eyeIcon.innerText = '👁️';
  if (errEl) errEl.classList.add('hidden');
  if (modal) {
    modal.style.display = '';
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

// Dynamic Passcode Memory & Instant 0ms Unlock Engine
let cachedSecurityPins = {
  vanshika: '1709',
  rakesh: '1212',
  admin: 'Vanshika170926'
};

try {
  const localStored = localStorage.getItem('cached_security_pins');
  if (localStored) {
    cachedSecurityPins = { ...cachedSecurityPins, ...JSON.parse(localStored) };
  }
} catch (e) {}

function isKnownSecurityPin(p) {
  const pin = String(p || '').trim();
  return (
    pin === '1709' ||
    pin === '1212' ||
    pin === 'Vanshika170926' ||
    pin === cachedSecurityPins.vanshika ||
    pin === cachedSecurityPins.rakesh ||
    pin === cachedSecurityPins.admin
  );
}

function getIdentityFromPin(p) {
  const pin = String(p || '').trim();
  if (pin === '1709' || pin === cachedSecurityPins.vanshika) {
    return 'Vanshika 👸';
  }
  if (
    pin === '1212' ||
    pin === 'Vanshika170926' ||
    pin === cachedSecurityPins.rakesh ||
    pin === cachedSecurityPins.admin
  ) {
    return 'Rakesh 🤵';
  }
  return null;
}

function applySuccessfulLogin(name, pin, authSessionId) {
  currentChatSender = name;
  currentChatPin = pin;
  sessionStorage.setItem('chat_user_name', name);
  sessionStorage.setItem('chat_user_pin', pin);
  localStorage.setItem('chat_user_name', name);
  localStorage.removeItem('chat_user_pin');

  if (authSessionId) {
    sessionStorage.setItem('chat_session_id', authSessionId);
  }

  // Ensure zero-flicker style exists to keep modal suppressed during this active session
  let fastGateStyle = document.getElementById('auth-fast-gate');
  if (!fastGateStyle) {
    fastGateStyle = document.createElement('style');
    fastGateStyle.id = 'auth-fast-gate';
    fastGateStyle.innerHTML = '#name-login-modal { display: none !important; }';
    document.head.appendChild(fastGateStyle);
  }

  const modal = document.getElementById('name-login-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
  }
  const errEl = document.getElementById('login-error-msg');
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
}

async function confirmNameLogin() {
  const nameInput = document.getElementById('login-name-input');
  const pinInput = document.getElementById('login-pin-input');
  const errEl = document.getElementById('login-error-msg');
  const submitBtn = document.getElementById('login-submit-btn');

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

  // 1. FAST PATH (0ms Instant Unlock): If PIN matches known passcodes, unlock IMMEDIATELY without waiting!
  if (isKnownSecurityPin(pin)) {
    const autoIdent = getIdentityFromPin(pin);
    if (autoIdent) name = autoIdent;

    // Instant UI unlock - 0ms response!
    applySuccessfulLogin(name, pin);

    // Asynchronous background device & session telemetry logging (non-blocking)
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: name, pin: pin, device: clientDevice, failed: false })
    }).then(res => res.json()).then(data => {
      if (data && data.sessionId) {
        sessionStorage.setItem('chat_session_id', data.sessionId);
      }
    }).catch(err => {
      console.log('Background auth audit log note:', err);
    });

    return;
  }

  // 2. SERVER FALLBACK PATH: If PIN is newly changed or unknown locally, verify with server
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Verifying Passcode... ✨';
  }

  let authenticated = false;
  let authSessionId = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: name, pin: pin, device: clientDevice, failed: false }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (res.ok && data && data.success) {
      authenticated = true;
      if (data.sender) name = data.sender;
      if (data.sessionId) authSessionId = data.sessionId;

      // Cache newly confirmed pin locally for future 0ms instant logins
      if (name.includes('Vanshika')) cachedSecurityPins.vanshika = pin;
      else cachedSecurityPins.rakesh = pin;
      try {
        localStorage.setItem('cached_security_pins', JSON.stringify(cachedSecurityPins));
      } catch (e) {}
    }
  } catch (err) {
    // Offline fallback for known defaults
    if (pin === '1212' || pin === 'Vanshika170926') {
      name = 'Rakesh 🤵';
      authenticated = true;
    } else if (pin === '1709') {
      name = 'Vanshika 👸';
      authenticated = true;
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Enter Our World 💖';
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

  applySuccessfulLogin(name, pin, authSessionId);
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
