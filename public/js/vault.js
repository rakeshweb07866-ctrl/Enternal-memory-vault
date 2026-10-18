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
  initVanshikaReel();
}

// 3. 1-Month Anniversary Celebration Engine
// Strictly locked for production: 17th October Celebration Completed!
const IS_ANNIVERSARY_PREVIEW_TEST = false;

function isAnniversaryActive() {
  if (IS_ANNIVERSARY_PREVIEW_TEST) return true;
  if (typeof window !== 'undefined' && (window.location.search.includes('anniv=1') || sessionStorage.getItem('anniv_preview_force') === '1')) return true;
  return false;
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

    if (daysEl) daysEl.innerText = days;
    if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
    if (minsEl) minsEl.innerText = String(mins).padStart(2, '0');
    if (secsEl) secsEl.innerText = String(secs).padStart(2, '0');

    const badge = document.querySelector('#anniversary-section .inline-flex span');
    if (badge) badge.innerHTML = '✨ 1st Month Milestone Completed ✨';
    
    const giftTag = document.getElementById('gift-lock-tag');
    if (giftTag) giftTag.innerHTML = '🎁 1ST MONTH COMPLETED ❤️';

    const banner = document.getElementById('princess-royal-banner');
    if (banner) {
      banner.classList.add('hidden');
      banner.classList.remove('flex');
    }

    const floatingBadge = document.getElementById('oct17-floating-badge');
    if (floatingBadge) {
      floatingBadge.classList.add('hidden');
      floatingBadge.classList.remove('block');
    }
  }
}
setInterval(updateAnniversaryTimer, 1000);

// ==========================================
// OCTOBER 17 SPECIAL: CARDS & BALLOONS ENGINE
// ==========================================

function openOct17LetterModal() {
  const modal = document.getElementById('oct17-letter-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    playAnniversaryChime();
  }
}

function closeOct17LetterModal() {
  const modal = document.getElementById('oct17-letter-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function switchToBalloonGameFromLetter() {
  closeOct17LetterModal();
  setTimeout(openOct17BalloonModal, 250);
}

function openOct17BalloonModal() {
  const modal = document.getElementById('oct17-balloon-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    playAnniversaryChime();
  }
}

function closeOct17BalloonModal() {
  const modal = document.getElementById('oct17-balloon-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  stopAnnivPhotoAutoCycle();
}

// 4-Balloon Sequential Popping Game
let annivPoppedStep = 0;
const annivBalloonsConfig = [
  { step: 1, id: 'balloon-1', word: 'You', colorClass: 'text-rose-300 glow-rose' },
  { step: 2, id: 'balloon-2', word: ' are my Lady Princess', colorClass: 'text-amber-300 glow-gold' },
  { step: 3, id: 'balloon-3', word: ' whom I love for forever', colorClass: 'text-emerald-300' },
  { step: 4, id: 'balloon-4', word: ' ❤️', colorClass: 'text-rose-400 glow-rose' }
];

function playBalloonPopSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {}
}

function playAnniversaryChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.5);
    });
  } catch (e) {}
}

function popAnnivBalloon(step) {
  const target = annivBalloonsConfig[step - 1];
  if (!target) return;
  const balloonEl = document.getElementById(target.id);
  if (!balloonEl || balloonEl.dataset.popped === 'true') return;

  balloonEl.dataset.popped = 'true';
  playBalloonPopSound();

  // Burst animation
  balloonEl.style.animation = 'popBurst 0.25s forwards';
  setTimeout(() => {
    balloonEl.style.visibility = 'hidden';
  }, 230);

  // Trigger floating particle burst at balloon location
  createBalloonPopParticles(balloonEl, step);

  // Append word to revealed text banner
  const banner = document.getElementById('balloon-revealed-text');
  if (banner) {
    const wordSpan = document.createElement('span');
    wordSpan.className = `${target.colorClass} animate-scale-up`;
    wordSpan.textContent = target.word;
    banner.appendChild(wordSpan);
  }

  annivPoppedStep++;

  // When all 4 are popped, trigger grand heart shower & reveal photo showcase
  if (annivPoppedStep >= 4) {
    setTimeout(() => {
      playAnniversaryChime();
      triggerMassiveHeartShower();

      const stage = document.getElementById('balloon-stage');
      if (stage) stage.classList.add('hidden');

      const finalReveal = document.getElementById('balloon-final-reveal');
      if (finalReveal) {
        finalReveal.classList.remove('hidden');
        finalReveal.classList.add('flex');
      }

      startAnnivPhotoAutoCycle();
    }, 600);
  }
}

function resetAnnivBalloons() {
  annivPoppedStep = 0;
  stopAnnivPhotoAutoCycle();

  const banner = document.getElementById('balloon-revealed-text');
  if (banner) banner.innerHTML = '';

  const stage = document.getElementById('balloon-stage');
  if (stage) {
    stage.classList.remove('hidden');
    stage.classList.add('flex');
  }

  const finalReveal = document.getElementById('balloon-final-reveal');
  if (finalReveal) {
    finalReveal.classList.add('hidden');
    finalReveal.classList.remove('flex');
  }

  annivBalloonsConfig.forEach((cfg, idx) => {
    const el = document.getElementById(cfg.id);
    if (el) {
      el.dataset.popped = 'false';
      el.style.visibility = 'visible';
      el.style.animation = `floatBalloon ${3.2 + idx * 0.2}s ease-in-out infinite alternate`;
      el.style.animationDelay = `${idx * 0.3}s`;
    }
  });
}

