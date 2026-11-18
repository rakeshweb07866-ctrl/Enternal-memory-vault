// ==========================================
// CHAPTER 02 — 17 NOV 2026 (2ND MONTH ANNIVERSARY)
// Modern Mobile-First Interactive Story Engine
// ==========================================

const NOV17_REAL_YOU_CARDS = [
  {
    emoji: '💚',
    title: 'Your Rare Light-Green Eyes',
    body: 'I have never seen eyes like yours anywhere in this world. One look into them makes all the noise around me go completely quiet.'
  },
  {
    emoji: '🛡️',
    title: 'Your Quiet, Unbreakable Strength',
    body: 'You have walked through storms most people would break under, yet you still carry the softest, kindest heart. I deeply respect and admire you.'
  },
  {
    emoji: '🤍',
    title: 'All Of You — Including Your Past',
    body: 'You never have to hide your scars or worry about being too much. I did not fall for a perfect filter — I fell in love with the real Vanshika, past, pain, flaws, and all.'
  },
  {
    emoji: '😊',
    title: 'Your Real, Unfiltered Laugh',
    body: 'When something catches you off guard and you genuinely laugh, it feels like warm sunlight hitting my chest. Keeping that smile alive is my favorite goal.'
  },
  {
    emoji: '🫶',
    title: 'The Trust You Gave Me',
    body: 'I know trusting someone after getting hurt takes real bravery. Thank you for letting me close. I will spend every day proving your heart is safe with me.'
  }
];

const NOV17_CHAPTER2_REASONS = [
  'The way your name sounds when I say it.',
  'Your rare light-green eyes that hold the whole universe.',
  'Your laugh, especially the quiet one when something really catches you off guard.',
  'Your honesty, even when opening up felt scary for you.',
  'The quiet strength you carry every single day.',
  'The fact that your heart is still kind even after people hurt you.',
  'Your voice at night when everything around us is calm.',
  'The way you slowly trusted me a little more each day.',
  'Your genuine heart — real, warm, and deeply caring.',
  'You are gentle with others even on your own hard days.',
  'The courage it takes for you to be vulnerable with me.',
  'The way you make ordinary moments feel unforgettable.',
  'Even your silence feels peaceful and safe to me.',
  'You inspire me to become a better man every single day.',
  'You care so deeply, even when you try to hide it.',
  'The random cute things you say that make me smile for hours.',
  'You have survived battles most people cannot even imagine.',
  'Your sensitivity is not a weakness — it is your purest superpower.',
  'You are 100% real. Never fake, never pretending.',
  'The fact that out of everyone in this world, you chose me.',
  'Even your stubbornness — honestly, I adore every bit of it.',
  'The tiny details you notice that nobody else pays attention to.',
  'You feel things deeply, and that makes you one in a billion.',
  'You turn a simple five-minute chat into the best part of my day.',
  'Your past did not make you bitter — it made you wiser and stronger.',
  'You are soft-hearted without ever being weak. That is rare.',
  'When you care about someone, you give your whole heart.',
  'Just knowing you are there makes my mind feel calm.',
  'You are worth every effort, and I will never stop choosing you.',
  'With you, I feel like I am finally right where I belong.',
  'Your tears matter deeply to me. I will never take them lightly.',
  'You have so much love inside you, and I feel lucky to hold it.',
  'Your thoughts, your feelings, and your voice always matter to me.',
  'Your curiosity and the way your mind works.',
  'Because even when life gets heavy, you still keep trying.',
  'Because you opened a door in your heart that you kept locked for so long.',
  'The way you say my name.',
  'You have a whole beautiful world inside your mind, and I want to know all of it.',
  'You are far more beautiful than you ever give yourself credit for.',
  'Your warmth makes people feel seen and understood.',
  'Your loyalty — in a world full of temporary people, you are real.',
  'Your imperfections make you human, and I love every single one of them.',
  'Calling you mine still feels like the biggest blessing of my life.',
  'You deserve every soft, gentle, happy thing this life has to offer.',
  'My heart belongs completely to you — there is nobody else.',
  'On tired days, you still show up and try. I see that and cherish it.',
  'You are worth every prayer, every promise, and every late night.',
  'Knowing you has made my life brighter in every possible way.',
  'You are simply my favorite person on this entire planet.',
  'I want to keep learning new things about you for the rest of my life.',
  'Two months with you felt like finally coming home.',
  'I never want to imagine a life where our paths did not cross.',
  'You are enough — exactly as you are, right this second.',
  'I love you beyond lists, yet I still wrote 60 reasons just to see you smile.',
  'Because you said yes to me on September 17th.',
  'Because every single day since then has felt worth living more fully.',
  'Because you are Vanshika.',
  'Because you are my Vanshika.',
  'Because loving you is the greatest chapter of my life.',
  'Happy 2nd Month Anniversary, my love. Forever starts right here. — Rakesh 💍'
];

