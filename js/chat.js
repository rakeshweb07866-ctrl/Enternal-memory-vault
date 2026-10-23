// ==========================================
// REALTIME LIVE CHAT ENGINE
// (Firebase RTDB + Socket.io Fallback + Swipe-To-Reply)
// ==========================================

let activeReplyTarget = null;
let touchStartX = 0;
let touchStartY = 0;
let currentSwipedBubbleId = null;

// Media & Audio Voice Notes State
let pendingChatMedia = null; // { type: 'image'|'video'|'audio', dataUrl: string, fileName: string, fileSize: number }
let chatMediaRecorder = null;
let chatAudioChunks = [];
let chatVoiceRecordTimer = null;
let chatVoiceRecordSeconds = 0;
let chatAudioStream = null;

// Sound Synthesizer (Zero External Assets)
function playSentSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1350, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch (e) {}
}

function playReceiveSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [ { freq: 659.25, time: 0 }, { freq: 830.61, time: 0.1 } ].forEach(tone => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.freq, now + tone.time);
      gain.gain.setValueAtTime(0.08, now + tone.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + tone.time + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + tone.time);
      osc.stop(now + tone.time + 0.26);
    });
  } catch (e) {}
}

function playChatPingSound() {
  playReceiveSound();
}

// WhatsApp Checkmarks
function checkIsPartnerOnline() {
  const isMeVanshika = (currentChatSender || '').toLowerCase().includes('vanshika');
  const partnerRole = isMeVanshika ? 'rakesh' : 'vanshika';
  return latestPresenceState && latestPresenceState[partnerRole] && latestPresenceState[partnerRole].isOnline;
}

function getTickMarkup(status) {
  const isPartnerOnline = checkIsPartnerOnline();
  if (status === 'pending') {
    return `<span class="opacity-60 text-amber-200">🕒</span>`;
  } else if (status === 'read' || isPartnerOnline) {
    return `<span class="text-cyan-400 font-bold tracking-tighter" title="Read / Online">✓✓</span>`;
  } else if (status === 'delivered') {
    return `<span class="text-slate-300 font-bold tracking-tighter" title="Delivered">✓✓</span>`;
  }
  return `<span class="text-slate-400" title="Sent">✓</span>`;
}

// Swipe-to-Reply & Quoted-Reply Gestures
function handleBubbleTouchStart(e, msgId) {
  if (!e.touches || !e.touches[0]) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  currentSwipedBubbleId = msgId;
}

function handleBubbleTouchMove(e, msgId) {
  if (!touchStartX || currentSwipedBubbleId !== msgId) return;
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const deltaX = currentX - touchStartX;
  const deltaY = currentY - touchStartY;

  if (Math.abs(deltaY) > Math.abs(deltaX)) return;

  if (deltaX > 10 && deltaX < 90) {
    const innerBubble = document.getElementById('bubble-inner-' + msgId);
    const ind = document.getElementById('swipe-ind-' + msgId);
    if (innerBubble) innerBubble.style.transform = `translateX(${deltaX}px)`;
    if (ind) {
      ind.style.opacity = Math.min(1, deltaX / 50);
      ind.style.transform = `translateX(${deltaX * 0.4}px) scale(${1 + deltaX / 200})`;
    }
  }
}

function handleBubbleTouchEnd(e, msgId) {
  if (currentSwipedBubbleId !== msgId) return;
  const innerBubble = document.getElementById('bubble-inner-' + msgId);
  const ind = document.getElementById('swipe-ind-' + msgId);

  if (innerBubble) {
    const currentTransform = innerBubble.style.transform || '';
    const match = currentTransform.match(/translateX\(([\d.]+)px\)/);
    const draggedDist = match ? parseFloat(match[1]) : 0;

    innerBubble.style.transition = 'transform 0.25s ease-out';
    innerBubble.style.transform = 'translateX(0px)';
    setTimeout(() => { if (innerBubble) innerBubble.style.transition = ''; }, 260);

    if (draggedDist >= 45) {
      if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(25);
      activateReplyMode(msgId);
    }
  }

  if (ind) {
    ind.style.opacity = 0;
    ind.style.transform = 'translateX(0px) scale(0.8)';
  }

  touchStartX = 0;
  touchStartY = 0;
  currentSwipedBubbleId = null;
}

function activateReplyMode(msgId) {
  const msgs = getLocalVaultMessages();
  const target = msgs.find(m => m.id === msgId);
  if (!target) return;

  activeReplyTarget = {
    id: target.id,
    sender: target.sender || 'Partner',
    message: target.message || ''
  };

  const bar = document.getElementById('reply-preview-bar');
  const nameEl = document.getElementById('reply-target-name');
  const textEl = document.getElementById('reply-target-text');
  const input = document.getElementById('live-chat-input');

  if (nameEl) nameEl.innerText = activeReplyTarget.sender;
  if (textEl) textEl.innerText = activeReplyTarget.message;
  if (bar) {
    bar.classList.remove('hidden');
    bar.classList.add('flex');
  }
  if (input) input.focus();
}

function cancelReplyMode() {
  activeReplyTarget = null;
  const bar = document.getElementById('reply-preview-bar');
  if (bar) {
    bar.classList.add('hidden');
    bar.classList.remove('flex');
  }
}

function scrollToQuotedMessage(targetMsgId) {
  if (!targetMsgId) return;
  const targetEl = document.getElementById('msg-elem-' + targetMsgId);
  if (!targetEl) return;

  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const innerBubble = document.getElementById('bubble-inner-' + targetMsgId);
  if (innerBubble) {
    innerBubble.classList.add('ring-2', 'ring-rose-400', 'ring-offset-2', 'ring-offset-black', 'scale-[1.03]');
    setTimeout(() => {
      innerBubble.classList.remove('ring-2', 'ring-rose-400', 'ring-offset-2', 'ring-offset-black', 'scale-[1.03]');
    }, 1800);
  }
}

// Local Storage Vault Engine with Deduplication
function deduplicateMessagesList(list) {
  if (!Array.isArray(list)) return [];
  const result = [];
  const seenIds = new Set();
  list.forEach(m => {
    if (!m || !m.id) return;
    if (seenIds.has(m.id)) return;
    const mTime = new Date(m.timestamp || 0).getTime();
    const isDupe = result.some(prev => {
      const prevTime = new Date(prev.timestamp || 0).getTime();
      return prev.sender === m.sender &&
             (prev.message || '') === (m.message || '') &&
             (prev.mediaUrl || '') === (m.mediaUrl || '') &&
             Math.abs(prevTime - mTime) < 4000;
    });
    if (!isDupe) {
      seenIds.add(m.id);
      result.push(m);
    }
  });
  return result;
}

