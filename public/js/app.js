// ==========================================
// APPLICATION ENTRY POINT & BOOTSTRAPPER
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Instant 0ms Local Cache Hydration (localStorage + IndexedDB)
  const coldStartMessages = getLocalVaultMessages();
  if (coldStartMessages.length > 0) {
    renderChatFeed(coldStartMessages);
  }
  if (typeof loadFromIndexedDB === 'function') {
    loadFromIndexedDB().then(idbMsgs => {
      if (idbMsgs && idbMsgs.length > 0) {
        const merged = mergeAndSaveVaultMessages(idbMsgs);
        renderChatFeed(merged);
      }
    });
  }

  // 2. Load Gallery & Anniversary Timers
  loadSavedGalleryData();
  updateAnniversaryTimer();

  // 3. Start Visual Particles Engine
  initCanvasHearts();

  // 4. Initialize Cloud & Realtime Engines
  updateUserBadge();
  initFirebaseCloud();
  initSocketConnection();
  startSmartPolling();
  fetchLiveChatMessages();

  // 5. Strict User Security Login Gate:
  // Check if active authenticated session exists (supports both sessionStorage & persistent auth)
  // SECURITY: Only use sessionStorage for PIN check on page load.
  // localStorage only stores username (not PIN) for identity display.
  // PIN must come from sessionStorage (set only after actual login).
  const sessionSender = sessionStorage.getItem('chat_user_name');
  const sessionPin = sessionStorage.getItem('chat_user_pin');

  if (sessionSender && sessionPin) {
    // User has an active session in this tab - restore it
    currentChatSender = sessionSender;
    currentChatPin = sessionPin;
    updateUserBadge();

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
    // maybeAutoLaunchNov17 NOT called here - only called after fresh login click
    // This prevents the anniversary animation from showing without proper login
  } else {
    // No active session - clear any stale data and show login
    currentChatSender = null;
    currentChatPin = null;
    openNameLoginModal();
  }








  // 6. Chat Input Keypress Listeners
  const chatInput = document.getElementById('live-chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendLiveChatMessage();
      }
    });

    chatInput.addEventListener('input', () => {
      handleChatTyping();
    });
  }

  // 7. Network & Visibility Handlers
  window.addEventListener('online', () => {
    updateSyncPill('⚡ Reconnected Online');
    // Flush pending offline messages
    if (offlinePendingQueue && offlinePendingQueue.length > 0) {
      const queue = [...offlinePendingQueue];
      offlinePendingQueue = [];
      queue.forEach(m => dispatchMessageToCloud(m));
    }
    fetchLiveChatMessages();
  });

  window.addEventListener('offline', () => {
    updateSyncPill('⚠️ Offline Mode');
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      fetchLiveChatMessages();
      fetchWishesFromBackend();
    }
  });
});