let nov17CurrentSlide = 0;
const NOV17_TOTAL_SLIDES = 6;
let nov17RealYouIdx = 0;
let nov17ScratchDone = false;
let nov17ScratchInitialized = false;
let nov17SealInterval = null;
let nov17SealProgress = 0;
let nov17SealCompleted = false;
let nov17StarsAnimId = null;

function isNov17ActualDay() {
  if (typeof window !== 'undefined' && (window.location.search.includes('preview=1') || window.location.search.includes('anniv=1'))) {
    return true;
  }
  const now = new Date();
  // SIRF 17 November 2026 ko hi true hai
  return (now.getFullYear() === 2026 && now.getMonth() === 10 && now.getDate() === 17);
}

function canAccessNov17Chapter2() {
  if (typeof window !== 'undefined' && (window.location.search.includes('preview=1') || window.location.search.includes('anniv=1'))) {
    return true;
  }
  return isNov17ActualDay();
}

function initNov17Chapter2() {
  try {
    nov17SealCompleted = localStorage.getItem('nov17_month2_sealed') === 'true';
  } catch (e) {}

  updateNov17Countdown();
  setInterval(updateNov17Countdown, 1000);
  updateNov17LauncherUI();
  renderNov17RealYouCard();
  renderNov17ReasonsList();
  initNov17SwipeGestures();
  initNov17SealButton();

  // NOTE: maybeAutoLaunchNov17 is called from applySuccessfulLogin() after login button click
  // Do NOT call it here on init - it would auto-show animation without actual login
}

function updateNov17LauncherUI() {
  const badge = document.getElementById('nov17-section-badge');
  const subtitle = document.getElementById('nov17-section-subtitle');
  const btnText = document.getElementById('nov17-launch-btn-text');
  const lockHint = document.getElementById('nov17-lock-hint');
  const navStorybook = document.getElementById('nav-storybook-link');
  const navStillYou = document.getElementById('nav-stillyou-link');
  const btnChapter2Storybook = document.getElementById('btn-chapter2-storybook');
  const btnChapter2StillYou = document.getElementById('btn-chapter2-stillyou');

  if (isNov17ActualDay()) {
    if (badge) badge.textContent = '🎉 Today Is 17 November • 2nd Month Anniversary!';
    if (subtitle) subtitle.textContent = 'Happy 2nd Month Anniversary, Vanshika. Tap below to open your surprise ❤️';
    if (btnText) btnText.textContent = 'Open Your 2nd Month Surprise ✨';
    if (lockHint) lockHint.textContent = '✨ Unlocked for 17 November 2026 • Tap to celebrate!';
    if (navStorybook) navStorybook.style.display = '';
    if (navStillYou) navStillYou.style.display = '';
    if (btnChapter2Storybook) btnChapter2Storybook.style.display = '';
    if (btnChapter2StillYou) btnChapter2StillYou.style.display = '';
  } else {
    // Production lock state before 17 Nov
    if (badge) badge.textContent = 'Chapter 02 • 17 November 2026';
    if (btnText) btnText.textContent = 'Unlocks On 17 November 🔒';
    if (lockHint) lockHint.textContent = 'Unlocks automatically for Vanshika on 17 November 2026 💕';
    // Hide direct standalone links from normal public view before 17 Nov
    if (navStorybook) navStorybook.style.display = 'none';
    if (navStillYou) navStillYou.style.display = 'none';
    if (btnChapter2Storybook) btnChapter2Storybook.style.display = 'none';
    if (btnChapter2StillYou) btnChapter2StillYou.style.display = 'none';
  }
}