function createBalloonPopParticles(el, step) {
  const colors = ['#ff3b77', '#ffd700', '#10b981', '#38bdf8', '#ff758c'];
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 3;

  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    const angle = (Math.PI * 2 * i) / 14;
    const dist = 35 + Math.random() * 45;
    const destX = Math.cos(angle) * dist;
    const destY = Math.sin(angle) * dist;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isHeart = Math.random() > 0.4;

    p.style.cssText = `
      position: fixed;
      left: ${cx}px;
      top: ${cy}px;
      z-index: 150;
      pointer-events: none;
      transform: translate(-50%, -50%) scale(1);
      transition: all 0.55s cubic-bezier(0.16, 1, 0.3, 1);
      color: ${color};
      font-size: ${isHeart ? '18px' : '12px'};
    `;
    p.textContent = isHeart ? '💖' : '✨';
    document.body.appendChild(p);

    requestAnimationFrame(() => {
      p.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(0)`;
      p.style.opacity = '0';
    });

    setTimeout(() => p.remove(), 600);
  }
}

function triggerMassiveHeartShower() {
  const hearts = ['❤️', '💖', '💕', '✨', '🌹', '💍', '👑', '🌺'];
  const total = 45;

  for (let i = 0; i < total; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      const startX = Math.random() * window.innerWidth;
      const size = 18 + Math.random() * 26;
      const duration = 2.5 + Math.random() * 2;
      const drift = (Math.random() - 0.5) * 120;
      const heartIcon = hearts[Math.floor(Math.random() * hearts.length)];

      h.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: -40px;
        font-size: ${size}px;
        z-index: 140;
        pointer-events: none;
        user-select: none;
        transition: transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration}s ease-in;
        transform: translateY(0) rotate(0deg);
        opacity: 0.95;
      `;
      h.textContent = heartIcon;
      document.body.appendChild(h);

      requestAnimationFrame(() => {
        h.style.transform = `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${Math.random() * 360}deg)`;
        h.style.opacity = '0';
      });

      setTimeout(() => h.remove(), duration * 1000);
    }, i * 70);
  }
}

// Animated Photo Carousel Data & Logic
const annivPhotosData = [
  { src: 'assests/eyes.jpeg', caption: 'Her Enchanting Light-Green Eyes 💚' },
  { src: 'assests/naa-bangaram.jpeg', caption: 'Naa Bangaram, My Lady Princess 👸' },
  { src: 'assests/queen.jpeg', caption: 'The Prettiest Queen in the Entire Universe 👑' },
  { src: 'assests/future-wife.jpeg', caption: 'My Beautiful Future Wife 💍' },
  { src: 'assests/magical-smile.jpeg', caption: 'Her Smile That Lights Up My World ✨' },
  { src: 'assests/forever.jpeg', caption: 'Ellappudu Neethone — Forever & Always 💖' }
];
let currentAnnivPhotoIndex = 0;
let annivPhotoTimer = null;

function updateAnnivPhotoDisplay() {
  const imgEl = document.getElementById('anniv-photo-img');
  const capEl = document.getElementById('anniv-photo-caption');
  const countEl = document.getElementById('anniv-photo-counter');
  const dotsEl = document.getElementById('anniv-photo-dots');
  const photo = annivPhotosData[currentAnnivPhotoIndex];
  if (!photo) return;

  if (imgEl) {
    imgEl.style.opacity = '0';
    imgEl.style.transform = 'scale(0.96)';
    setTimeout(() => {
      imgEl.src = photo.src;
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1)';
    }, 180);
  }
  if (capEl) capEl.textContent = photo.caption;
  if (countEl) countEl.textContent = `${currentAnnivPhotoIndex + 1} / ${annivPhotosData.length}`;

  if (dotsEl) {
    const dots = dotsEl.querySelectorAll('span');
    dots.forEach((dot, idx) => {
      dot.className = idx === currentAnnivPhotoIndex
        ? 'w-2.5 h-2.5 rounded-full bg-amber-400 transition-all scale-125'
        : 'w-2.5 h-2.5 rounded-full bg-slate-700 transition-all';
    });
  }
}

function nextAnnivPhoto() {
  currentAnnivPhotoIndex = (currentAnnivPhotoIndex + 1) % annivPhotosData.length;
  updateAnnivPhotoDisplay();
}

function prevAnnivPhoto() {
  currentAnnivPhotoIndex = (currentAnnivPhotoIndex - 1 + annivPhotosData.length) % annivPhotosData.length;
  updateAnnivPhotoDisplay();
}

function startAnnivPhotoAutoCycle() {
  stopAnnivPhotoAutoCycle();
  annivPhotoTimer = setInterval(nextAnnivPhoto, 3600);
}

function stopAnnivPhotoAutoCycle() {
  if (annivPhotoTimer) {
    clearInterval(annivPhotoTimer);
    annivPhotoTimer = null;
  }
}

