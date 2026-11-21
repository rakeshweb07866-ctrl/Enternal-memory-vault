// ==========================================
// APPLICATION ENTRY POINT & BOOTSTRAPPER (Optimized)
// ==========================================

// Global initialization of vault dashboard - ONLY called upon successful passcode login
window.initializeVaultDashboard = function() {
  if (window._vaultDashboardLoaded) return;
  window._vaultDashboardLoaded = true;

  // 1. Instant 0ms Local Cache Hydration (localStorage + IndexedDB)
  if (typeof getLocalVaultMessages === 'function') {
    const coldStartMessages = getLocalVaultMessages();
    if (coldStartMessages.length > 0 && typeof renderChatFeed === 'function') {
      renderChatFeed(coldStartMessages);
    }
  }
  if (typeof loadFromIndexedDB === 'function') {
    loadFromIndexedDB().then(idbMsgs => {
      if (idbMsgs && idbMsgs.length > 0 && typeof mergeAndSaveVaultMessages === 'function') {
        const merged = mergeAndSaveVaultMessages(idbMsgs);
        if (typeof renderChatFeed === 'function') {
          renderChatFeed(merged);
        }
      }
    });
  }

  // 2. Load Gallery & Anniversary Timers
  if (typeof loadSavedGalleryData === 'function') loadSavedGalleryData();
  if (typeof updateAnniversaryTimer === 'function') updateAnniversaryTimer();

  // 3. Start Visual Particles Engine
  if (typeof initCanvasHearts === 'function') initCanvasHearts();

  // 4. Initialize Cloud & Realtime Engines
  if (typeof updateUserBadge === 'function') updateUserBadge();
  if (typeof initFirebaseCloud === 'function') initFirebaseCloud();
  if (typeof initSocketConnection === 'function') initSocketConnection();
  if (typeof startSmartPolling === 'function') startSmartPolling();
  if (typeof fetchLiveChatMessages === 'function') fetchLiveChatMessages();
};

document.addEventListener('DOMContentLoaded', () => {
  // 5. Strict User Security Login Gate:
  // ZERO background overhead before login - login modal and input are 100% instant & responsive!
  currentChatSender = null;
  currentChatPin = null;
  if (typeof openNameLoginModal === 'function') {
    openNameLoginModal();
  }

  // 6. Chat Input Keypress Listeners
  const chatInput = document.getElementById('live-chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (typeof sendLiveChatMessage === 'function') sendLiveChatMessage();
      }
    });

    chatInput.addEventListener('input', () => {
      if (typeof handleChatTyping === 'function') handleChatTyping();
    });
  }

  // 7. Network & Visibility Handlers
  window.addEventListener('online', () => {
    if (typeof updateSyncPill === 'function') updateSyncPill('⚡ Reconnected Online');
    if (typeof offlinePendingQueue !== 'undefined' && offlinePendingQueue && offlinePendingQueue.length > 0) {
      const queue = [...offlinePendingQueue];
      offlinePendingQueue = [];
      queue.forEach(m => {
        if (typeof dispatchMessageToCloud === 'function') dispatchMessageToCloud(m);
      });
    }
    if (currentChatPin && typeof fetchLiveChatMessages === 'function') {
      fetchLiveChatMessages();
    }
  });

  window.addEventListener('offline', () => {
    if (typeof updateSyncPill === 'function') updateSyncPill('⚠️ Offline Mode');
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentChatPin) {
      if (typeof fetchLiveChatMessages === 'function') fetchLiveChatMessages();
      if (typeof fetchWishesFromBackend === 'function') fetchWishesFromBackend();
    }
  });
});