function updateNov17Countdown() {
  const target = new Date('2026-11-17T00:00:00');
  const now = new Date();
  const diff = target - now;

  const dEl = document.getElementById('nov17-cd-days');
  const hEl = document.getElementById('nov17-cd-hours');
  const mEl = document.getElementById('nov17-cd-mins');
  const sEl = document.getElementById('nov17-cd-secs');
  if (!dEl || !hEl || !mEl || !sEl) return;

  if (diff <= 0) {
    dEl.textContent = '60';
    hEl.textContent = '2M';
    mEl.textContent = '❤️';
    sEl.textContent = '✨';
    return;
  }

  const totalSecs = Math.floor(diff / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  dEl.textContent = String(days).padStart(2, '0');
  hEl.textContent = String(hours).padStart(2, '0');
  mEl.textContent = String(mins).padStart(2, '0');
  sEl.textContent = String(secs).padStart(2, '0');
}

function maybeAutoLaunchNov17() {
  // AUTO-LAUNCH DISABLED - 17 Nov guzar gaya. Animation sirf manual section visit par.
  return;
}

function openNov17Chapter2(forcePreview = false) {
  if (!forcePreview && !canAccessNov17Chapter2()) {
    const locked = document.getElementById('nov17-locked-modal');
    if (locked) {
      locked.classList.remove('hidden');
      locked.classList.add('flex');
    }
    return;
  }

  if (typeof openAnniversarySurprise === 'function') {
    openAnniversarySurprise();
    return;
  }

  openNov17StoryOnly();
}

function openNov17StoryOnly() {
  const overlay = document.getElementById('nov17-story-overlay');
  if (!overlay) return;

  const keepImg = document.getElementById('nov17-keepsake-img');
  if (keepImg) {
    try {
      const savedData = JSON.parse(localStorage.getItem('vanshika_gallery_data') || '{}');
      if (savedData['card-queen'] && savedData['card-queen'].photo) {
        keepImg.src = savedData['card-queen'].photo;
      } else if (savedData['card-eyes'] && savedData['card-eyes'].photo) {
        keepImg.src = savedData['card-eyes'].photo;
      }
    } catch (e) {}
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  goToNov17Slide(0);
  startNov17Starfield();
  syncNov17MusicPill();

  if (typeof toggleRomanticMusic === 'function' && typeof isPlayingMusic !== 'undefined' && !isPlayingMusic) {
    toggleRomanticMusic();
    setTimeout(syncNov17MusicPill, 200);
  }
}

function closeNov17Chapter2() {
  const overlay = document.getElementById('nov17-story-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
  if (nov17StarsAnimId) {
    cancelAnimationFrame(nov17StarsAnimId);
    nov17StarsAnimId = null;
  }
}

function closeNov17LockedModal() {
  const locked = document.getElementById('nov17-locked-modal');
  if (locked) {
    locked.classList.add('hidden');
    locked.classList.remove('flex');
  }
}

function toggleNov17Music() {
  if (typeof toggleRomanticMusic === 'function') {
    toggleRomanticMusic();
    setTimeout(syncNov17MusicPill, 150);
  }
}

function syncNov17MusicPill() {
  const pill = document.getElementById('nov17-music-pill');
  if (!pill) return;
  const playing = typeof isPlayingMusic !== 'undefined' && isPlayingMusic;
  pill.textContent = playing ? '⏸️ Playing' : '🎵 Music';
}

function goToNov17Slide(idx) {
  if (idx < 0 || idx >= NOV17_TOTAL_SLIDES) return;
  nov17CurrentSlide = idx;

  for (let i = 0; i < NOV17_TOTAL_SLIDES; i++) {
    const slideEl = document.getElementById('nov17-slide-' + i);
    if (slideEl) {
      if (i === idx) slideEl.classList.add('active');
      else slideEl.classList.remove('active');
    }
  }

  const segs = document.querySelectorAll('#nov17-story-overlay .nov17-progress-seg');
  segs.forEach((seg, i) => {
    seg.classList.remove('done', 'current');
    if (i < idx) seg.classList.add('done');
    else if (i === idx) seg.classList.add('current');
  });

  const counter = document.getElementById('nov17-slide-counter');
  if (counter) counter.textContent = (idx + 1) + ' / ' + NOV17_TOTAL_SLIDES;

  const prevBtn = document.getElementById('nov17-prev-btn');
  const nextBtn = document.getElementById('nov17-next-btn');
  if (prevBtn) prevBtn.disabled = idx === 0;
  if (nextBtn) {
    nextBtn.textContent = idx === NOV17_TOTAL_SLIDES - 1 ? 'Done ✨' : 'Next →';
  }

  if (idx === 3 && !nov17ScratchDone) {
    setTimeout(initNov17ScratchCanvas, 60);
  }
  if (idx === 4 && nov17SealCompleted) {
    applyNov17SealedState(false);
  }

  playNov17SoftTick();
}

function nextNov17Slide() {
  if (nov17CurrentSlide >= NOV17_TOTAL_SLIDES - 1) {
    closeNov17Chapter2();
    return;
  }
  goToNov17Slide(nov17CurrentSlide + 1);
}

function prevNov17Slide() {
  if (nov17CurrentSlide > 0) {
    goToNov17Slide(nov17CurrentSlide - 1);
  }
}

function initNov17SwipeGestures() {
  const shell = document.getElementById('nov17-phone-shell');
  if (!shell) return;
  let startX = 0;
  let startY = 0;
  let ignoreSwipe = false;

  shell.addEventListener('touchstart', (e) => {
    const t = e.target;
    ignoreSwipe = !!(t && (t.id === 'nov17-scratch-canvas' || t.closest('#nov17-seal-btn')));
    if (e.touches && e.touches[0]) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  shell.addEventListener('touchend', (e) => {
    if (ignoreSwipe || !e.changedTouches || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) nextNov17Slide();
      else prevNov17Slide();
    }
  }, { passive: true });
}

function renderNov17RealYouCard() {
  const card = NOV17_REAL_YOU_CARDS[nov17RealYouIdx];
  if (!card) return;
  const emojiEl = document.getElementById('nov17-card-emoji');
  const countEl = document.getElementById('nov17-card-counter');
  const titleEl = document.getElementById('nov17-card-title');
  const bodyEl = document.getElementById('nov17-card-body');
  const dotsEl = document.getElementById('nov17-realyou-dots');

  if (emojiEl) emojiEl.textContent = card.emoji;
  if (countEl) countEl.textContent = (nov17RealYouIdx + 1) + ' / ' + NOV17_REAL_YOU_CARDS.length;
  if (titleEl) titleEl.textContent = card.title;
  if (bodyEl) bodyEl.textContent = card.body;

  if (dotsEl) {
    dotsEl.innerHTML = NOV17_REAL_YOU_CARDS.map((_, i) =>
      `<span class="h-2 rounded-full transition-all ${i === nov17RealYouIdx ? 'w-6 bg-amber-300' : 'w-2 bg-white/25'}"></span>`
    ).join('');
  }
}

function nextNov17RealYouCard() {
  nov17RealYouIdx = (nov17RealYouIdx + 1) % NOV17_REAL_YOU_CARDS.length;
  renderNov17RealYouCard();
  playNov17SoftTick();
}

function prevNov17RealYouCard() {
  nov17RealYouIdx = (nov17RealYouIdx - 1 + NOV17_REAL_YOU_CARDS.length) % NOV17_REAL_YOU_CARDS.length;
  renderNov17RealYouCard();
  playNov17SoftTick();
}

function initNov17ScratchCanvas() {
  const canvas = document.getElementById('nov17-scratch-canvas');
  if (!canvas || nov17ScratchDone) return;

  const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : null;
  const w = Math.max(260, Math.round((rect && rect.width) || canvas.offsetWidth || 320));
  const h = Math.max(220, Math.round((rect && rect.height) || canvas.offsetHeight || 255));
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'source-over';
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#9f1239');
  grad.addColorStop(0.5, '#be185d');
  grad.addColorStop(1, '#b45309');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 45; i++) {
    ctx.fillStyle = 'rgba(255, 235, 180, ' + (0.12 + Math.random() * 0.25) + ')';
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('✨ Scratch With Your Finger ✨', w / 2, h / 2 - 10);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Rakesh hid a special confession inside 💌', w / 2, h / 2 + 16);

  ctx.globalCompositeOperation = 'destination-out';

  if (nov17ScratchInitialized) return;
  nov17ScratchInitialized = true;

  let drawing = false;
  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    return {
      x: ((pt.clientX - r.left) / r.width) * canvas.width,
      y: ((pt.clientY - r.top) / r.height) * canvas.height
    };
  }
  function eraseAt(e) {
    if (!drawing || nov17ScratchDone) return;
    e.preventDefault();
    const pos = getPos(e);
    const c = canvas.getContext('2d');
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.arc(pos.x, pos.y, 26, 0, Math.PI * 2);
    c.fill();
    checkNov17ScratchProgress(c, canvas);
  }

  canvas.addEventListener('mousedown', (e) => { drawing = true; eraseAt(e); });
  window.addEventListener('mouseup', () => { drawing = false; });
  canvas.addEventListener('mousemove', eraseAt);
  canvas.addEventListener('touchstart', (e) => { drawing = true; eraseAt(e); }, { passive: false });
  canvas.addEventListener('touchend', () => { drawing = false; });
  canvas.addEventListener('touchmove', eraseAt, { passive: false });
}

function checkNov17ScratchProgress(ctx, canvas) {
  if (nov17ScratchDone) return;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let cleared = 0;
  const totalPixels = canvas.width * canvas.height;
  for (let i = 3; i < imgData.length; i += 16) {
    if (imgData[i] < 128) cleared += 4;
  }
  if (cleared / totalPixels > 0.36) {
    revealNov17ScratchInstant();
  }
}

function revealNov17ScratchInstant() {
  if (nov17ScratchDone) return;
  nov17ScratchDone = true;
  const canvas = document.getElementById('nov17-scratch-canvas');
  const btn = document.getElementById('nov17-scratch-instant-btn');
  if (canvas) {
    canvas.style.transition = 'opacity 0.65s ease';
    canvas.style.opacity = '0';
    setTimeout(() => { canvas.style.display = 'none'; }, 700);
  }
  if (btn) btn.classList.add('hidden');
  playNov17SparkleChord();
  burstNov17Sparkles();
}

function startNov17SealHold(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (nov17SealCompleted) return;
  if (nov17SealInterval) clearInterval(nov17SealInterval);
  nov17SealInterval = setInterval(() => {
    nov17SealProgress = Math.min(100, nov17SealProgress + 3.5);
    updateNov17SealRing(nov17SealProgress);
    if (nov17SealProgress >= 100) {
      clearInterval(nov17SealInterval);
      nov17SealInterval = null;
      applyNov17SealedState(true);
    }
  }, 45);
}

function stopNov17SealHold() {
  if (nov17SealCompleted) return;
  if (nov17SealInterval) {
    clearInterval(nov17SealInterval);
    nov17SealInterval = null;
  }
  if (nov17SealProgress < 100) {
    nov17SealProgress = 0;
    updateNov17SealRing(0);
  }
}

function initNov17SealButton() {
  const btn = document.getElementById('nov17-seal-btn');
  if (btn) {
    btn.addEventListener('pointerdown', startNov17SealHold);
    btn.addEventListener('pointerup', stopNov17SealHold);
    btn.addEventListener('pointerleave', stopNov17SealHold);
    btn.addEventListener('pointercancel', stopNov17SealHold);
  }
  if (nov17SealCompleted) {
    applyNov17SealedState(false);
  }
}

function updateNov17SealRing(pct) {
  const circle = document.getElementById('nov17-seal-circle');
  const pctEl = document.getElementById('nov17-seal-pct');
  const circumference = 326.73;
  if (circle) {
    circle.style.strokeDashoffset = String(circumference - (pct / 100) * circumference);
  }
  if (pctEl) {
    pctEl.textContent = pct > 0 ? Math.round(pct) + '%' : 'HOLD';
  }
}

function applyNov17SealedState(celebrate) {
  nov17SealCompleted = true;
  nov17SealProgress = 100;
  try { localStorage.setItem('nov17_month2_sealed', 'true'); } catch (e) {}

  updateNov17SealRing(100);
  const pctEl = document.getElementById('nov17-seal-pct');
  const instEl = document.getElementById('nov17-seal-instruction');
  const vowsEl = document.getElementById('nov17-sealed-vows');
  if (pctEl) pctEl.textContent = 'SEALED';
  if (instEl) instEl.textContent = 'Our Month 2 Promise is officially locked forever 💕';
  if (vowsEl) vowsEl.classList.remove('hidden');

  if (celebrate) {
    playNov17SparkleChord();
    burstNov17Sparkles();
    if (typeof triggerAnniversaryConfetti === 'function') triggerAnniversaryConfetti();
  }
}

function renderNov17ReasonsList() {
  const list = document.getElementById('nov17-reasons-list');
  if (!list) return;
  list.innerHTML = NOV17_CHAPTER2_REASONS.map((reason, idx) => `
    <div class="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
      <span class="shrink-0 w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500/30 to-amber-400/30 border border-amber-300/40 text-amber-300 text-xs font-black flex items-center justify-center">
        ${idx + 1}
      </span>
      <p class="text-xs sm:text-sm text-slate-100 leading-relaxed pt-0.5">${reason}</p>
    </div>
  `).join('');
}

function openNov17ReasonsSheet() {
  renderNov17ReasonsList();
  const sheet = document.getElementById('nov17-reasons-sheet');
  if (sheet) {
    sheet.classList.remove('hidden');
    sheet.classList.add('flex');
  }
}

function closeNov17ReasonsSheet() {
  const sheet = document.getElementById('nov17-reasons-sheet');
  if (sheet) {
    sheet.classList.add('hidden');
    sheet.classList.remove('flex');
  }
}

function sendNov17CelebrationToChat() {
  closeNov17Chapter2();
  if (typeof sendLiveChatMessage === 'function' && currentChatSender && currentChatPin) {
    sendLiveChatMessage('Happy 2nd Month Anniversary, Rakesh! ❤️✨ I just finished reading Chapter Two and my heart is so full right now 💍💕');
  }
  if (typeof openLiveChatRoom === 'function') {
    setTimeout(openLiveChatRoom, 250);
  }
}

function startNov17Starfield() {
  const canvas = document.getElementById('nov17-stars-canvas');
  if (!canvas) return;
  if (nov17StarsAnimId) cancelAnimationFrame(nov17StarsAnimId);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const stars = Array.from({ length: 95 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.6 + 0.4,
    a: Math.random(),
    da: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1)
  }));

  function frame() {
    const overlay = document.getElementById('nov17-story-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.a += s.da;
      if (s.a <= 0.1 || s.a >= 0.95) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(253, 230, 138, ${s.a})`;
      ctx.fill();
    }
    nov17StarsAnimId = requestAnimationFrame(frame);
  }
  frame();
}

function burstNov17Sparkles() {
  const icons = ['✨', '💖', '🌹', '💛', '💍', '🦋'];
  for (let i = 0; i < 26; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.textContent = icons[Math.floor(Math.random() * icons.length)];
      el.style.cssText = `position:fixed;left:${Math.random() * 100}vw;top:-24px;font-size:${16 + Math.random() * 14}px;z-index:220;pointer-events:none;transition:transform 2.2s ease-in, opacity 2.2s ease-in;opacity:1;`;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translate(${(Math.random() - 0.5) * 90}px, 105vh) rotate(${Math.random() * 260}deg)`;
        el.style.opacity = '0';
      });
      setTimeout(() => el.remove(), 2300);
    }, i * 45);
  }
}