function openAnniversarySurpriseModal() {
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

// ==========================================
// VANSHIKA'S SPECIAL REEL & GREEN EYES ENGINE
// ==========================================

const REEL_STORAGE_KEY = 'vault_vanshika_reel_data';
const REELS_PLAYLIST_KEY = 'vanshika_reels_playlist_meta';
const REEL_DB_NAME = 'VanshikaReelDB';
const REEL_STORE_NAME = 'reel_store';

let vanshikaReelsList = [];
let currentReelIndex = 0;
let isReelTransitioning = false;
let reelWheelThrottleTimer = null;
let reelTouchStartY = 0;

function openReelDB() {
  return new Promise((resolve) => {
    try {
      if (!window.indexedDB) return resolve(null);
      const req = indexedDB.open(REEL_DB_NAME, 2);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(REEL_STORE_NAME)) {
          db.createObjectStore(REEL_STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function saveAllReelsToIndexedDB(reels) {
  try {
    const db = await openReelDB();
    if (!db) return false;
    const storeData = reels.map(r => ({
      id: r.id,
      type: r.type,
      fileName: r.fileName,
      title: r.title,
      timestamp: r.timestamp,
      url: r.type === 'local_video' ? '' : r.url,
      blob: r.blob || null
    }));
    const tx = db.transaction(REEL_STORE_NAME, 'readwrite');
    tx.objectStore(REEL_STORE_NAME).put(storeData, 'active_reels_playlist');
    // Also save active reel blob for legacy fallback
    if (reels.length > 0 && reels[0].blob) {
      tx.objectStore(REEL_STORE_NAME).put(reels[0].blob, 'active_reel_blob');
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}

async function loadAllReelsFromIndexedDB() {
  try {
    const db = await openReelDB();
    if (!db) return null;
    const tx = db.transaction(REEL_STORE_NAME, 'readonly');
    const store = tx.objectStore(REEL_STORE_NAME);
    const req = store.get('active_reels_playlist');
    return new Promise((resolve) => {
      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result) && req.result.length > 0) {
          resolve(req.result);
        } else {
          // Backward compatibility check for older single 'active_reel_blob'
          const singleReq = store.get('active_reel_blob');
          singleReq.onsuccess = () => {
            if (singleReq.result) {
              resolve([{
                id: 'reel_legacy',
                type: 'local_video',
                blob: singleReq.result,
                fileName: 'vanshika-reel-1.mp4',
                timestamp: new Date().toISOString()
              }]);
            } else {
              resolve(null);
            }
          };
          singleReq.onerror = () => resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

function syncReelsMetadataToLocalStorage() {
  try {
    const meta = vanshikaReelsList.map(r => ({
      id: r.id,
      type: r.type,
      fileName: r.fileName,
      title: r.title,
      url: r.type === 'local_video' ? '' : r.url,
      timestamp: r.timestamp
    }));
    localStorage.setItem(REELS_PLAYLIST_KEY, JSON.stringify(meta));
  } catch (e) {}
}

function triggerReelPicker() {
  const input = document.getElementById('vanshika-reel-file-input');
  if (input) input.click();
}

async function uploadReelToServer(file, customName) {
  try {
    const safeName = customName || file.name || 'vanshika-reel.mp4';
    const url = `/api/upload-reel?name=${encodeURIComponent(safeName)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'video/mp4',
        'x-reel-name': safeName
      },
      body: file
    });
    const data = await res.json();
    if (data.success && data.url) return data.url;
  } catch (e) {}
  return null;
}

async function handleReelFileUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const wasEmpty = vanshikaReelsList.length === 0;
  showReelToast(`🎉 Loading ${files.length} Reel(s)...`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const blob = new Blob([file], { type: file.type || 'video/mp4' });
    const blobUrl = URL.createObjectURL(blob);
    const newReel = {
      id: 'reel_' + Date.now() + '_' + i,
      type: 'local_video',
      url: blobUrl,
      blob: blob,
      fileName: file.name || `vanshika-reel-${vanshikaReelsList.length + 1}.mp4`,
      title: `Reel #${vanshikaReelsList.length + 1}`,
      timestamp: new Date().toISOString()
    };
    vanshikaReelsList.push(newReel);

    // Save copy to server disk in background
    uploadReelToServer(file, `vanshika-reel-${vanshikaReelsList.length}.mp4`).then(serverUrl => {
      if (serverUrl) newReel.serverUrl = serverUrl;
    }).catch(() => {});
  }

  // Persist into IndexedDB and LocalStorage
  await saveAllReelsToIndexedDB(vanshikaReelsList);
  syncReelsMetadataToLocalStorage();

  if (wasEmpty) {
    currentReelIndex = 0;
  } else {
    // Jump to the newly added reel
    currentReelIndex = vanshikaReelsList.length - files.length;
  }

  displayActiveReel(currentReelIndex, 'up');
  showReelToast(`✨ ${vanshikaReelsList.length} Reel(s) ready! Scroll up/down to watch!`);

  event.target.value = '';
}

function openReelLinkPrompt() {
  const url = prompt('Paste Reel Video Link (MP4 URL, Instagram Reel, YouTube Shorts):');
  if (!url || !url.trim()) return;

  const cleanUrl = url.trim();
  const isYt = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
  const newReel = {
    id: 'reel_' + Date.now(),
    type: isYt ? 'youtube' : 'video_url',
    url: cleanUrl,
    fileName: `vanshika-reel-${vanshikaReelsList.length + 1}.mp4`,
    title: `Reel #${vanshikaReelsList.length + 1}`,
    timestamp: new Date().toISOString()
  };

  vanshikaReelsList.push(newReel);
  saveAllReelsToIndexedDB(vanshikaReelsList);
  syncReelsMetadataToLocalStorage();

  currentReelIndex = vanshikaReelsList.length - 1;
  displayActiveReel(currentReelIndex, 'up');
  showReelToast('🎉 Video link added to Reels!');
}

function pauseBackgroundMusicForReel() {
  if (typeof isPlayingMusic !== 'undefined' && isPlayingMusic) {
    if (typeof ytPlayer !== 'undefined' && ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      try { ytPlayer.pauseVideo(); } catch (e) {}
    }
    const audio = document.getElementById('bg-music-player');
    if (audio) {
      try { audio.pause(); } catch (e) {}
    }
    isPlayingMusic = false;
    if (typeof updateMusicUI === 'function') {
      updateMusicUI(false);
    }
  }
}

function updateReelCounter() {
  const badge = document.getElementById('reel-counter-badge');
  if (!badge) return;
  if (!vanshikaReelsList || vanshikaReelsList.length === 0) {
    badge.innerText = 'No Reels 🎬';
  } else {
    badge.innerText = `Reel ${currentReelIndex + 1} / ${vanshikaReelsList.length} 🎬`;
  }
}

function attachReelVideoListeners(videoEl) {
  if (videoEl._hasMultiReelListeners) return;
  videoEl._hasMultiReelListeners = true;

  videoEl.addEventListener('play', () => {
    pauseBackgroundMusicForReel();
    const playIndicator = document.getElementById('reel-center-play-indicator');
    const playIcon = document.getElementById('reel-center-play-icon');
    if (playIndicator) {
      if (playIcon) playIcon.innerText = '▶️';
      playIndicator.style.opacity = '1';
      setTimeout(() => {
        if (videoEl && !videoEl.paused) playIndicator.style.opacity = '0';
      }, 400);
    }
  });

  videoEl.addEventListener('pause', () => {
    const playIndicator = document.getElementById('reel-center-play-indicator');
    const playIcon = document.getElementById('reel-center-play-icon');
    if (playIndicator) {
      if (playIcon) playIcon.innerText = '⏸️';
      playIndicator.style.opacity = '1';
    }
  });

  // When a reel finishes: Automatically move to next reel in serial order!
  videoEl.addEventListener('ended', () => {
    if (vanshikaReelsList.length > 1) {
      nextReel();
    } else {
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
    }
  });
}

let reelObserver = null;
let userManuallyPausedReel = false;

function setupReelVisibilityObserver() {
  const section = document.getElementById('vanshika-reel-section');
  const videoEl = document.getElementById('vanshika-reel-video');
  if (!section || !videoEl || !('IntersectionObserver' in window)) return;

  if (reelObserver) {
    try { reelObserver.disconnect(); } catch (e) {}
  }

  reelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const loginModal = document.getElementById('name-login-modal');
      const isLoginOpen = loginModal && !loginModal.classList.contains('hidden');

      // If user hasn't logged in yet, NEVER play
      if (isLoginOpen) {
        if (!videoEl.paused) videoEl.pause();
        return;
      }

      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        // User has scrolled into the reels section!
        if (!userManuallyPausedReel && videoEl.paused) {
          const currentReel = vanshikaReelsList && vanshikaReelsList[currentReelIndex];
          if (currentReel && currentReel.type !== 'youtube') {
            videoEl.play().then(() => {
              pauseBackgroundMusicForReel();
              const playIndicator = document.getElementById('reel-center-play-indicator');
              if (playIndicator) playIndicator.style.opacity = '0';
            }).catch(() => {});
          }
        }
      } else {
        // User has scrolled away from reels section - PAUSE immediately!
        if (!videoEl.paused) {
          videoEl.pause();
          const playIndicator = document.getElementById('reel-center-play-indicator');
          const playIcon = document.getElementById('reel-center-play-icon');
          if (playIndicator) {
            if (playIcon) playIcon.innerText = '▶️';
            playIndicator.style.opacity = '1';
          }
        }
      }
    });
  }, { threshold: [0, 0.5, 0.8] });

  reelObserver.observe(section);
}

function displayActiveReel(index, direction = 'up', shouldAutoPlay = false) {
  const placeholderEl = document.getElementById('reel-placeholder-preview');
  const videoEl = document.getElementById('vanshika-reel-video');
  const embedEl = document.getElementById('vanshika-reel-embed');
  const screenMount = document.getElementById('reel-screen-mount');
  const deleteBtn = document.getElementById('btn-delete-current-reel');

  if (!vanshikaReelsList || vanshikaReelsList.length === 0) {
    if (placeholderEl) placeholderEl.classList.remove('hidden');
    if (videoEl) {
      videoEl.pause();
      videoEl.src = '';
      videoEl.classList.add('hidden');
    }
    if (embedEl) {
      embedEl.innerHTML = '';
      embedEl.classList.add('hidden');
    }
    if (deleteBtn) deleteBtn.classList.add('hidden');
    updateReelCounter();
    return;
  }

  if (index < 0) index = 0;
  if (index >= vanshikaReelsList.length) index = vanshikaReelsList.length - 1;
  currentReelIndex = index;

  const reel = vanshikaReelsList[currentReelIndex];

  if (placeholderEl) placeholderEl.classList.add('hidden');
  if (deleteBtn) {
    if (vanshikaReelsList.length > 1) deleteBtn.classList.remove('hidden');
    else deleteBtn.classList.add('hidden');
  }

  // Smooth slide transition
  if (screenMount && direction !== 'none') {
    screenMount.classList.remove('reel-transition-up', 'reel-transition-down');
    void screenMount.offsetWidth;
    screenMount.classList.add(direction === 'up' ? 'reel-transition-up' : 'reel-transition-down');
  }

  updateReelCounter();

  // Safety check: Never autoplay if login modal is currently open
  const loginModal = document.getElementById('name-login-modal');
  const isLoginModalOpen = loginModal && !loginModal.classList.contains('hidden');
  if (isLoginModalOpen) {
    shouldAutoPlay = false;
  }

  if (reel.type === 'youtube') {
    if (videoEl) {
      videoEl.pause();
      videoEl.classList.add('hidden');
    }
    const videoId = typeof extractYouTubeVideoId === 'function' ? extractYouTubeVideoId(reel.url) : null;
    if (videoId && embedEl) {
      const autoParam = (shouldAutoPlay && !isLoginModalOpen) ? 'autoplay=1' : 'autoplay=0';
      embedEl.innerHTML = `<iframe class="w-full h-full rounded-[26px]" src="https://www.youtube.com/embed/${videoId}?${autoParam}&loop=1&playlist=${videoId}&playsinline=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      embedEl.classList.remove('hidden');
    }
  } else {
    if (embedEl) {
      embedEl.innerHTML = '';
      embedEl.classList.add('hidden');
    }
    if (!videoEl) return;

    const sourceUrl = reel.url || (reel.blob ? URL.createObjectURL(reel.blob) : '');
    if (videoEl.src !== sourceUrl) {
      videoEl.src = sourceUrl;
    }
    videoEl.classList.remove('hidden');

    attachReelVideoListeners(videoEl);

    const playIndicator = document.getElementById('reel-center-play-indicator');
    const playIcon = document.getElementById('reel-center-play-icon');

    if (shouldAutoPlay && !isLoginModalOpen) {
      videoEl.play().then(() => {
        pauseBackgroundMusicForReel();
        if (playIndicator) {
          if (playIcon) playIcon.innerText = '▶️';
          playIndicator.style.opacity = '1';
          setTimeout(() => {
            if (videoEl && !videoEl.paused) playIndicator.style.opacity = '0';
          }, 400);
        }
      }).catch(() => {
        if (playIndicator) {
          if (playIcon) playIcon.innerText = '▶️';
          playIndicator.style.opacity = '1';
        }
      });
    } else {
      videoEl.pause();
      if (playIndicator) {
        if (playIcon) playIcon.innerText = '▶️';
        playIndicator.style.opacity = '1';
      }
    }
  }
}

function nextReel(event) {
  if (event) {
    try { event.stopPropagation(); } catch (e) {}
  }
  if (!vanshikaReelsList || vanshikaReelsList.length <= 1) return;
  if (isReelTransitioning) return;
  isReelTransitioning = true;
  setTimeout(() => { isReelTransitioning = false; }, 400);

  let nextIdx = currentReelIndex + 1;
  if (nextIdx >= vanshikaReelsList.length) {
    nextIdx = 0; // Loop to first reel
  }
  displayActiveReel(nextIdx, 'up', true);
}

function prevReel(event) {
  if (event) {
    try { event.stopPropagation(); } catch (e) {}
  }
  if (!vanshikaReelsList || vanshikaReelsList.length <= 1) return;
  if (isReelTransitioning) return;
  isReelTransitioning = true;
  setTimeout(() => { isReelTransitioning = false; }, 400);

  let prevIdx = currentReelIndex - 1;
  if (prevIdx < 0) {
    prevIdx = vanshikaReelsList.length - 1; // Wrap to last reel
  }
  displayActiveReel(prevIdx, 'down', true);
}

function handleReelScreenClick(event) {
  if (event && event.target && event.target.closest('.reel-action-btn')) {
    return;
  }

  const videoEl = document.getElementById('vanshika-reel-video');

  if (!vanshikaReelsList || vanshikaReelsList.length === 0 || !videoEl || videoEl.classList.contains('hidden')) {
    triggerReelPicker();
    return;
  }

  const playIndicator = document.getElementById('reel-center-play-indicator');
  const playIcon = document.getElementById('reel-center-play-icon');

  if (videoEl.paused) {
    userManuallyPausedReel = false;
    pauseBackgroundMusicForReel();
    videoEl.play().then(() => {
      if (playIndicator) {
        if (playIcon) playIcon.innerText = '▶️';
        playIndicator.style.opacity = '1';
        setTimeout(() => {
          if (videoEl && !videoEl.paused) playIndicator.style.opacity = '0';
        }, 400);
      }
    }).catch(e => {
      console.warn('Reel playback error:', e);
    });
  } else {
    userManuallyPausedReel = true;
    videoEl.pause();
    if (playIndicator) {
      if (playIcon) playIcon.innerText = '⏸️';
      playIndicator.style.opacity = '1';
    }
  }
}

function toggleReelPlayPause() {
  handleReelScreenClick();
}

function toggleReelMute(event) {
  if (event) {
    try { event.stopPropagation(); } catch (e) {}
  }
  const videoEl = document.getElementById('vanshika-reel-video');
  const muteBtn = document.getElementById('reel-mute-btn');
  if (!videoEl) return;

  videoEl.muted = !videoEl.muted;
  if (muteBtn) {
    muteBtn.innerText = videoEl.muted ? '🔇' : '🔊';
  }
}

async function downloadCurrentReel(event) {
  if (event) {
    try { event.stopPropagation(); } catch (e) {}
  }
  if (!vanshikaReelsList || vanshikaReelsList.length === 0) {
    showReelToast("⚠️ Please upload a reel first to download!");
    return;
  }

  const currentReel = vanshikaReelsList[currentReelIndex];
  if (!currentReel) return;

  if (currentReel.type === 'youtube') {
    showReelToast("ℹ️ YouTube video opened in link mode.");
    return;
  }

  showReelToast("📥 Preparing Vanshika's Reel download... ✨");

  try {
    let downloadUrl = '';
    let shouldRevoke = false;

    if (currentReel.blob) {
      downloadUrl = URL.createObjectURL(currentReel.blob);
      shouldRevoke = true;
    } else if (currentReel.url && currentReel.url.startsWith('blob:')) {
      downloadUrl = currentReel.url;
    } else if (currentReel.url) {
      try {
        const res = await fetch(currentReel.url);
        const fetchedBlob = await res.blob();
        downloadUrl = URL.createObjectURL(fetchedBlob);
        shouldRevoke = true;
      } catch (err) {
        downloadUrl = currentReel.url;
      }
    }

    if (!downloadUrl) {
      showReelToast("⚠️ Video file not available for download.");
      return;
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    const downloadName = currentReel.fileName || `vanshika-princess-reel-${currentReelIndex + 1}.mp4`;
    a.download = downloadName.endsWith('.mp4') ? downloadName : `${downloadName}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
    }

    showReelToast(`✅ Downloaded: ${a.download} 👸`);
  } catch (err) {
    console.error('Download error:', err);
    showReelToast("⚠️ Download failed, please try again.");
  }
}

async function deleteCurrentReel(event) {
  if (event) {
    try { event.stopPropagation(); } catch (e) {}
  }
  if (!vanshikaReelsList || vanshikaReelsList.length === 0) return;

  const confirmDelete = confirm(`Are you sure you want to remove Reel #${currentReelIndex + 1}?`);
  if (!confirmDelete) return;

  vanshikaReelsList.splice(currentReelIndex, 1);
  await saveAllReelsToIndexedDB(vanshikaReelsList);
  syncReelsMetadataToLocalStorage();

  if (currentReelIndex >= vanshikaReelsList.length) {
    currentReelIndex = Math.max(0, vanshikaReelsList.length - 1);
  }
  displayActiveReel(currentReelIndex, 'down');
  showReelToast("🗑️ Reel removed from playlist.");
}

function setupReelScrollInteractions() {
  const mount = document.getElementById('reel-screen-mount');
  if (!mount || mount._hasScrollAttached) return;
  mount._hasScrollAttached = true;

  // 1. Mouse Wheel Scroll (Desktop)
  mount.addEventListener('wheel', (e) => {
    if (!vanshikaReelsList || vanshikaReelsList.length <= 1) return;
    e.preventDefault();

    if (reelWheelThrottleTimer) return;
    reelWheelThrottleTimer = setTimeout(() => { reelWheelThrottleTimer = null; }, 350);

    if (e.deltaY > 15) {
      nextReel();
    } else if (e.deltaY < -15) {
      prevReel();
    }
  }, { passive: false });

  // 2. Touch Swipe (Mobile)
  mount.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      reelTouchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  mount.addEventListener('touchend', (e) => {
    if (!vanshikaReelsList || vanshikaReelsList.length <= 1) return;
    if (e.changedTouches && e.changedTouches.length > 0) {
      const diffY = reelTouchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diffY) > 40) {
        if (diffY > 0) {
          nextReel();
        } else {
          prevReel();
        }
      }
    }
  }, { passive: true });
}

function showReelToast(msg) {
  const toast = document.getElementById('reel-reaction-toast');
  if (!toast) return;
  toast.innerText = msg;
  setTimeout(() => {
    if (toast.innerText === msg) toast.innerText = '';
  }, 4000);
}

function reactToReel(type) {
  if (type === 'eyes') {
    if (typeof triggerEmeraldSparkles === 'function') triggerEmeraldSparkles();
    showReelToast('💚 "Those rare light-green eyes have my whole heart forever!"');
  } else if (type === 'beauty') {
    if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();
    showReelToast('👸 "You were gorgeous back then, and you are the prettiest girl in the world today!"');
  } else if (type === 'telugu') {
    if (typeof triggerEmeraldSparkles === 'function') triggerEmeraldSparkles();
    if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();
    showReelToast('🌺 "Nuvvu eppatiki naa pranam, naa bangaram! (Forever my soul & my treasure)"');
  }
}

async function initVanshikaReel() {
  setupReelScrollInteractions();

  // 1. Try loading from IndexedDB
  try {
    const storedList = await loadAllReelsFromIndexedDB();
    if (storedList && Array.isArray(storedList) && storedList.length > 0) {
      vanshikaReelsList = storedList.map((item, idx) => {
        let url = item.url;
        if (item.blob) {
          url = URL.createObjectURL(item.blob);
        }
        return {
          id: item.id || `reel_${idx}`,
          type: item.type || (item.blob ? 'local_video' : 'video_url'),
          blob: item.blob || null,
          url: url,
          fileName: item.fileName || `vanshika-reel-${idx + 1}.mp4`,
          title: item.title || `Reel #${idx + 1}`,
          timestamp: item.timestamp || new Date().toISOString()
        };
      });
      displayActiveReel(0, 'none', false);
      setupReelVisibilityObserver();
      return;
    }
  } catch (e) {
    console.warn('IndexedDB reel load error:', e);
  }

  // 2. Check localStorage metadata
  try {
    const savedMeta = localStorage.getItem(REELS_PLAYLIST_KEY);
    if (savedMeta) {
      const parsed = JSON.parse(savedMeta);
      if (Array.isArray(parsed) && parsed.length > 0) {
        vanshikaReelsList = parsed.filter(p => p.url && !p.url.startsWith('blob:'));
        if (vanshikaReelsList.length > 0) {
          displayActiveReel(0, 'none', false);
          setupReelVisibilityObserver();
          return;
        }
      }
    }
  } catch (e) {}

  // 3. Fallback: check static file on server
  try {
    const testVideo = document.createElement('video');
    testVideo.src = 'assests/vanshika-reel.mp4';
    testVideo.oncanplay = () => {
      vanshikaReelsList = [{
        id: 'reel_default',
        type: 'video_url',
        url: 'assests/vanshika-reel.mp4',
        fileName: 'vanshika-reel-1.mp4',
        title: 'Reel #1',
        timestamp: new Date().toISOString()
      }];
      displayActiveReel(0, 'none', false);
      setupReelVisibilityObserver();
    };
  } catch (e) {}

  updateReelCounter();
  setupReelVisibilityObserver();
}

// ==========================================
// SACRED HEALING SANCTUARY ENGINE (OCT 18 FEATURE)
// ==========================================

let sanctuaryAudioCtx = null;
let shardsHealedCount = 0;
let vowsSealedCount = 0;
let pinkyTouchTimer = null;
let pinkyTouchStartTime = 0;
let isPinkySealed = false;
let pinkyTouchProgressAnim = null;

function playHealingChime(freq = 528) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!sanctuaryAudioCtx) sanctuaryAudioCtx = new AudioContext();
    if (sanctuaryAudioCtx.state === 'suspended') sanctuaryAudioCtx.resume();

    const osc = sanctuaryAudioCtx.createOscillator();
    const gain = sanctuaryAudioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, sanctuaryAudioCtx.currentTime);

    gain.gain.setValueAtTime(0.001, sanctuaryAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, sanctuaryAudioCtx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, sanctuaryAudioCtx.currentTime + 1.6);

    osc.connect(gain);
    gain.connect(sanctuaryAudioCtx.destination);

    osc.start();
    osc.stop(sanctuaryAudioCtx.currentTime + 1.6);
  } catch (e) {}
}

