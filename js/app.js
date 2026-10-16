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

  // 5. User Login / Session Gate & Anniversary Launch
  const localName = localStorage.getItem('chat_user_name');
  const localPin = localStorage.getItem('chat_user_pin');
  if (localName && localPin && (!sessionStorage.getItem('chat_user_name') || !sessionStorage.getItem('chat_user_pin'))) {
    sessionStorage.setItem('chat_user_name', localName);
    sessionStorage.setItem('chat_user_pin', localPin);
    currentChatSender = localName;
    currentChatPin = localPin;
  }

  const isUserLoggedIn = sessionStorage.getItem('chat_user_name') && sessionStorage.getItem('chat_user_pin');
  if (isUserLoggedIn) {
    updateUserBadge();
  }

  if (typeof isAnniversaryActive === 'function' && isAnniversaryActive()) {
    // Show the grand romantic celebration whenever the website is opened on 17th Oct
    setTimeout(playGrandCinematicAnniversaryAnimation, 800);
  } else if (!isUserLoggedIn) {
    setTimeout(openNameLoginModal, 800);
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