function playNov17SoftTick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {}
}

function playNov17SparkleChord() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.55);
    });
  } catch (e) {}
}

// ============================================================
// GRAND CINEMATIC ANNIVERSARY SCREEN — 17 NOV 2026
// ============================================================

let nov17CinHeartInterval = null;
let nov17CinFireworksId   = null;
let nov17CinParticles     = [];

// A one-of-a-kind, mobile-first photo-film opening for Chapter 02.
function openNov17LoveFilm() {
  if (!canAccessNov17Chapter2()) {
    openNov17Chapter2();
    return;
  }
  if (document.getElementById('nov17-love-film')) return;
  const film = document.createElement('div');
  film.id = 'nov17-love-film';
  film.className = 'nov17-film';
  film.innerHTML = `
    <div class="nov17-film-grain"></div><button class="nov17-film-close" aria-label="Close" onclick="closeNov17LoveFilm()">×</button>
    <div class="nov17-film-top"><span>17 · 11 · 2026</span><span>OUR LITTLE UNIVERSE</span></div>
    <div class="nov17-film-orbit" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>·</i></div>
    <div class="nov17-film-copy"><p class="nov17-film-kicker">A little film, made only for you</p>
      <h1>Two months.<br><em>And still,</em><br>my favourite hello.</h1>
      <p class="nov17-film-note">Vanshika, every ordinary day became a memory just because it had you in it.</p>
    </div>
    <div class="nov17-film-gallery" aria-label="Our photo memories"></div>
    <div class="nov17-memory-progress" aria-live="polite">OPEN EVERY LITTLE MEMORY <span>0 / 14</span><i><b></b></i></div>
    <section class="nov17-film-finale" aria-hidden="true">
      <div class="finale-constellation"><svg viewBox="0 0 240 190" aria-hidden="true"><path class="constellation-lines" d="M120 160 38 93 73 46 119 74 167 38 201 91 120 160 120 74 38 93 167 38 201 91 73 46"/><path class="constellation-heart" d="M120 151C99 134 68 112 68 86c0-16 11-27 27-27 12 0 20 7 25 17 5-10 14-17 26-17 16 0 27 11 27 27 0 26-31 48-53 65Z"/><g class="constellation-stars"><circle cx="120" cy="160" r="3"/><circle cx="38" cy="93" r="3"/><circle cx="73" cy="46" r="3"/><circle cx="119" cy="74" r="3"/><circle cx="167" cy="38" r="3"/><circle cx="201" cy="91" r="3"/></g></svg><span>OUR OWN LITTLE UNIVERSE</span></div>
      <p class="finale-eyebrow">AND HERE IS MY FAVOURITE PART</p>
      <h2>My <em>Cheeppu.</em><br>My <em>Pandu.</em><br>My person.</h2>
      <p class="finale-message">Vanshika, two months with you and my heart still finds new ways to choose you. Happy two months, my love. I am so glad it is you.</p>
      <div class="finale-signature">Always yours <span>♡</span></div>
    </section>
    <button class="nov17-film-continue finale-locked" onclick="closeNov17LoveFilm();if(typeof openStorybookOverlay==='function')openStorybookOverlay();else openNov17Chapter2(true)"><span>Our next little chapter</span><b>↗</b></button>
    <div class="nov17-memory-note" role="dialog" aria-modal="true" aria-hidden="true"><button class="memory-note-close" aria-label="Close note">×</button><span class="memory-note-number">A LITTLE NOTE FOR YOU</span><p></p><button class="memory-note-next">KEEP THIS ONE ♡</button></div>
    <div class="nov17-film-foot">60 days down · a lifetime of little moments to go</div>`;
  document.body.appendChild(film);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => film.classList.add('film-open'));
  film.querySelectorAll('img').forEach(img => img.addEventListener('error', () => img.closest('figure').classList.add('photo-missing')));
  const photos = [
    'vanshika-soft-portrait.jpeg','vanshika-royal-lehenga.jpeg','vanshika-red-elegance.jpeg','vanshika-green-eyes.jpeg','vanshika-blue-dress.jpeg','couple-night.jpeg','couple-night-2.jpeg',
    'WhatsApp Image 2026-11-14 at 11.11.52 AM.jpeg','WhatsApp Image 2026-11-14 at 11.11.52 AM (1).jpeg','WhatsApp Image 2026-11-14 at 11.11.52 AM (2).jpeg','WhatsApp Image 2026-11-14 at 11.11.52 AM (4).jpeg','WhatsApp Image 2026-11-14 at 11.11.52 AM (5).jpeg','WhatsApp Image 2026-11-14 at 11.11.52 AM (6).jpeg','WhatsApp Image 2026-11-14 at 11.11.52 AM (13).jpeg'
  ];
  const gallery = film.querySelector('.nov17-film-gallery');
  gallery.innerHTML = photos.map((file, i) => `<figure class="nov17-film-photo" role="button" tabindex="0" data-memory="${i}" style="--photo-index:${i}"><img loading="lazy" src="assests/latest/${file}" alt="A favourite memory, ${i + 1}"><figcaption>memory ${String(i + 1).padStart(2, '0')} <span>tap to open ✦</span></figcaption></figure>`).join('');
  const notes = [
    'You have this quiet way of making the whole world feel softer. I hope you see yourself through my eyes at least once: lovely, rare, and impossible not to adore.',
    'This is one of my favourite kinds of magic: simply being beside you. No grand plan, no perfect moment. Just us, and somehow that is everything.',
    'You walked in and the whole frame got brighter. Two months in, and I still catch myself thinking: how did I get this lucky?'
  ];
  let opened = new Set();
  const note = film.querySelector('.nov17-memory-note');
  const reveal = card => {
    const memoryIndex = Number(card.dataset.memory);
    const index = memoryIndex % notes.length;
    note.querySelector('p').textContent = notes[index];
    note.querySelector('.memory-note-number').textContent = `A LITTLE NOTE FOR YOU · ${String(memoryIndex + 1).padStart(2, '0')}`;
    note.classList.add('note-visible'); note.setAttribute('aria-hidden', 'false');
    card.classList.add('memory-opened'); opened.add(index);
    film.querySelector('.nov17-memory-progress span').textContent = `${opened.size} / ${photos.length}`;
    film.querySelector('.nov17-memory-progress i b').style.width = `${opened.size / photos.length * 100}%`;
    if (opened.size === photos.length) {
      const finale = film.querySelector('.nov17-film-finale');
      finale.classList.add('finale-visible');
      finale.setAttribute('aria-hidden', 'false');
      film.querySelector('.nov17-memory-progress').classList.add('progress-complete');
      film.querySelector('.nov17-memory-progress').childNodes[0].textContent = 'OUR LITTLE UNIVERSE, COMPLETE ';
      film.querySelector('.nov17-film-continue').classList.remove('finale-locked');
      film.querySelector('.nov17-film-continue span').textContent = 'For my Cheeppu & Pandu';
    }
  };
  film.querySelectorAll('.nov17-film-photo').forEach(card => {
    card.addEventListener('click', () => reveal(card));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(card); } });
  });
  note.querySelector('.memory-note-close').addEventListener('click', () => { note.classList.remove('note-visible'); note.setAttribute('aria-hidden', 'true'); });
  note.querySelector('.memory-note-next').addEventListener('click', () => { note.classList.remove('note-visible'); note.setAttribute('aria-hidden', 'true'); });
}