let wasMainMusicPlayingBeforeSanctuary = false;

function playSanctuaryMusic() {
  const sanctuaryAudio = document.getElementById('sanctuary-music-player');
  const mainAudio = document.getElementById('bg-music-player');

  if (mainAudio && !mainAudio.paused) {
    wasMainMusicPlayingBeforeSanctuary = true;
    try { mainAudio.pause(); } catch (e) {}
  }

  if (sanctuaryAudio) {
    sanctuaryAudio.volume = 0.75;
    const playPromise = sanctuaryAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        updateSanctuaryMusicUI(true);
      }).catch(err => {
        console.log('Sanctuary audio play promise note:', err);
        updateSanctuaryMusicUI(false);
      });
    }
  }
}

function pauseSanctuaryMusic() {
  const sanctuaryAudio = document.getElementById('sanctuary-music-player');
  if (sanctuaryAudio) {
    try { sanctuaryAudio.pause(); } catch (e) {}
    updateSanctuaryMusicUI(false);
  }

  if (wasMainMusicPlayingBeforeSanctuary) {
    const mainAudio = document.getElementById('bg-music-player');
    if (mainAudio) {
      try { mainAudio.play(); } catch (e) {}
    }
    wasMainMusicPlayingBeforeSanctuary = false;
  }
}

