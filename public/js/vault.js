// ==========================================
// ROMANTIC MEMORY VAULT & ANNIVERSARY ENGINE
// (Letters, Gallery, Coupons, Wishes & Secret Revelations)
// ==========================================

// 1. Secret Love Reasons
const loveReasons = [
  "Because your voice immediately calms down all my stress.",
  "Because even after everything you went through, your heart is so pure and innocent.",
  "Because the way you say simple things in Telugu feels like music to my soul.",
  "Because I want to protect your smile for the rest of my life.",
  "Because you are not just my girlfriend, you are my future wife and best friend.",
  "Because when I think of my future, I only see your face next to mine.",
  "Because your happiness is now the single biggest mission of my life.",
  "Because you make me want to be the best, strongest man for you.",
  "Because your eyes are so deeply enchanting, I lose myself in them.",
  "Because I love you, pure and simple, today, tomorrow and forever."
];

function openLetterModal() {
  const modal = document.getElementById('letter-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function closeLetterModal() {
  const modal = document.getElementById('letter-modal');
  if (modal) modal.classList.add('hidden');
}

function revealRandomLoveReason() {
  const display = document.getElementById('love-reason-display');
  if (!display) return;
  const randomMsg = loveReasons[Math.floor(Math.random() * loveReasons.length)];
  display.style.opacity = 0;
  setTimeout(() => {
    display.innerHTML = `"${randomMsg}"`;
    display.style.opacity = 1;
  }, 200);
}

// 2. Interactive Photo Memory Cards
function triggerCardFilePicker(cardId) {
  const input = document.getElementById('input-' + cardId);
  if (input) input.click();
}

function handleSingleCardPhotoUpload(event, cardId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const img = document.getElementById('img-' + cardId);

    if (img) {
      img.src = dataUrl;
    }

    saveCardData(cardId, dataUrl);
  };
  reader.readAsDataURL(file);
}

function saveCardData(cardId, photoDataUrl = null) {
  let store = JSON.parse(localStorage.getItem('vanshika_gallery_data') || '{}');
  if (!store[cardId]) store[cardId] = {};
  
  const caption = document.getElementById('caption-' + cardId);
  if (caption) store[cardId].caption = caption.innerText;
  if (photoDataUrl) store[cardId].photo = photoDataUrl;

  try {
    localStorage.setItem('vanshika_gallery_data', JSON.stringify(store));
  } catch (err) {
    console.warn('Storage limit reached for large images');
  }
}

function loadSavedGalleryData() {
  let store = JSON.parse(localStorage.getItem('vanshika_gallery_data') || '{}');
  Object.keys(store).forEach(cardId => {
    const item = store[cardId];
    const img = document.getElementById('img-' + cardId);
    const caption = document.getElementById('caption-' + cardId);

    if (item.photo && img && item.photo.startsWith("data:image")) {
      img.src = item.photo;
    }
    if (item.caption && caption) {
      caption.innerText = item.caption;
    }
  });

  if (typeof fetchLiveChatMessages === 'function') fetchLiveChatMessages();
  fetchWishesFromBackend();
}

// 3. 1-Month Anniversary Celebration Engine
// Strictly locked for production: Automatically unlocks on 17th October 2026!
const IS_ANNIVERSARY_PREVIEW_TEST = false;

function isAnniversaryActive() {
  if (IS_ANNIVERSARY_PREVIEW_TEST) return true;
  const now = new Date();
  const annivDate = new Date('2026-10-17T00:00:00');
  return now >= annivDate;
}