function closeNov17LoveFilm() {
  const film = document.getElementById('nov17-love-film');
  if (film) film.remove();
  document.body.style.overflow = '';
}

function openNov17GrandCinematic() {
  const screen = document.getElementById('nov17-grand-cinematic');
  if (!screen) return;

  // Show screen
  screen.scrollTop = 0;
  screen.classList.remove('hidden', 'cin-exit');
  screen.classList.add('cin-visible');
  requestAnimationFrame(() => { screen.scrollTop = 0; });

  // Start effects
  startNov17CinFireworks();
  startNov17HeartRain();
  playNov17CinematicChord();

  // Try playing romantic music if available
  try {
    if (typeof toggleRomanticMusic === 'function') {
      const musicBtn = document.getElementById('romantic-music-btn');
      if (musicBtn && musicBtn.dataset.playing !== 'true') {
        toggleRomanticMusic();
      }
    }
  } catch (e) {}
}

function closeNov17GrandCinematic() {
  const screen = document.getElementById('nov17-grand-cinematic');
  if (!screen) return;

  screen.classList.remove('cin-visible');
  screen.classList.add('cin-exit');

  // Stop effects
  stopNov17CinFireworks();
  stopNov17HeartRain();

  setTimeout(() => {
    screen.classList.add('hidden');
    screen.classList.remove('cin-exit');
  }, 650);
}

