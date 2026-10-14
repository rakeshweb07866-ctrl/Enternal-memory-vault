// ==========================================
// REALTIME LIVE CHAT ENGINE
// (Firebase RTDB + Socket.io Fallback + Swipe-To-Reply)
// ==========================================

let activeReplyTarget = null;
let touchStartX = 0;
let touchStartY = 0;
let currentSwipedBubbleId = null;

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
      return prev.sender === m.sender && prev.message === m.message && Math.abs(prevTime - mTime) < 4000;
    });
    if (!isDupe) {
      seenIds.add(m.id);
      result.push(m);
    }
  });
  return result;
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
    return m.sender === msg.sender && m.message === msg.message && Math.abs(prevTime - msgTime) < 4000;
  });
  if (dupeIdx !== -1) {
    msgs[dupeIdx] = { ...msgs[dupeIdx], ...msg };
  } else {
    msgs.push(msg);
  }
  if (msgs.length > 500) msgs = msgs.slice(msgs.length - 500);
  try {
    localStorage.setItem(VAULT_MSG_STORAGE_KEY, JSON.stringify(msgs));
  } catch (e) {}
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
  } catch (e) {}
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

  return `
    <div id="msg-elem-${m.id}" 
         data-msg-sender="${escapeChatHtml(m.sender)}" 
         data-msg-text="${escapeChatHtml(m.message)}" 
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
          <div class="whitespace-pre-wrap break-words pr-1">${escapeChatHtml(m.message)}</div>
          <div class="flex items-center justify-end gap-1.5 mt-1 text-[10px] font-mono select-none ${isMyMessage ? 'text-amber-200/80' : 'text-rose-200/80'}">
            <span>${timeStr}</span>
            ${tickHtml}
          </div>
        </div>

        <!-- Desktop Hover Quick Reply Button -->
        <button type="button" onclick="activateReplyMode('${m.id}')" title="Reply to message (or swipe/double-tap)" class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-500 text-slate-400 hover:text-white text-xs shadow-md active:scale-90 cursor-pointer">
          ↩️
        </button>
      </div>
    </div>
  `;
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

    // 2. Strict Content & Time Deduplication
    const msgTimeMs = new Date(m.timestamp || 0).getTime();
    const existingDuplicate = Array.from(feed.querySelectorAll('[data-msg-text]')).find(el => {
      const elSender = el.getAttribute('data-msg-sender');
      const elText = el.getAttribute('data-msg-text');
      const elTime = Number(el.getAttribute('data-msg-time') || 0);
      return elSender === m.sender && elText === m.message && Math.abs(elTime - msgTimeMs) < 4000;
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
        <p class="text-[10px] text-slate-500 mt-1">Start chatting with Princess Vanshika below ✨</p>
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
  if (!text) return;

  const replySnapshot = activeReplyTarget ? { ...activeReplyTarget } : null;
  cancelReplyMode();

  if (customText === null && input) {
    input.value = '';
    input.focus();
  }

  const now = new Date();
  const localId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const newMsg = {
    id: localId,
    sender: currentChatSender,
    message: text,
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
  // 1. Primary: Firebase RTDB (Single transport)
  if (isFirebaseActive && fbDb) {
    try {
      await fbDb.ref('vault_messages/' + msg.id).set(msg);
      markMessageSent(msg.id);
      return;
    } catch (err) {
      console.warn('Firebase push failed, trying fallback:', err);
    }
  }

  // 2. Secondary: Socket.io if active
  if (socket && socket.connected) {
    socket.emit('send_message', {
      id: msg.id,
      sender: msg.sender,
      pin: currentChatPin,
      message: msg.message,
      timestamp: msg.timestamp,
      formattedTime: msg.formattedTime,
      formattedDate: msg.formattedDate,
      status: 'sent',
      replyTo: msg.replyTo
    });
    markMessageSent(msg.id);
    return;
  }

  // 3. Tertiary: HTTP POST fallback
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: msg.id,
        sender: msg.sender,
        pin: currentChatPin,
        message: msg.message,
        timestamp: msg.timestamp,
        formattedTime: msg.formattedTime,
        formattedDate: msg.formattedDate,
        status: 'sent',
        replyTo: msg.replyTo
      })
    });
    const data = await res.json();
    if (data.success) {
      markMessageSent(msg.id);
    }
  } catch (e) {
    offlinePendingQueue.push(msg);
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

function triggerQuickChatReaction(emoji) {
  if (!currentChatSender) {
    openNameLoginModal();
    return;
  }
  sendLiveChatMessage(emoji);
}

// Presence & Typing
function updatePresenceUI(presence) {
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
    const isMeV = currentChatSender.toLowerCase().includes('vanshika');
    const myRole = isMeV ? 'vanshika' : 'rakesh';
    fbDb.ref('typing/' + myRole).set(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      fbDb.ref('typing/' + myRole).set(false);
    }, 2200);
    return;
  }

  if (socket && socket.connected) {
    socket.emit('typing', { sender: currentChatSender, isTyping: true });
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      if (socket && socket.connected) {
        socket.emit('typing', { sender: currentChatSender, isTyping: false });
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
      if (data.messages && !isFirebaseActive) {
        const merged = mergeAndSaveVaultMessages(data.messages);
        renderChatFeed(merged);
      }
    });

    socket.on('presence_update', (onlineUsers) => {
      updatePresenceUI(onlineUsers);
    });

    socket.on('new_message', (msg) => {
      if (isFirebaseActive && fbDb) return;
      appendSingleMessageToFeed(msg);
    });

    socket.on('chat_cleared', () => {
      clearChatUI();
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
  if (isFirebaseActive && fbDb) return;
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
  chatPollInterval = setInterval(() => {
    if (!document.hidden && (!isFirebaseActive || !fbDb) && (!socket || !socket.connected)) {
      fetchLiveChatMessages();
    }
  }, 1200);
}