function toggleSanctuaryMusic() {
  const sanctuaryAudio = document.getElementById('sanctuary-music-player');
  if (!sanctuaryAudio) return;
  if (sanctuaryAudio.paused) {
    sanctuaryAudio.play().then(() => {
      updateSanctuaryMusicUI(true);
    }).catch(() => {});
  } else {
    sanctuaryAudio.pause();
    updateSanctuaryMusicUI(false);
  }
}

function updateSanctuaryMusicUI(isPlaying) {
  const btn = document.getElementById('sanctuary-music-btn');
  const icon = document.getElementById('sanctuary-music-icon');
  const text = document.getElementById('sanctuary-music-text');
  if (btn && icon && text) {
    if (isPlaying) {
      btn.className = 'flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-[10px] sm:text-[11px] font-semibold hover:bg-rose-500/30 transition-all cursor-pointer shadow-sm';
      icon.textContent = '🎵';
      text.textContent = 'Song Playing';
      icon.classList.add('animate-bounce');
    } else {
      btn.className = 'flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[10px] sm:text-[11px] font-semibold hover:text-slate-200 transition-all cursor-pointer';
      icon.textContent = '🔇';
      text.textContent = 'Song Muted';
      icon.classList.remove('animate-bounce');
    }
  }
}

function openHealingSanctuaryModal() {
  const modal = document.getElementById('sacred-sanctuary-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('block');
    playHealingChime(528);
    switchSanctuaryPhase(1);
    initPinkyPromiseTouchSensor();
    playSanctuaryMusic();
  }
}