function openCinematicStory() {
  closeNov17GrandCinematic();
  setTimeout(() => openNov17Chapter2(true), 400);
}

// ---- Flower & Heart Rain ----
function startNov17HeartRain() {
  const container = document.getElementById('nov17-heart-rain');
  if (!container) return;
  container.innerHTML = '';

  const emojis = ['🌸', '💖', '🌹', '🌺', '💕', '✨', '💐', '💗', '🌷', '❤️', '💍', '🌟'];

  if (nov17CinHeartInterval) clearInterval(nov17CinHeartInterval);

  nov17CinHeartInterval = setInterval(() => {
    const heart = document.createElement('span');
    heart.className = 'nov17-cin-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = (Math.random() * 96 + 2) + 'vw';
    heart.style.fontSize = (1.2 + Math.random() * 1.5) + 'rem';
    const dur = 4 + Math.random() * 5;
    heart.style.animationDuration = dur + 's';
    heart.style.animationDelay = '0s';
    container.appendChild(heart);
    // Remove after animation completes
    setTimeout(() => { if (heart.parentNode) heart.remove(); }, (dur + 0.5) * 1000);
  }, 220);
}

function stopNov17HeartRain() {
  if (nov17CinHeartInterval) {
    clearInterval(nov17CinHeartInterval);
    nov17CinHeartInterval = null;
  }
  const container = document.getElementById('nov17-heart-rain');
  if (container) container.innerHTML = '';
}

