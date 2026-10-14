// ==========================================
// APPLICATION ENTRY POINT & BOOTSTRAPPER
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Instant 0ms Local Cache Hydration
  const coldStartMessages = getLocalVaultMessages();
  if (coldStartMessages.length > 0) {
    renderChatFeed(coldStartMessages);
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

  // 5. User Login / Session Gate
  if (!sessionStorage.getItem('chat_user_name') || !sessionStorage.getItem('chat_user_pin')) {
    setTimeout(openNameLoginModal, 800);
  } else {
    updateUserBadge();
    if (typeof isAnniversaryActive === 'function' && isAnniversaryActive()) {
      if (!sessionStorage.getItem('anniv_cinematic_played')) {
        sessionStorage.setItem('anniv_cinematic_played', 'true');
        setTimeout(playGrandCinematicAnniversaryAnimation, 800);
      }
    }
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