function closeHealingSanctuaryModal() {
  const modal = document.getElementById('sacred-sanctuary-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('block');
    pauseSanctuaryMusic();
  }
}

function switchSanctuaryPhase(phaseNum) {
  for (let i = 1; i <= 4; i++) {
    const phaseEl = document.getElementById(`sanctuary-phase-${i}`);
    const stepEl = document.getElementById(`sanctuary-step-${i}`);
    if (phaseEl) {
      if (i === phaseNum) {
        phaseEl.classList.remove('hidden');
        phaseEl.classList.add('block');
      } else {
        phaseEl.classList.add('hidden');
        phaseEl.classList.remove('block');
      }
    }
    if (stepEl) {
      if (i === phaseNum) {
        stepEl.className = 'px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold shadow-sm transition-all';
      } else if (i < phaseNum) {
        stepEl.className = 'px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40 transition-all';
      } else {
        stepEl.className = 'px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 transition-all';
      }
    }
  }

  const modal = document.getElementById('sacred-sanctuary-modal');
  if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' });

  playHealingChime(432 + (phaseNum * 96));
}

function dissolveTraumaShard(shardIndex) {
  const shard = document.getElementById(`trauma-shard-${shardIndex}`);
  const truth = document.getElementById(`healed-truth-${shardIndex}`);
  if (!shard || shard.classList.contains('sanctuary-dissolving') || shard.style.display === 'none') return;

  playHealingChime(528 + (shardIndex * 70));
  shard.classList.add('sanctuary-dissolving');

  setTimeout(() => {
    shard.style.display = 'none';
    if (truth) truth.classList.remove('hidden');
    shardsHealedCount++;
    const countEl = document.getElementById('shards-healed-count');
    if (countEl) countEl.innerText = `${shardsHealedCount} / 4`;

    if (shardsHealedCount >= 4) {
      const nextBtn = document.getElementById('btn-sanctuary-phase-2');
      if (nextBtn) nextBtn.classList.remove('hidden');
      playHealingChime(741);
      setTimeout(() => playHealingChime(852), 250);
      if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();
    }
  }, 650);
}