// High-Capacity IndexedDB Backing Store (Eliminates localStorage 5MB Quota Drops for Media)
const IDB_NAME = 'MemoryVaultDB';
const IDB_STORE = 'messages';
function openVaultDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve(null);
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function saveToIndexedDB(msg) {
  if (!msg || !msg.id) return;
  try {
    const db = await openVaultDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(msg);
  } catch (e) {}
}

async function loadFromIndexedDB() {
  try {
    const db = await openVaultDB();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

async function deleteFromIndexedDB(id) {
  if (!id) return;
  try {
    const db = await openVaultDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(id);
  } catch (e) {}
}

// Client-side Auto Image Compression (Converts heavy 5-15MB camera photos to HD ~150KB JPEG)
function compressImageForChat(blobOrDataUrl, maxDimension = 1280, quality = 0.82) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(typeof blobOrDataUrl === 'string' ? blobOrDataUrl : null);
      };
      if (typeof blobOrDataUrl === 'string') {
        img.src = blobOrDataUrl;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blobOrDataUrl);
      }
    } catch (e) {
      resolve(typeof blobOrDataUrl === 'string' ? blobOrDataUrl : null);
    }
  });
}

function getLocalVaultMessages() {
  try {
    const raw = localStorage.getItem(VAULT_MSG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return deduplicateMessagesList(parsed);
    }
  } catch (e) {}
  return [];
}

