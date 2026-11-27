// ==========================================
// PRESENCE TRACKER
// Online/Offline user tracking
// ==========================================

const { getISTTimeString } = require('./helpers');

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

function getOnlineUsers() { return onlineUsers; }

module.exports = { onlineUsers, updateHttpPresence, cleanExpiredPresence, getOnlineUsers };