function updateAnniversaryTimer() {
  const proposalDate = new Date('2026-09-17T00:00:00');
  const now = new Date();
  const diffMs = now - proposalDate;

  if (diffMs > 0) {
    const totalSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const daysEl = document.getElementById('anniv-days');
    const hoursEl = document.getElementById('anniv-hours');
    const minsEl = document.getElementById('anniv-mins');
    const secsEl = document.getElementById('anniv-secs');

    if (daysEl) daysEl.innerText = isAnniversaryActive() ? Math.max(days, 30) : days;
    if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
    if (minsEl) minsEl.innerText = String(mins).padStart(2, '0');
    if (secsEl) secsEl.innerText = String(secs).padStart(2, '0');

    if (isAnniversaryActive()) {
      const badge = document.querySelector('#anniversary-section .inline-flex span');
      if (badge) badge.innerHTML = '🎉 HAPPY 1ST MONTH ANNIVERSARY VANSHIKA! 🎉';
      
      const giftTag = document.getElementById('gift-lock-tag');
      if (giftTag) giftTag.innerHTML = '🎁 UNLOCKED TODAY: YOUR 1-MONTH SURPRISE GIFT!';

      const banner = document.getElementById('princess-royal-banner');
      if (banner) {
        banner.classList.remove('hidden');
        banner.classList.add('flex');
      }
    } else {
      const badge = document.querySelector('#anniversary-section .inline-flex span');
      if (badge) badge.innerHTML = '✨ 1st Month Anniversary Special ✨';
      
      const giftTag = document.getElementById('gift-lock-tag');
      if (giftTag) giftTag.innerHTML = '🔒 LOCKED UNTIL 17TH OCTOBER';

      const banner = document.getElementById('princess-royal-banner');
      if (banner) {
        banner.classList.add('hidden');
        banner.classList.remove('flex');
      }
    }
  }
}
setInterval(updateAnniversaryTimer, 1000);

function openAnniversarySurpriseModal() {
  if (!isAnniversaryActive()) {
    const anniversaryDate = new Date('2026-10-17T00:00:00');
    const now = new Date();
    const diffMs = anniversaryDate - now;
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    const msgEl = document.getElementById('locked-toast-message');
    if (msgEl) {
      msgEl.innerHTML = 'Shh! Dearest Vanshika, this 1st Month Anniversary surprise is <strong class="text-rose-400">LOCKED 🔒</strong> until <strong class="text-amber-300">17th October 2026</strong>!<br/><br/><span class="text-amber-300 font-bold">' + remainingDays + ' Days remaining</span> until your special gift unlocks! ❤️✨';
    }
    
    const lockedModal = document.getElementById('locked-toast-modal');
    if (lockedModal) {
      lockedModal.classList.remove('hidden');
      lockedModal.classList.add('flex');
    }
    return;
  }

  const modal = document.getElementById('anniv-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();
    if (typeof toggleRomanticMusic === 'function' && !isPlayingMusic) {
      toggleRomanticMusic();
    }
    renderCouponsState();
  }
}