function saveMessageToLocalVault(msg) {
  if (!msg || !msg.id) return;
  let msgs = getLocalVaultMessages();
  const msgTime = new Date(msg.timestamp || 0).getTime();
  const dupeIdx = msgs.findIndex(m => {
    if (m.id === msg.id) return true;
    const prevTime = new Date(m.timestamp || 0).getTime();
    return m.sender === msg.sender &&
           (m.message || '') === (msg.message || '') &&
           (m.mediaUrl || '') === (msg.mediaUrl || '') &&
           Math.abs(prevTime - msgTime) < 4000;
  });
  if (dupeIdx !== -1) {
    msgs[dupeIdx] = { ...msgs[dupeIdx], ...msg };
  } else {
    msgs.push(msg);
  }
  if (msgs.length > 500) msgs = msgs.slice(msgs.length - 500);
  try {
    localStorage.setItem(VAULT_MSG_STORAGE_KEY, JSON.stringify(msgs));
  } catch (e) {
    try {
      const trimmed = msgs.slice(Math.max(0, msgs.length - 80));
      localStorage.setItem(VAULT_MSG_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err2) {}
  }
  // Guarantee persistent storage via IndexedDB
  saveToIndexedDB(msg);
}

function mergeAndSaveVaultMessages(newList) {
  if (!Array.isArray(newList)) return getLocalVaultMessages();
  let local = getLocalVaultMessages();
  const map = new Map();
  local.forEach(m => { if (m && m.id) map.set(m.id, m); });
  newList.forEach(m => {
    if (m && m.id) {
      const existing = map.get(m.id);
      map.set(m.id, existing ? { ...existing, ...m } : m);
    }
  });
  let merged = deduplicateMessagesList(Array.from(map.values()));
  merged.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
  if (merged.length > 500) merged = merged.slice(merged.length - 500);
  try {
    localStorage.setItem(VAULT_MSG_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    try {
      const trimmed = merged.slice(Math.max(0, merged.length - 80));
      localStorage.setItem(VAULT_MSG_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err2) {}
  }
  newList.forEach(m => saveToIndexedDB(m));
  return merged;
}

// Feed Rendering
function buildMessageHtml(m, isMyMessage) {
  const timeStr = m.formattedTime || getISTTimeString(m.timestamp);
  const tickHtml = isMyMessage ? `<span id="msg-tick-${m.id}" data-my-msg-tick data-status="${m.status || 'sent'}">${getTickMarkup(m.status || 'sent')}</span>` : '';
  const partnerIcon = m.sender && m.sender.toLowerCase().includes('vanshika') ? '👸' : '👑';

  let quotedSnippetHtml = '';
  if (m.replyTo && m.replyTo.message) {
    quotedSnippetHtml = `
      <div onclick="scrollToQuotedMessage('${m.replyTo.id}')" class="mb-2 p-2 rounded-xl bg-black/40 border-l-4 ${isMyMessage ? 'border-amber-400' : 'border-rose-400'} cursor-pointer hover:bg-black/60 transition-all select-none group/quote">
        <div class="text-[10px] font-bold ${isMyMessage ? 'text-amber-300' : 'text-rose-300'} flex items-center justify-between">
          <span class="flex items-center gap-1"><span>↩️</span><span>${escapeChatHtml(m.replyTo.sender)}</span></span>
          <span class="text-[9px] opacity-70 group-hover/quote:opacity-100 font-normal">Jump</span>
        </div>
        <div class="text-[11px] text-slate-300 truncate max-w-full font-normal italic mt-0.5">${escapeChatHtml(m.replyTo.message)}</div>
      </div>
    `;
  }

  // Media (Photo, Video, Voice Note) Rendering with Download / Fullscreen capability
  let mediaHtml = '';
  if (m.mediaUrl) {
    const isImage = m.mediaType === 'image' || (!m.mediaType && (m.mediaUrl.startsWith('data:image') || m.mediaUrl.match(/\.(jpeg|jpg|png|gif|webp|heic|heif|bmp|svg|avif)(\?.*)?$/i)));
    const isVideo = m.mediaType === 'video' || (!m.mediaType && (m.mediaUrl.startsWith('data:video') || m.mediaUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i)));
    const isAudio = m.mediaType === 'audio' || (!m.mediaType && (m.mediaUrl.startsWith('data:audio') || m.mediaUrl.match(/\.(mp3|wav|ogg|webm|m4a)(\?.*)?$/i)));

    if (isImage) {
      mediaHtml = `
        <div class="mb-2 relative rounded-xl overflow-hidden border border-white/10 group/img bg-black/40">
          <img src="${m.mediaUrl}" alt="Photo" onclick="openChatMediaModal('${m.mediaUrl}', 'image', '${escapeChatHtml(m.fileName || 'photo.jpg')}')" class="w-full max-h-72 object-cover cursor-pointer hover:scale-[1.02] transition-transform">
          <a href="${m.mediaUrl}" download="${m.fileName || 'memory-vault-photo.jpg'}" onclick="event.stopPropagation()" class="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-rose-600 text-white text-[10px] font-semibold flex items-center gap-1 shadow backdrop-blur-sm transition-colors cursor-pointer" title="Save Photo">
            <span>💾 Save</span>
          </a>
        </div>
      `;
    } else if (isVideo) {
      mediaHtml = `
        <div class="mb-2 rounded-xl overflow-hidden border border-white/10 bg-black/80">
          <video src="${m.mediaUrl}" controls playsinline class="w-full max-h-72 rounded-t-xl bg-black"></video>
          <div class="p-1.5 flex items-center justify-between text-[10px] bg-slate-950/80">
            <span class="text-slate-400 truncate max-w-[160px]">${escapeChatHtml(m.fileName || 'Video')}</span>
            <a href="${m.mediaUrl}" download="${m.fileName || 'memory-vault-video.mp4'}" class="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-rose-600 text-white font-medium flex items-center gap-1 transition-colors cursor-pointer">
              <span>💾 Save</span>
            </a>
          </div>
        </div>
      `;
    } else if (isAudio) {
      mediaHtml = `
        <div class="mb-2 p-2.5 rounded-xl bg-black/50 border border-white/10 flex flex-col gap-1.5 min-w-[220px]">
          <div class="flex items-center justify-between text-xs font-semibold ${isMyMessage ? 'text-amber-300' : 'text-rose-300'}">
            <span class="flex items-center gap-1"><span>🎙️</span><span>Voice Note</span></span>
            <a href="${m.mediaUrl}" download="${m.fileName || 'voice-note.webm'}" class="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer" title="Save Voice Note">
              <span>💾 Save</span>
            </a>
          </div>
          <audio src="${m.mediaUrl}" controls class="w-full h-8"></audio>
        </div>
      `;
    }
  }

  const textHtml = m.message ? `<div class="whitespace-pre-wrap break-words pr-1">${escapeChatHtml(m.message)}</div>` : '';

  return `
    <div id="msg-elem-${m.id}" 
         data-msg-sender="${escapeChatHtml(m.sender)}" 
         data-msg-text="${escapeChatHtml(m.message || '')}" 
         data-msg-media="${m.mediaUrl ? 'has_media' : ''}"
         data-msg-time="${new Date(m.timestamp || 0).getTime()}"
         class="flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} my-1 animate-scale-up group relative transition-all duration-300">
      ${!isMyMessage ? `
        <div class="flex items-center gap-1.5 mb-0.5 px-2 text-[11px] font-bold text-rose-300">
          <span>${partnerIcon}</span>
          <span>${escapeChatHtml(m.sender)}</span>
        </div>
      ` : ''}
      <div class="bubble-swipe-container flex items-center ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} gap-1.5 max-w-full">
        <!-- Swipe Indicator Icon -->
        <span id="swipe-ind-${m.id}" class="swipe-reply-indicator text-base text-rose-400">↩️</span>

        <!-- The Bubble Inner Box -->
        <div id="bubble-inner-${m.id}" 
             ontouchstart="handleBubbleTouchStart(event, '${m.id}')" 
             ontouchmove="handleBubbleTouchMove(event, '${m.id}')" 
             ontouchend="handleBubbleTouchEnd(event, '${m.id}')"
             ondblclick="activateReplyMode('${m.id}')"
             class="max-w-[85%] md:max-w-[75%] px-3.5 py-2.5 text-xs md:text-sm font-medium leading-relaxed ${isMyMessage ? 'chat-bubble-mine text-amber-50' : 'chat-bubble-partner text-rose-50'} shadow-md relative transition-transform">
          ${quotedSnippetHtml}
          ${mediaHtml}
          ${textHtml}
          <div class="flex items-center justify-end gap-1.5 mt-1 text-[10px] font-mono select-none ${isMyMessage ? 'text-amber-200/80' : 'text-rose-200/80'}">
            <span>${timeStr}</span>
            ${tickHtml}
          </div>
        </div>

        <!-- Action Buttons (Reply + Delete) -->
        <div class="opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 shrink-0">
          <button type="button" onclick="activateReplyMode('${m.id}')" title="Reply to message" class="p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-500 text-slate-400 hover:text-white text-xs shadow-md active:scale-90 cursor-pointer">
            ↩️
          </button>
          <button type="button" onclick="openDeleteMessageModal('${m.id}')" title="Delete message" class="p-1.5 rounded-full bg-slate-900/80 hover:bg-red-500 text-slate-400 hover:text-white text-xs shadow-md active:scale-90 cursor-pointer">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `;
}

// WhatsApp-Style Message Deletion Controller
let targetMessageToDelete = null;

function openDeleteMessageModal(msgId) {
  targetMessageToDelete = msgId;
  const modal = document.getElementById('chat-delete-modal');
  if (!modal) return;

  const btnForEveryone = document.getElementById('chat-delete-for-everyone-btn');
  const msgNode = document.getElementById('msg-elem-' + msgId);
  const msgSender = msgNode ? (msgNode.getAttribute('data-msg-sender') || '') : '';
  const myClean = (currentChatSender || '').toLowerCase().trim();
  const isMyMsg = myClean && (msgSender.toLowerCase().includes(myClean) || myClean.includes(msgSender.toLowerCase()));
  const isAdmin = currentChatPin === 'Vanshika170926';

  // Only the original sender (or Admin) can Delete For Everyone
  if (btnForEveryone) {
    if (isMyMsg || isAdmin) {
      btnForEveryone.style.display = 'flex';
    } else {
      btnForEveryone.style.display = 'none';
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeChatDeleteModal() {
  const modal = document.getElementById('chat-delete-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  targetMessageToDelete = null;
}

async function executeDeleteMessage(deleteType) {
  const msgId = targetMessageToDelete;
  closeChatDeleteModal();
  if (!msgId) return;

  // Find local message data to preserve in audit payload
  let local = getLocalVaultMessages();
  const targetMsg = local.find(m => m.id === msgId);

  // 1. Remove/mark immediately from local feed
  handleMessageDeletedLocally(msgId, deleteType, currentChatSender);

  // 2. Sync to Server (REST + Socket)
  const delPayload = {
    messageId: msgId,
    deleteType: deleteType,
    deletedBy: currentChatSender,
    pin: currentChatPin,
    message: targetMsg ? targetMsg.message : '',
    mediaType: targetMsg ? targetMsg.mediaType : null,
    mediaUrl: targetMsg ? targetMsg.mediaUrl : null,
    fileName: targetMsg ? targetMsg.fileName : null
  };

  if (socket && socket.connected) {
    socket.emit('delete_message', delPayload);
  }

  try {
    await fetch('/api/messages/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delPayload)
    });
  } catch (e) {}

  // 3. If Firebase active and deleteType is for_everyone, remove from Firebase
  if (isFirebaseActive && fbDb && deleteType === 'for_everyone') {
    try {
      fbDb.ref('vault_messages/' + msgId).remove();
    } catch (e) {}
  }
}

function handleMessageDeletedLocally(msgId, deleteType, deletedBy) {
  const isDeletedByMe = (deletedBy || '').toLowerCase().includes((currentChatSender || '').toLowerCase());
  
  if (deleteType === 'for_everyone') {
    const bubble = document.getElementById('bubble-inner-' + msgId);
    if (bubble) {
      bubble.innerHTML = `
        <div class="italic text-xs opacity-75 flex items-center gap-1.5 py-1 text-slate-400 select-none">
          <span>🚫</span>
          <span>${isDeletedByMe ? 'You deleted this message' : 'This message was deleted'}</span>
        </div>
      `;
    }
    removeMessageFromLocalVault(msgId);
    deleteFromIndexedDB(msgId);
  } else {
    // for_me: completely remove from feed
    const el = document.getElementById('msg-elem-' + msgId);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.8)';
      setTimeout(() => el.remove(), 250);
    }
    removeMessageFromLocalVault(msgId);
    deleteFromIndexedDB(msgId);
  }
}

function removeMessageFromLocalVault(msgId) {
  let msgs = getLocalVaultMessages();
  msgs = msgs.filter(m => m.id !== msgId);
  try {
    localStorage.setItem(VAULT_MSG_STORAGE_KEY, JSON.stringify(msgs));
  } catch (e) {}
}

function renderChatFeed(messages, forceReset = false) {
  const feed = document.getElementById('chat-feed-box');
  if (!feed) return;

  if (forceReset) {
    feed.innerHTML = '';
    renderedMsgIds.clear();
    renderedDatesSet.clear();
  }

  if (!messages || messages.length === 0) {
    if (renderedMsgIds.size === 0) clearChatUI();
    return;
  }

  const myCleanName = (currentChatSender || '').toLowerCase().trim();
  let hasAppendedAnyNew = false;
  let hasNewIncomingFromPartner = false;

  messages.forEach(m => {
    if (!m || !m.id) return;

    // 1. Exact ID Check
    const existingNode = document.getElementById('msg-elem-' + m.id);
    if (existingNode || renderedMsgIds.has(m.id)) {
      renderedMsgIds.add(m.id);
      const tickEl = document.getElementById('msg-tick-' + m.id);
      if (tickEl && m.status) {
        tickEl.setAttribute('data-status', m.status);
        tickEl.innerHTML = getTickMarkup(m.status);
      }
      return;
    }

    // 2. Strict Content, Media & Time Deduplication
    const msgTimeMs = new Date(m.timestamp || 0).getTime();
    const existingDuplicate = Array.from(feed.querySelectorAll('[data-msg-text]')).find(el => {
      const elSender = el.getAttribute('data-msg-sender');
      const elText = el.getAttribute('data-msg-text');
      const elMedia = el.getAttribute('data-msg-media') || '';
      const elTime = Number(el.getAttribute('data-msg-time') || 0);
      const currentMediaHas = m.mediaUrl ? 'has_media' : '';
      return elSender === m.sender &&
             elText === (m.message || '') &&
             elMedia === currentMediaHas &&
             Math.abs(elTime - msgTimeMs) < 4000;
    });
    if (existingDuplicate) {
      renderedMsgIds.add(m.id);
      return;
    }

    const placeholder = feed.querySelector('.italic');
    if (placeholder) placeholder.remove();

    renderedMsgIds.add(m.id);
    hasAppendedAnyNew = true;

    const msgSenderClean = (m.sender || '').toLowerCase().trim();
    const isMyMessage = myCleanName && (msgSenderClean.includes(myCleanName) || myCleanName.includes(msgSenderClean));
    if (!isMyMessage) hasNewIncomingFromPartner = true;

    // Date divider chip
    const dayLabel = getMessageDayLabel(m.timestamp);
    if (!renderedDatesSet.has(dayLabel)) {
      renderedDatesSet.add(dayLabel);
      feed.insertAdjacentHTML('beforeend', `
        <div class="flex justify-center my-2.5">
          <span class="px-3 py-0.5 rounded-full bg-slate-900/90 border border-rose-500/25 text-[10px] font-semibold text-slate-400 shadow-sm">${dayLabel}</span>
        </div>
      `);
    }

    feed.insertAdjacentHTML('beforeend', buildMessageHtml(m, isMyMessage));
  });

  if (hasNewIncomingFromPartner && renderedMsgIds.size > messages.length) {
    playReceiveSound();
    const lastMsg = messages[messages.length - 1];
    if (lastMsg) triggerPushNotification(lastMsg);
  }

  if (hasAppendedAnyNew) {
    scrollChatToBottom(false);
  }
}

function appendSingleMessageToFeed(m) {
  if (!m || !m.id) return;
  if (document.getElementById('msg-elem-' + m.id)) return;
  saveMessageToLocalVault(m);
  renderChatFeed([m]);
}

function appendOptimisticMessage(newMsg) {
  const feed = document.getElementById('chat-feed-box');
  if (!feed) return;
  const placeholder = feed.querySelector('.italic');
  if (placeholder) placeholder.remove();

  renderedMsgIds.add(newMsg.id);

  const dayLabel = getMessageDayLabel(newMsg.timestamp);
  if (!renderedDatesSet.has(dayLabel)) {
    renderedDatesSet.add(dayLabel);
    feed.insertAdjacentHTML('beforeend', `
      <div class="flex justify-center my-2.5">
        <span class="px-3 py-0.5 rounded-full bg-slate-900/90 border border-rose-500/25 text-[10px] font-semibold text-slate-400 shadow-sm">${dayLabel}</span>
      </div>
    `);
  }

  feed.insertAdjacentHTML('beforeend', buildMessageHtml(newMsg, true));
  scrollChatToBottom(true);
}

function scrollChatToBottom(smooth = false) {
  const feed = document.getElementById('chat-feed-box');
  if (!feed) return;
  feed.scrollTo({
    top: feed.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

function clearChatUI() {
  const feed = document.getElementById('chat-feed-box');
  if (feed) {
    feed.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-slate-400 text-xs italic py-8">
        <span class="text-3xl mb-2">💬</span>
        <p>Your Private Memory Vault is completely clear.</p>
        <p class="text-[10px] text-slate-500 mt-1">Lets Start chatting My Princess Vanshika  ✨</p>
      </div>
    `;
  }
  renderedMsgIds.clear();
  renderedDatesSet.clear();
}

async function clearChatHistory() {
  if (!confirm('Are you sure you want to clear your local chat history?')) return;
  try {
    localStorage.removeItem(VAULT_MSG_STORAGE_KEY);
    clearChatUI();
    if (socket && socket.connected) {
      socket.emit('clear_chat', { sender: currentChatSender, pin: currentChatPin });
    }
    if (isFirebaseActive && fbDb) {
      // Clear recent 20 for cleanup
      fbDb.ref('vault_messages').limitToLast(20).remove().catch(() => {});
    }
  } catch (err) {}
}

// Message Sending Pipeline
async function sendLiveChatMessage(customText = null) {
  if (!currentChatSender || !currentChatPin) {
    openNameLoginModal();
    return;
  }

  const input = document.getElementById('live-chat-input');
  const text = customText !== null ? String(customText).trim() : (input ? input.value.trim() : '');
  
  // Allow sending if there is text OR attached media
  if (!text && !pendingChatMedia) return;

  const mediaSnapshot = pendingChatMedia ? { ...pendingChatMedia } : null;
  cancelChatMediaAttachment();

  const replySnapshot = activeReplyTarget ? { ...activeReplyTarget } : null;
  cancelReplyMode();

  if (customText === null && input) {
    input.value = '';
    input.style.height = 'auto';
    input.style.overflowY = 'hidden';
    input.focus();
  }

  const now = new Date();
  const localId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const newMsg = {
    id: localId,
    sender: currentChatSender,
    message: text,
    mediaType: mediaSnapshot ? mediaSnapshot.type : undefined,
    mediaUrl: mediaSnapshot ? mediaSnapshot.dataUrl : undefined,
    fileName: mediaSnapshot ? mediaSnapshot.fileName : undefined,
    timestamp: now.toISOString(),
    formattedTime: getISTTimeString(now),
    formattedDate: getISTDateString(now),
    status: 'pending',
    replyTo: replySnapshot
  };

  // 1. Instant 0ms render
  appendOptimisticMessage(newMsg);
  playSentSound();

  // 2. Save locally
  saveMessageToLocalVault(newMsg);

  // 3. Dispatch to Cloud
  dispatchMessageToCloud(newMsg);
}

async function dispatchMessageToCloud(msg) {
  const payload = {
    id: msg.id,
    sender: msg.sender,
    pin: currentChatPin,
    message: msg.message || '',
    mediaType: msg.mediaType || null,
    mediaUrl: msg.mediaUrl || null,
    fileName: msg.fileName || null,
    timestamp: msg.timestamp || new Date().toISOString(),
    formattedTime: msg.formattedTime || getISTTimeString(),
    formattedDate: msg.formattedDate || getISTDateString(),
    status: 'sent',
    replyTo: msg.replyTo || null
  };

  // Clean payload for Firebase RTDB (never pass undefined properties)
  const firebasePayload = {};
  for (const [key, val] of Object.entries(payload)) {
    if (val !== undefined) firebasePayload[key] = val;
  }

  // 1. Firebase RTDB (Global Cloud Sync)
  if (isFirebaseActive && fbDb) {
    try {
      await fbDb.ref('vault_messages/' + msg.id).set(firebasePayload);
      markMessageSent(msg.id);
    } catch (err) {
      console.warn('Firebase push warning:', err);
    }
  }

  // 2. Socket.io (Ultra-fast real-time WebSocket delivery)
  if (socket && socket.connected) {
    socket.emit('send_message', payload);
    markMessageSent(msg.id);
  }

  // 3. Server Disk Persistence (ALWAYS save to /api/messages so data/messages.json permanently survives refreshes)
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      markMessageSent(msg.id);
    }
  } catch (e) {
    if (!socket || !socket.connected) {
      offlinePendingQueue.push(msg);
    }
  }
}

function markMessageSent(msgId) {
  const tickEl = document.getElementById('msg-tick-' + msgId);
  if (tickEl) {
    tickEl.setAttribute('data-status', 'sent');
    tickEl.innerHTML = getTickMarkup('sent');
  }
  let local = getLocalVaultMessages();
  const m = local.find(item => item.id === msgId);
  if (m) {
    m.status = 'sent';
    saveMessageToLocalVault(m);
  }
}

// Auto-Growing WhatsApp Style Chat Textarea Engine
function handleChatInputAutoGrow(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  const maxHeight = 130; // ~5 lines
  const newHeight = Math.min(textarea.scrollHeight, maxHeight);
  textarea.style.height = newHeight + 'px';
  if (textarea.scrollHeight > maxHeight) {
    textarea.style.overflowY = 'auto';
  } else {
    textarea.style.overflowY = 'hidden';
  }
}

function handleChatInputKeyDown(e) {
  // Desktop: Enter sends message, Shift+Enter makes newline
  // Mobile: Enter makes newline, user clicks circular send button
  if (e.key === 'Enter' && !e.shiftKey) {
    if (window.innerWidth >= 768) {
      e.preventDefault();
      sendLiveChatMessage();
    }
  }
}

// Quick Emojis & Reactions
function insertQuickChatEmoji(emoji) {
  const input = document.getElementById('live-chat-input');
  if (!input) return;
  input.value = (input.value ? input.value + ' ' : '') + emoji;
  handleChatInputAutoGrow(input);
  input.focus();
}

function triggerQuickChatReaction(emoji) {
  if (!currentChatSender) {
    openNameLoginModal();
    return;
  }
  sendLiveChatMessage(emoji);
}

// Media Attachment Engine (Photos, Videos, Audio)
function triggerChatMediaPicker() {
  const fileInput = document.getElementById('chat-media-file-input');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
}

async function handleChatMediaSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (file.size > 45 * 1024 * 1024) {
    alert('Selected file is too large (Maximum 45MB allowed).');
    return;
  }

  const rawName = file.name || 'attachment';
  const fileExt = (rawName.split('.').pop() || '').toLowerCase();
  const fileMime = (file.type || '').toLowerCase();

  const isVideo = fileMime.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v', '3gp'].includes(fileExt);
  const isAudio = fileMime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(fileExt);
  const isHeic = fileMime.includes('heic') || fileMime.includes('heif') || ['heic', 'heif'].includes(fileExt);

  let mediaType = 'image';
  if (isVideo) mediaType = 'video';
  else if (isAudio) mediaType = 'audio';
  else mediaType = 'image';

  // Immediate preview status feedback
  const bar = document.getElementById('chat-media-preview-bar');
  const thumb = document.getElementById('chat-media-preview-thumb');
  const nameEl = document.getElementById('chat-media-preview-name');
  const sizeEl = document.getElementById('chat-media-preview-size');

  if (bar) {
    bar.classList.remove('hidden');
    bar.classList.add('flex');
  }
  if (nameEl) nameEl.innerText = rawName;
  if (sizeEl) sizeEl.innerText = isHeic ? 'Optimizing iPhone HEIC photo...' : 'Processing media...';
  if (thumb) thumb.innerHTML = '⏳';

  try {
    let finalBlob = file;
    let finalFileName = rawName;

    // Convert iPhone HEIC/HEIF to JPEG so all browsers can view it
    if (isHeic) {
      if (typeof heic2any === 'function') {
        try {
          const res = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.85
          });
          finalBlob = Array.isArray(res) ? res[0] : res;
          finalFileName = rawName.replace(/\.(heic|heif)$/i, '.jpg');
        } catch (convErr) {
          console.warn('HEIC conversion notice:', convErr);
        }
      }
    }

    // Auto-compress photos to prevent browser quota exhaustion & speed up sync
    if (mediaType === 'image') {
      try {
        const compressedDataUrl = await compressImageForChat(finalBlob, 1280, 0.82);
        if (compressedDataUrl) {
          pendingChatMedia = {
            type: 'image',
            dataUrl: compressedDataUrl,
            fileName: finalFileName,
            fileSize: Math.round(compressedDataUrl.length * 0.75)
          };
          showChatMediaPreviewBar();
          return;
        }
      } catch (compErr) {
        console.warn('Image auto-compression fallback:', compErr);
      }
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      pendingChatMedia = {
        type: mediaType,
        dataUrl: e.target.result,
        fileName: finalFileName,
        fileSize: finalBlob.size || file.size
      };
      showChatMediaPreviewBar();
    };
    reader.readAsDataURL(finalBlob);
  } catch (err) {
    console.warn('Media file read error, falling back:', err);
    const reader = new FileReader();
    reader.onload = function(e) {
      pendingChatMedia = {
        type: mediaType,
        dataUrl: e.target.result,
        fileName: rawName,
        fileSize: file.size
      };
      showChatMediaPreviewBar();
    };
    reader.readAsDataURL(file);
  }
}

function showChatMediaPreviewBar() {
  if (!pendingChatMedia) return;
  const bar = document.getElementById('chat-media-preview-bar');
  const thumb = document.getElementById('chat-media-preview-thumb');
  const nameEl = document.getElementById('chat-media-preview-name');
  const sizeEl = document.getElementById('chat-media-preview-size');

  if (nameEl) nameEl.innerText = pendingChatMedia.fileName || 'Attached Media';
  if (sizeEl) {
    const kb = Math.round(pendingChatMedia.fileSize / 1024);
    const sizeStr = kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB';
    sizeEl.innerText = `${pendingChatMedia.type.toUpperCase()} • ${sizeStr} • Ready to send`;
  }
  if (thumb) {
    if (pendingChatMedia.type === 'image') {
      thumb.innerHTML = `<img src="${pendingChatMedia.dataUrl}" class="w-full h-full object-cover">`;
    } else if (pendingChatMedia.type === 'video') {
      thumb.innerHTML = `<span class="text-rose-400">🎬</span>`;
    } else {
      thumb.innerHTML = `<span class="text-amber-400">🎵</span>`;
    }
  }
  if (bar) {
    bar.classList.remove('hidden');
    bar.classList.add('flex');
  }
  const input = document.getElementById('live-chat-input');
  if (input) input.focus();
}

function cancelChatMediaAttachment() {
  pendingChatMedia = null;
  const bar = document.getElementById('chat-media-preview-bar');
  if (bar) {
    bar.classList.add('hidden');
    bar.classList.remove('flex');
  }
  const fileInput = document.getElementById('chat-media-file-input');
  if (fileInput) fileInput.value = '';
}

// Voice Note Recording Engine (MediaRecorder API)
async function toggleChatVoiceRecording() {
  if (!currentChatSender || !currentChatPin) {
    openNameLoginModal();
    return;
  }

  if (chatMediaRecorder && chatMediaRecorder.state === 'recording') {
    stopAndSendChatVoiceRecording();
    return;
  }

  try {
    chatAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chatAudioChunks = [];
    chatVoiceRecordSeconds = 0;

    const options = { mimeType: 'audio/webm' };
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported('audio/webm')) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/mp4')) options.mimeType = 'audio/mp4';
      else if (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/ogg')) options.mimeType = 'audio/ogg';
      else delete options.mimeType;
    }

    chatMediaRecorder = new MediaRecorder(chatAudioStream, options);

    chatMediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chatAudioChunks.push(e.data);
      }
    };

    chatMediaRecorder.start();

    const indicator = document.getElementById('chat-voice-recording-indicator');
    const timerEl = document.getElementById('chat-voice-recording-timer');
    const micBtn = document.getElementById('chat-mic-btn');
    if (indicator) {
      indicator.classList.remove('hidden');
      indicator.classList.add('flex');
    }
    if (timerEl) timerEl.innerText = '00:00';
    if (micBtn) {
      micBtn.classList.add('bg-rose-600', 'text-white', 'animate-pulse');
    }

    chatVoiceRecordTimer = setInterval(() => {
      chatVoiceRecordSeconds++;
      const mins = String(Math.floor(chatVoiceRecordSeconds / 60)).padStart(2, '0');
      const secs = String(chatVoiceRecordSeconds % 60).padStart(2, '0');
      if (timerEl) timerEl.innerText = `${mins}:${secs}`;
    }, 1000);

  } catch (err) {
    console.error('Microphone access error:', err);
    alert('Microphone access is required to record voice notes. Please allow microphone permission in your browser.');
  }
}

function cancelChatVoiceRecording() {
  if (chatVoiceRecordTimer) clearInterval(chatVoiceRecordTimer);
  if (chatMediaRecorder && chatMediaRecorder.state !== 'inactive') {
    chatMediaRecorder.onstop = null;
    chatMediaRecorder.stop();
  }
  if (chatAudioStream) {
    chatAudioStream.getTracks().forEach(track => track.stop());
    chatAudioStream = null;
  }
  chatAudioChunks = [];
  chatMediaRecorder = null;

  const indicator = document.getElementById('chat-voice-recording-indicator');
  const micBtn = document.getElementById('chat-mic-btn');
  if (indicator) {
    indicator.classList.add('hidden');
    indicator.classList.remove('flex');
  }
  if (micBtn) {
    micBtn.classList.remove('bg-rose-600', 'text-white', 'animate-pulse');
  }
}

function stopAndSendChatVoiceRecording() {
  if (!chatMediaRecorder || chatMediaRecorder.state === 'inactive') return;

  chatMediaRecorder.onstop = () => {
    if (chatVoiceRecordTimer) clearInterval(chatVoiceRecordTimer);
    if (chatAudioStream) {
      chatAudioStream.getTracks().forEach(track => track.stop());
      chatAudioStream = null;
    }

    const mime = (chatMediaRecorder && chatMediaRecorder.mimeType) || 'audio/webm';
    const audioBlob = new Blob(chatAudioChunks, { type: mime });
    const reader = new FileReader();
    reader.onload = function(e) {
      const voiceDataUrl = e.target.result;
      const now = new Date();
      const localId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const replySnapshot = activeReplyTarget ? { ...activeReplyTarget } : null;
      cancelReplyMode();

      const ext = mime.includes('mp4') ? 'm4a' : 'webm';
      const voiceMsg = {
        id: localId,
        sender: currentChatSender,
        message: '',
        mediaType: 'audio',
        mediaUrl: voiceDataUrl,
        fileName: `VoiceNote_${Date.now()}.${ext}`,
        timestamp: now.toISOString(),
        formattedTime: getISTTimeString(now),
        formattedDate: getISTDateString(now),
        status: 'pending',
        replyTo: replySnapshot
      };

      appendOptimisticMessage(voiceMsg);
      playSentSound();
      saveMessageToLocalVault(voiceMsg);
      dispatchMessageToCloud(voiceMsg);
    };
    reader.readAsDataURL(audioBlob);

    const indicator = document.getElementById('chat-voice-recording-indicator');
    const micBtn = document.getElementById('chat-mic-btn');
    if (indicator) {
      indicator.classList.add('hidden');
      indicator.classList.remove('flex');
    }
    if (micBtn) {
      micBtn.classList.remove('bg-rose-600', 'text-white', 'animate-pulse');
    }
  };

  chatMediaRecorder.stop();
}

// Chat Media Fullscreen Modal Controls
function openChatMediaModal(url, type = 'image', fileName = 'media') {
  const modal = document.getElementById('chat-media-modal');
  const content = document.getElementById('chat-media-modal-content');
  const dlBtn = document.getElementById('chat-media-modal-download');
  if (!modal || !content) return;

  if (type === 'image') {
    content.innerHTML = `<img src="${url}" class="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl">`;
  } else if (type === 'video') {
    content.innerHTML = `<video src="${url}" controls autoplay class="max-w-full max-h-[75vh] rounded-xl shadow-2xl bg-black"></video>`;
  }
  if (dlBtn) {
    dlBtn.href = url;
    dlBtn.download = fileName;
  }
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeChatMediaModal() {
  const modal = document.getElementById('chat-media-modal');
  const content = document.getElementById('chat-media-modal-content');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  if (content) content.innerHTML = '';
}

// Presence & Typing
function updatePresenceUI(presence) {
  updateChatAppHeaderUI();
  if (!presence) return;
  latestPresenceState = presence;
  const dot = document.getElementById('presence-dot');
  const text = document.getElementById('presence-text');
  if (!dot || !text) return;

  const isMeV = (currentChatSender || '').toLowerCase().includes('vanshika');
  const partnerRole = isMeV ? 'rakesh' : 'vanshika';
  const partnerName = isMeV ? 'Rakesh' : 'Vanshika';
  const pData = presence[partnerRole];

  if (pData && pData.isOnline) {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
    text.innerText = partnerName + ' Online';
    text.className = 'text-[11px] font-semibold text-emerald-300';
  } else {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-500';
    const seen = (pData && pData.lastSeen) ? ' (Seen ' + pData.lastSeen + ')' : '';
    text.innerText = partnerName + ' Offline' + seen;
    text.className = 'text-[11px] font-semibold text-slate-400';
  }
}

function handleChatTyping() {
  if (!currentChatSender || !currentChatPin) return;

  if (isFirebaseActive && fbDb) {
    try {
      const isMeV = currentChatSender.toLowerCase().includes('vanshika');
      const myRole = isMeV ? 'vanshika' : 'rakesh';
      fbDb.ref('typing/' + myRole).set(true);
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        try { fbDb.ref('typing/' + myRole).set(false); } catch (e) {}
      }, 2200);
    } catch (e) {}
  }

  if (socket && socket.connected) {
    socket.emit('typing', { sender: currentChatSender, isTyping: true });
    socket.emit('typing_start', { sender: currentChatSender });
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      if (socket && socket.connected) {
        socket.emit('typing', { sender: currentChatSender, isTyping: false });
        socket.emit('typing_stop', { sender: currentChatSender });
      }
    }, 2000);
  }
}

// Notifications & Cloud Sync Status
function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        alert('🔔 Notifications activated! You will receive instant alerts for new love messages.');
      }
    });
  }
}

function triggerPushNotification(msg) {
  const isMyMessage = currentChatSender && msg.sender && msg.sender.toLowerCase().includes(currentChatSender.toLowerCase());
  if (!isMyMessage && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('Love Message from ' + msg.sender, {
      body: msg.message,
      icon: 'assests/eyes.jpeg'
    });
  }
}

function updateSyncPill(text) {
  const pill = document.getElementById('sync-mode-pill');
  if (pill) {
    pill.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ${text}`;
  }
}

// Engines Setup
function initFirebaseCloud() {
  let config = window.FIREBASE_CONFIG;
  if (!config || !config.databaseURL || typeof firebase === 'undefined') {
    isFirebaseActive = false;
    updateSyncPill('⚡ WhatsApp Mode');
    return;
  }

  try {
    if (!firebase.apps || !firebase.apps.length) {
      fbApp = firebase.initializeApp(config);
    } else {
      fbApp = firebase.app();
    }
    fbDb = firebase.database();
    isFirebaseActive = true;
    updateSyncPill('⚡ Firebase Cloud Active');

    // 1. Real-time message listener
    fbDb.ref('vault_messages').limitToLast(300).on('child_added', snapshot => {
      const m = snapshot.val();
      if (m && m.id) {
        saveMessageToLocalVault(m);
        renderChatFeed([m]);
      }
    });

    // Real-time message deletion listener
    fbDb.ref('vault_messages').on('child_removed', snapshot => {
      const m = snapshot.val();
      const id = snapshot.key || (m && m.id);
      if (id) {
        handleMessageDeletedLocally(id, 'for_everyone', 'Partner');
      }
    });

    // 2. Real-time Presence & Typing
    if (currentChatSender) {
      const isMeV = currentChatSender.toLowerCase().includes('vanshika');
      const myRole = isMeV ? 'vanshika' : 'rakesh';
      const partnerRole = isMeV ? 'rakesh' : 'vanshika';
      const myPresenceRef = fbDb.ref('presence/' + myRole);

      fbDb.ref('.info/connected').on('value', snap => {
        if (snap.val() === true) {
          myPresenceRef.onDisconnect().set({ isOnline: false, lastSeen: getISTTimeString() });
          myPresenceRef.set({ isOnline: true, lastSeen: getISTTimeString() });
        }
      });

      fbDb.ref('presence/' + partnerRole).on('value', snap => {
        const pData = snap.val();
        if (pData) {
          latestPresenceState[partnerRole] = pData;
          updatePresenceUI(latestPresenceState);
        }
      });

      fbDb.ref('typing/' + partnerRole).on('value', snap => {
        const isTyping = snap.val() === true;
        const bar = document.getElementById('typing-indicator-bar');
        if (bar) {
          if (isTyping) {
            bar.innerText = '💬 ' + (isMeV ? 'Rakesh' : 'Vanshika') + ' is typing...';
            bar.classList.remove('hidden');
          } else {
            bar.classList.add('hidden');
          }
        }
      });
    }

    // 3. Initialize Shared Jukebox Cloud Sync
    if (typeof initJukeboxFirebaseSync === 'function') {
      initJukeboxFirebaseSync();
    }
  } catch (err) {
    console.warn('Firebase init warning:', err);
    isFirebaseActive = false;
    updateSyncPill('⚡ WhatsApp Mode');
  }
}

function initSocketConnection() {
  if (typeof io === 'undefined' || window.socketIoFailed) return;
  try {
    socket = io();
    socket.on('connect', () => {
      if (currentChatSender && currentChatPin) {
        socket.emit('user_join', { sender: currentChatSender, pin: currentChatPin });
      }
    });

    socket.on('auth_success', (data) => {
      if (data.onlineUsers) updatePresenceUI(data.onlineUsers);
      if (data.messages && Array.isArray(data.messages)) {
        const merged = mergeAndSaveVaultMessages(data.messages);
        renderChatFeed(merged);
      }
    });

    socket.on('presence_update', (onlineUsers) => {
      updatePresenceUI(onlineUsers);
    });

    // Real-time message delivery over WebSocket (<5ms)
    socket.on('new_message', (msg) => {
      appendSingleMessageToFeed(msg);
    });

    socket.on('message_deleted', (data) => {
      if (data && data.messageId) {
        handleMessageDeletedLocally(data.messageId, data.deleteType, data.deletedBy);
      }
    });

    socket.on('chat_cleared', () => {
      clearChatUI();
    });

    socket.on('force_logout', (data) => {
      sessionStorage.clear();
      localStorage.removeItem('chat_user_pin');
      currentChatSender = null;
      currentChatPin = null;
      if (typeof openNameLoginModal === 'function') openNameLoginModal();
      const errEl = document.getElementById('login-error-msg');
      if (errEl) {
        errEl.innerText = (data && data.reason) || '🔒 This device was remotely logged out by Admin.';
        errEl.classList.remove('hidden');
      }
    });

    socket.on('user_typing', (data) => {
      const bar = document.getElementById('typing-indicator-bar');
      if (bar) {
        if (data.isTyping && data.sender !== currentChatSender) {
          bar.innerText = '💬 ' + data.sender + ' is typing...';
          bar.classList.remove('hidden');
        } else {
          bar.classList.add('hidden');
        }
      }
    });
  } catch (e) {}
}

async function fetchLiveChatMessages() {
  try {
    const url = currentChatSender ? '/api/messages?sender=' + encodeURIComponent(currentChatSender) : '/api/messages';
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      const merged = mergeAndSaveVaultMessages(data.data);
      renderChatFeed(merged);
      if (data.presence) {
        updatePresenceUI(data.presence);
      }
    }
  } catch (err) {}
}

let chatPollInterval = null;
function startSmartPolling() {
  if (chatPollInterval) clearInterval(chatPollInterval);
  // Continuous 2.5s safety net so chat ALWAYS updates in real-time even under WiFi reconnection
  chatPollInterval = setInterval(() => {
    if (!document.hidden && currentChatSender) {
      fetchLiveChatMessages();
    }
  }, 2500);
}


// ==========================================
// INSTAGRAM / WHATSAPP DEDICATED FULLSCREEN CHAT CONTROLLER
// ==========================================

function openLiveChatRoom() {
  // If user is not logged in, prompt login first
  if (!currentChatSender || !currentChatPin) {
    if (typeof openNameLoginModal === 'function') {
      openNameLoginModal();
    }
    return;
  }

  const chatRoom = document.getElementById('live-chat-room');
  if (!chatRoom) return;

  chatRoom.classList.add('chat-fullscreen-mode');
  document.body.classList.add('chat-fullscreen-active');
  updateChatAppHeaderUI();

  // Push browser history state so Android/iOS back gesture exits fullscreen chat
  try {
    if (window.location.hash !== '#live-chat') {
      history.pushState({ chatFullscreen: true }, '', '#live-chat');
    }
  } catch (e) {}

  setTimeout(() => {
    scrollChatToBottom(false);
    const chatInput = document.getElementById('live-chat-input');
    if (chatInput && window.innerWidth > 768) {
      chatInput.focus();
    }
  }, 120);
}

function closeLiveChatRoom() {
  const chatRoom = document.getElementById('live-chat-room');
  if (!chatRoom) return;

  chatRoom.classList.remove('chat-fullscreen-mode');
  document.body.classList.remove('chat-fullscreen-active');

  try {
    if (window.location.hash === '#live-chat') {
      history.back();
    }
  } catch (e) {}

  // Smooth scroll back to embedded chat area on page
  chatRoom.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateChatAppHeaderUI() {
  const isMeV = (currentChatSender || '').toLowerCase().includes('vanshika');
  const partnerName = isMeV ? 'Rakesh 🤵' : 'Vanshika 👸';
  const partnerAvatar = isMeV ? '🤵' : '👸';
  const myName = isMeV ? 'Vanshika 👸' : 'Rakesh 🤵';

  const avatarEl = document.getElementById('chat-partner-avatar');
  const nameEl = document.getElementById('chat-partner-name');
  const myNameEl = document.getElementById('chat-current-user-name');
  const dotEl = document.getElementById('chat-partner-status-dot');
  const statusEl = document.getElementById('chat-partner-status-text');

  if (avatarEl) avatarEl.textContent = partnerAvatar;
  if (nameEl) nameEl.textContent = partnerName;
  if (myNameEl) myNameEl.textContent = myName;

  const partnerRole = isMeV ? 'rakesh' : 'vanshika';
  const pData = (typeof latestPresenceState !== 'undefined' && latestPresenceState) ? latestPresenceState[partnerRole] : null;

  if (dotEl && statusEl) {
    if (pData && pData.isOnline) {
      dotEl.className = 'absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse';
      statusEl.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span> Active now';
      statusEl.className = 'text-[11px] text-emerald-400 font-medium truncate flex items-center gap-1.5';
    } else {
      dotEl.className = 'absolute bottom-0 right-0 w-3 h-3 rounded-full bg-slate-500 border-2 border-slate-950';
      const seen = (pData && pData.lastSeen) ? 'Active ' + pData.lastSeen : 'Offline';
      statusEl.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block"></span> ' + seen;
      statusEl.className = 'text-[11px] text-slate-400 font-medium truncate flex items-center gap-1.5';
    }
  }
}

// Mobile Hardware / Browser Back Button gesture support
window.addEventListener('popstate', (e) => {
  const chatRoom = document.getElementById('live-chat-room');
  if (chatRoom && chatRoom.classList.contains('chat-fullscreen-mode')) {
    chatRoom.classList.remove('chat-fullscreen-mode');
    document.body.classList.remove('chat-fullscreen-active');
  }
});

// Auto-scroll on virtual keyboard focus on mobile devices
document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('live-chat-input');
  if (inputEl) {
    inputEl.addEventListener('focus', () => {
      setTimeout(() => {
        scrollChatToBottom(true);
      }, 300);
    });
  }
});