// ---- Fireworks Canvas ----
function startNov17CinFireworks() {
  const canvas = document.getElementById('nov17-cinematic-canvas');
  if (!canvas) return;
  if (nov17CinFireworksId) cancelAnimationFrame(nov17CinFireworksId);

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  nov17CinParticles = [];

  // Seed starfield
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    alpha: Math.random(),
    speed: Math.random() * 0.008 + 0.003
  }));

  // Auto-launch firework bursts every 1.5s
  const burstTimer = setInterval(() => {
    if (!document.getElementById('nov17-grand-cinematic') ||
        document.getElementById('nov17-grand-cinematic').classList.contains('hidden')) {
      clearInterval(burstTimer);
      return;
    }
    launchNov17CinFirework(ctx, canvas);
  }, 1500);
  // First burst immediately
  setTimeout(() => launchNov17CinFirework(ctx, canvas), 300);
  setTimeout(() => launchNov17CinFirework(ctx, canvas), 900);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, s.alpha))})`;
      ctx.fill();
    });

    // Draw firework particles
    nov17CinParticles = nov17CinParticles.filter(p => p.alpha > 0.02);
    nov17CinParticles.forEach(p => {
      p.x     += p.vx;
      p.y     += p.vy;
      p.vy    += 0.06; // gravity
      p.vx    *= 0.98;
      p.alpha -= p.fade;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},90%,65%,${p.alpha})`;
      ctx.fill();
    });

    nov17CinFireworksId = requestAnimationFrame(draw);
  }
  draw();
}