function closeAnniversaryModal() {
  const modal = document.getElementById('anniv-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function closeLockedToast() {
  const lockedModal = document.getElementById('locked-toast-modal');
  if (lockedModal) {
    lockedModal.classList.add('hidden');
    lockedModal.classList.remove('flex');
  }
}

// 4. Sacred Heartbeat System (Oct 13 Feature)
function openSoulHeartbeatModal() {
  const modal = document.getElementById('soul-heartbeat-modal');
  const imgEl = document.getElementById('soul-heartbeat-img');

  if (imgEl) {
    try {
      const savedData = JSON.parse(localStorage.getItem('vanshika_gallery_data') || '{}');
      if (savedData['card-queen'] && savedData['card-queen'].photo) {
        imgEl.src = savedData['card-queen'].photo;
      } else if (savedData['card-eyes'] && savedData['card-eyes'].photo) {
        imgEl.src = savedData['card-eyes'].photo;
      }
    } catch (e) {}
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();
    if (typeof toggleRomanticMusic === 'function' && !isPlayingMusic) {
      toggleRomanticMusic();
    }
  }
}

function closeSoulHeartbeatModal() {
  const modal = document.getElementById('soul-heartbeat-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

let pulseToastTimeout = null;
async function sendHeartbeatPulseToRakesh() {
  if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();

  const toast = document.getElementById('heartbeat-pulse-toast');
  if (toast) {
    toast.classList.remove('hidden');
    toast.classList.add('flex');
    if (pulseToastTimeout) clearTimeout(pulseToastTimeout);
    pulseToastTimeout = setTimeout(closeHeartbeatPulseToast, 5000);
  }

  const sender = currentChatSender || 'Vanshika 👸';
  const text = '💓 Vanshika just connected with Rakesh\'s heartbeat! "My heart beats only for you, Rakesh ❤️"';
  
  if (typeof sendLiveChatMessage === 'function') {
    sendLiveChatMessage(text);
  }
}

function closeHeartbeatPulseToast() {
  const toast = document.getElementById('heartbeat-pulse-toast');
  if (toast) {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }
}

// 5. Royal Princess Login Welcome & Revelation
function openPrincessWelcomeModal(resetToQuestion = true) {
  if (!isAnniversaryActive()) {
    openAnniversarySurpriseModal();
    return;
  }
  const modal = document.getElementById('princess-welcome-modal');
  const stageQ = document.getElementById('princess-stage-question');
  const stageR = document.getElementById('princess-stage-reveal');

  if (resetToQuestion) {
    if (stageQ) stageQ.classList.remove('hidden');
    if (stageR) stageR.classList.add('hidden');
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();
  }
}

function revealMostBeautifulGirl() {
  const stageQ = document.getElementById('princess-stage-question');
  const stageR = document.getElementById('princess-stage-reveal');
  const imgEl = document.getElementById('princess-reveal-img');

  if (imgEl) {
    try {
      const savedData = JSON.parse(localStorage.getItem('vanshika_gallery_data') || '{}');
      if (savedData['card-queen'] && savedData['card-queen'].photo) {
        imgEl.src = savedData['card-queen'].photo;
      } else if (savedData['card-eyes'] && savedData['card-eyes'].photo) {
        imgEl.src = savedData['card-eyes'].photo;
      } else {
        imgEl.src = 'assests/queen.jpeg';
      }
    } catch (e) {
      imgEl.src = 'assests/queen.jpeg';
    }
  }

  if (stageQ) stageQ.classList.add('hidden');
  if (stageR) {
    stageR.classList.remove('hidden');
    stageR.classList.add('animate-scale-up');
  }

  if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();
  if (typeof toggleRomanticMusic === 'function' && !isPlayingMusic) {
    toggleRomanticMusic();
  }
}

function resetPrincessQuestion() {
  const stageQ = document.getElementById('princess-stage-question');
  const stageR = document.getElementById('princess-stage-reveal');
  if (stageQ) stageQ.classList.remove('hidden');
  if (stageR) stageR.classList.add('hidden');
}

function closePrincessWelcomeModal() {
  const modal = document.getElementById('princess-welcome-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openAnnivFromPrincessModal() {
  closePrincessWelcomeModal();
  setTimeout(openAnniversarySurpriseModal, 250);
}

function switchAnnivTab(tabName) {
  const tabs = ['letter', 'promises', 'coupons', 'stats'];
  tabs.forEach(t => {
    const pane = document.getElementById('anniv-pane-' + t);
    const btn = document.getElementById('anniv-tab-btn-' + t);
    if (pane) {
      if (t === tabName) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    }
    if (btn) {
      if (t === tabName) {
        btn.className = 'flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black text-xs shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap';
      } else {
        btn.className = 'flex-1 py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap';
      }
    }
  });
  if (tabName === 'coupons') renderCouponsState();
}

// 6. Redeemable Love Coupons
const LOVE_COUPONS = [
  { id: 'coupon-hugs', title: 'Lifetime Warm Hugs & Comfort Pass' },
  { id: 'coupon-midnight', title: 'Midnight Long Call & Sweet Talk Pass' },
  { id: 'coupon-forgive', title: 'Forgive Any Mistake Card' },
  { id: 'coupon-princess', title: 'Princess Treatment For 24 Hours' },
  { id: 'coupon-masterwish', title: '1 Master Wish Card' }
];

function getRedeemedCoupons() {
  try {
    return JSON.parse(localStorage.getItem('vanshika_redeemed_coupons') || '{}');
  } catch (e) {
    return {};
  }
}

function redeemCoupon(couponId) {
  const store = getRedeemedCoupons();
  const now = new Date();
  const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  store[couponId] = {
    redeemed: true,
    time: timeStr
  };
  localStorage.setItem('vanshika_redeemed_coupons', JSON.stringify(store));

  if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();

  const coupon = LOVE_COUPONS.find(c => c.id === couponId);
  const title = coupon ? coupon.title : 'Coupon';

  alert('🎉💖 COUPON REDEEMED SUCCESSFULLY!\n\n"' + title + '" has been claimed!\nRakesh has been notified of your royal request, My Lady Princess Vanshika! ❤️');

  renderCouponsState();
}

function renderCouponsState() {
  const store = getRedeemedCoupons();
  LOVE_COUPONS.forEach(c => {
    const btn = document.getElementById('btn-redeem-' + c.id);
    const status = document.getElementById('status-redeem-' + c.id);
    if (!btn || !status) return;

    if (store[c.id]) {
      btn.classList.add('hidden');
      status.classList.remove('hidden');
      status.innerHTML = `
        <div class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold shadow">
          <span>✅ REDEEMED</span>
          <span class="text-[10px] text-slate-300">(${store[c.id].time})</span>
        </div>
      `;
    } else {
      btn.classList.remove('hidden');
      status.classList.add('hidden');
    }
  });
}

// 7. Realtime Sky Lantern Wishes
let animatedWishSet = new Set();
let isInitialWishLoad = true;

async function launchSkyLantern() {
  const input = document.getElementById('user-wish-input');
  const wishText = input ? input.value.trim() : '';
  if (!wishText) return;

  if (socket && socket.connected) {
    socket.emit('launch_wish', {
      sender: currentChatSender || 'Vanshika 👸',
      wishText: wishText
    });
    if (input) input.value = '';
  } else {
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: currentChatSender || 'Vanshika 👸', wishText: wishText })
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.id && !animatedWishSet.has(data.data.id)) {
          animatedWishSet.add(data.data.id);
          animateSkyLanternFloat(data.data.text, data.data.sender, data.data.id);
        }
      }
      if (input) input.value = '';
    } catch (e) {}
  }
}