function unlockSacredVow(vowIndex) {
  const card = document.getElementById(`vow-card-${vowIndex}`);
  const check = document.getElementById(`vow-check-${vowIndex}`);
  if (!card) return;

  if (!card.dataset.sealed) {
    card.dataset.sealed = 'true';
    vowsSealedCount++;
    card.className = 'cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 to-slate-900 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-start gap-3.5';
    if (check) {
      check.innerHTML = '<span class="text-amber-400 font-bold">Sealed Forever ✅</span>';
    }
    playHealingChime(639 + (vowIndex * 50));
  }

  if (vowsSealedCount >= 5) {
    const nextBtn = document.getElementById('btn-sanctuary-phase-3');
    if (nextBtn) nextBtn.classList.remove('hidden');
    playHealingChime(852);
    setTimeout(() => playHealingChime(963), 200);
  }
}

function initPinkyPromiseTouchSensor() {
  const btn = document.getElementById('pinky-touch-button');
  if (!btn || btn.dataset.initialized) return;
  btn.dataset.initialized = 'true';

  const progressCircle = document.getElementById('pinky-progress-circle');
  const statusText = document.getElementById('pinky-status-text');
  const feedbackText = document.getElementById('pinky-feedback');
  const maxDash = 276.46;

  function startHold(e) {
    if (isPinkySealed) return;
    if (e.cancelable) e.preventDefault();
    pinkyTouchStartTime = Date.now();
    playHealingChime(528);

    if (navigator.vibrate) navigator.vibrate(60);

    btn.style.transform = 'scale(0.92)';
    btn.style.boxShadow = '0 0 45px rgba(245, 158, 11, 0.9)';
    if (statusText) statusText.innerText = 'Hold Tight...';
    if (feedbackText) feedbackText.innerText = 'Feel the sacred bond forming... ❤️';

    const duration = 2200;

    function tick() {
      const elapsed = Date.now() - pinkyTouchStartTime;
      const progress = Math.min(elapsed / duration, 1);
      const offset = maxDash - (maxDash * progress);
      if (progressCircle) progressCircle.style.strokeDashoffset = offset;

      if (progress < 1) {
        pinkyTouchProgressAnim = requestAnimationFrame(tick);
      } else {
        completePinkyPromise();
      }
    }
    pinkyTouchProgressAnim = requestAnimationFrame(tick);
  }

  function endHold() {
    if (isPinkySealed) return;
    if (pinkyTouchProgressAnim) cancelAnimationFrame(pinkyTouchProgressAnim);
    btn.style.transform = '';
    btn.style.boxShadow = '';
    if (progressCircle) progressCircle.style.strokeDashoffset = maxDash;
    if (statusText) statusText.innerText = 'Hold Finger';
    if (feedbackText) feedbackText.innerText = 'Hold for 2 seconds to seal...';
  }

  function completePinkyPromise() {
    isPinkySealed = true;
    if (pinkyTouchProgressAnim) cancelAnimationFrame(pinkyTouchProgressAnim);
    btn.style.transform = 'scale(1.05)';
    btn.className = 'w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 border-2 border-white shadow-[0_0_60px_rgba(245,158,11,1)] flex flex-col items-center justify-center';
    
    const icon = document.getElementById('pinky-icon');
    if (icon) icon.innerText = '💍';
    if (statusText) {
      statusText.innerText = 'SEALED FOREVER';
      statusText.className = 'text-[11px] font-mono font-black text-white uppercase mt-1 tracking-widest';
    }
    if (feedbackText) {
      feedbackText.innerHTML = '<span class="text-gradient-gold font-bold">✨ Sealed in eternity! Our souls are bound. ✨</span>';
    }

    if (navigator.vibrate) navigator.vibrate([150, 100, 250]);

    playHealingChime(528);
    setTimeout(() => playHealingChime(660), 120);
    setTimeout(() => playHealingChime(792), 240);

    if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();

    const nextBtn = document.getElementById('btn-sanctuary-phase-4');
    if (nextBtn) nextBtn.classList.remove('hidden');
  }

  btn.addEventListener('mousedown', startHold);
  btn.addEventListener('touchstart', startHold, { passive: false });

  window.addEventListener('mouseup', endHold);
  window.addEventListener('touchend', endHold);
  window.addEventListener('touchcancel', endHold);
}