function launchNov17CinFirework(ctx, canvas) {
  const x   = canvas.width  * (0.2 + Math.random() * 0.6);
  const y   = canvas.height * (0.1 + Math.random() * 0.45);
  const hue = Math.random() * 360;
  const count = 55 + Math.floor(Math.random() * 35);

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2.5 + Math.random() * 3.5;
    nov17CinParticles.push({
      x, y,
      vx:   Math.cos(angle) * speed,
      vy:   Math.sin(angle) * speed,
      r:    1.5 + Math.random() * 1.5,
      hue:  hue + Math.random() * 40 - 20,
      alpha: 1,
      fade: 0.012 + Math.random() * 0.01
    });
  }
}

function stopNov17CinFireworks() {
  if (nov17CinFireworksId) {
    cancelAnimationFrame(nov17CinFireworksId);
    nov17CinFireworksId = null;
  }
  nov17CinParticles = [];
  const canvas = document.getElementById('nov17-cinematic-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// ---- Cinematic chord (ascending sparkle) ----
function playNov17CinematicChord() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Ascending arpeggiated love theme
    const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i < 4 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 1.3);
    });
  } catch (e) {}
}

// Global window aliases for bulletproof onclick bindings
if (typeof window !== 'undefined') {
  window.goToNov17Slide = goToNov17Slide;
  window.nov17GoToSlide = goToNov17Slide;
  window.nextNov17Slide = nextNov17Slide;
  window.prevNov17Slide = prevNov17Slide;
  window.prevNov17RealYouCard = prevNov17RealYouCard;
  window.nextNov17RealYouCard = nextNov17RealYouCard;
  window.nov17PrevCard = prevNov17RealYouCard;
  window.nov17NextCard = nextNov17RealYouCard;
  window.startNov17SealHold = startNov17SealHold;
  window.stopNov17SealHold = stopNov17SealHold;
  window.revealNov17ScratchInstant = revealNov17ScratchInstant;
  window.openNov17ReasonsSheet = openNov17ReasonsSheet;
  window.closeNov17ReasonsSheet = closeNov17ReasonsSheet;
  window.openNov17Chapter2 = openNov17Chapter2;
  window.closeNov17Chapter2 = closeNov17Chapter2;
  window.closeNov17LockedModal = closeNov17LockedModal;
  window.openNov17GrandCinematic = openNov17GrandCinematic;
  window.closeNov17GrandCinematic = closeNov17GrandCinematic;
  window.openCinematicStory = openCinematicStory;
}