function animateSkyLanternFloat(wishText, senderName, wishId) {
  if (wishId) animatedWishSet.add(wishId);

  const lantern = document.createElement('div');
  lantern.className = 'sky-lantern-float';
  const cleanSender = senderName || 'Vanshika 👸';

  lantern.innerHTML = `
    <div class="lantern-glow-body">
      <div class="lantern-flame"></div>
    </div>
    <div class="lantern-tag flex flex-wrap items-center justify-center gap-1.5">
      <span class="text-amber-300 font-black text-xs md:text-sm">🏮 ${cleanSender}:</span>
      <span class="text-white font-bold text-xs md:text-sm">"${wishText}"</span>
      <span class="text-amber-400">✨</span>
    </div>
  `;

  document.body.appendChild(lantern);
  setTimeout(() => { lantern.remove(); }, 16000);
}

async function fetchWishesFromBackend() {
  try {
    const res = await fetch('/api/wishes');
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      if (isInitialWishLoad) {
        data.data.forEach(w => { if (w.id) animatedWishSet.add(w.id); });
        isInitialWishLoad = false;
      } else {
        data.data.forEach(w => {
          if (w.id && !animatedWishSet.has(w.id)) {
            animatedWishSet.add(w.id);
            animateSkyLanternFloat(w.text, w.sender, w.id);
          }
        });
      }

      renderSavedWishes(data.data.map(w => ({ text: w.text, date: (w.formattedTime || '') })));
      return;
    }
  } catch (e) {}
}

function renderSavedWishes(wishes) {
  const container = document.getElementById('wishes-wall-container');
  const countEl = document.getElementById('wish-count');

  if (countEl) countEl.innerText = wishes ? wishes.length : 0;
  if (!container) return;

  if (!wishes || wishes.length === 0) {
    container.innerHTML = `<div class="text-xs text-slate-500 italic text-center col-span-2 py-4">No wishes launched yet. Type your wish above and click Launch Wish!</div>`;
    return;
  }

  container.innerHTML = wishes.map((w) => `
    <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-2 animate-float">
      <div class="flex items-start gap-2">
        <span class="text-lg">🏮</span>
        <p class="text-xs text-amber-200 font-medium leading-snug">"${w.text}"</p>
      </div>
      <span class="text-[10px] text-amber-400/60 font-mono">${w.date || ''}</span>
    </div>
  `).join('');
}