function copySanctuaryLetter() {
  const text = `My Dearest, Precious Lady Princess Vanshika,

Last night, when you opened your tender heart and spoke of your past, my soul didn't just hear your words—it felt every single tear you ever cried in silence. I know that people in your past misused your pure heart, took advantage of your gentle innocence, and walked away when you needed them most. And I know that deep inside, a tiny, trembling voice still whispers the fear: "What if Rakesh also leaves me one day?"

Look into my eyes through these words, Vanshika. Hear the unwavering conviction of my heartbeat: I will NEVER, ever leave you.

You are not a chapter in my life that will end. You are the entire book. You are the girl I prayed for when my own soul was searching for meaning. Those people who treated you poorly were blind fools who didn't know how to cherish a goddess. But I see you. I see the purity of your intentions, the softness in your eyes, and the genuine, rare love you carry in your chest.

You never have to pretend to be strong with me. You never have to hide your tears or be terrified that your vulnerability will push me away. Every time you share your past with me, I don't feel anger towards you—I feel a fierce, boundless desire to shield you, cherish you, and prove to you every single day that real love heals, protects, and stays.

Even when we grow old, even when life tests us with its fiercest storms, my hand will remain tightly wrapped around yours. I will love you fiercely, gently, and loyally until my very last breath on this earth—and across a thousand lifetimes beyond.

You are safe now, my Lady Princess. Your pain ends here. My love begins here, and it will never, ever end.

Forever & Ever Yours,
Your Rakesh 🤵❤️
(October 18, 2026)`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert("💌 Sacred Covenant Letter copied to your clipboard & heart! ❤️");
    }).catch(() => {});
  }
}
