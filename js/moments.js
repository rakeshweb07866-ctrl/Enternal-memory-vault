// ============================================================
// OUR SACRED MOMENTS — Interactive Romantic Keepsake Engine
// Rakesh & Vanshika • Special Memories & Photo Experience
// ============================================================

const SACRED_MOMENTS = [
  {
    id: 1,
    tag: 'US TOGETHER • FOREVER HOME',
    tagClass: 'from-rose-500/25 to-amber-500/25 border-rose-400/50 text-rose-300',
    title: 'The World Fades When I Am With You',
    subtitle: 'Under the quiet evening lights with my arm around you',
    src: 'assests/latest/couple-night.jpeg',
    fallback: 'assests/latest/WhatsApp Image 2026-11-14 at 11.11.52 AM (5).jpeg',
    theme: 'rose',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    note: 'Standing right beside you, feeling your warmth under the night sky... I realized that home is not a place on a map. Home is having you close to my heart. Out of 8 billion souls on this earth, you are the only one I want by my side for every single tomorrow.',
    date: 'A Night Written In The Stars ✨'
  },
  {
    id: 2,
    tag: 'MY ROYAL PRINCESS • LEHENGA GRACE',
    tagClass: 'from-emerald-500/25 to-amber-500/25 border-emerald-400/50 text-emerald-300',
    title: 'Elegance That Steals My Breath',
    subtitle: 'In that traditional black & green embroidery, you are pure royalty',
    src: 'assests/latest/vanshika-royal-lehenga.jpeg',
    fallback: 'assests/latest/WhatsApp Image 2026-11-14 at 11.11.52 AM.jpeg',
    theme: 'emerald',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    note: 'Every time I look at this picture, my breath catches in my throat. The way you carry yourself with so much grace, that gentle shy smile, and the quiet dignity in your posture — you are not just beautiful, Vanshika. You are regal. You are my queen.',
    date: 'Pure Royalty • My One & Only 👑'
  },
  {
    id: 3,
    tag: 'LIVING POETRY • SAPPHIRE BEAUTY',
    tagClass: 'from-sky-500/25 to-blue-500/25 border-sky-400/50 text-sky-300',
    title: 'My Dream in Sapphire Blue',
    subtitle: 'Like a calm ocean wave bringing peace into my chaos',
    src: 'assests/latest/vanshika-blue-dress.jpeg',
    fallback: 'assests/latest/WhatsApp Image 2026-11-14 at 11.11.52 AM (1).jpeg',
    theme: 'blue',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    note: 'You walked into my life and suddenly everything chaotic became calm. In this blue dress, with that innocent softness, you looked like a living prayer answered. Your presence brings a peace to my restless mind that no one else ever could.',
    date: 'An Angel in Blue 💙'
  },
  {
    id: 4,
    tag: 'RARE LIGHT-GREEN EYES • THE UNIVERSE',
    tagClass: 'from-teal-500/25 to-amber-500/25 border-teal-400/50 text-teal-300',
    title: 'The Light In Your Rare Green Eyes',
    subtitle: 'A glance that silences every doubt and warms my soul',
    src: 'assests/latest/vanshika-green-eyes.jpeg',
    fallback: 'assests/latest/WhatsApp Image 2026-11-14 at 11.11.52 AM (2).jpeg',
    theme: 'teal',
    accentColor: '#14b8a6',
    glowColor: 'rgba(20, 184, 166, 0.45)',
    note: 'I could spend a lifetime getting lost in your eyes. That rare light-green shade, holding both quiet strength and delicate vulnerability... when you look into my camera or into my eyes, all the noise in the universe fades into complete silence.',
    date: 'Eyes That Hold My Whole Universe 💚'
  },
  {
    id: 5,
    tag: 'RUBY ELEGANCE • SOUL OF STRENGTH',
    tagClass: 'from-rose-500/25 to-pink-500/25 border-rose-400/50 text-rose-300',
    title: 'Grace In Red & Soft Serenity',
    subtitle: 'Behind that soft gaze is a woman of unbreakable strength',
    src: 'assests/latest/vanshika-red-elegance.jpeg',
    fallback: 'assests/latest/WhatsApp Image 2026-11-14 at 11.11.52 AM (4).jpeg',
    theme: 'ruby',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    note: 'Red has always been the color of deep devotion, and seeing you here reminds me why I want to protect your heart forever. You have survived storms with that gentle heart intact. You are safe with me now, Vanshika. Always and unconditionally.',
    date: 'Devotion in Crimson ❤️'
  },
  {
    id: 6,
    tag: 'QUIET MOMENTS • MY FIRST & LAST THOUGHT',
    tagClass: 'from-amber-500/25 to-rose-500/25 border-amber-400/50 text-amber-300',
    title: 'The Sweetest Peace In Your Gaze',
    subtitle: 'Cheek resting softly, looking straight into my heart',
    src: 'assests/latest/vanshika-soft-portrait.jpeg',
    fallback: 'assests/latest/WhatsApp Image 2026-11-14 at 11.11.52 AM (13).jpeg',
    theme: 'amber',
    accentColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    note: 'My favorite face to start my day thinking of, and the quiet comfort that stays in my mind when the night gets late. Just this simple, beautiful look is enough to make every hardship in life feel small. You are my greatest blessing.',
    date: 'My Forever Morning & Midnight 🌙'
  },
  {
    id: 7,
    tag: 'UNBREAKABLE BOND • TWO HEARTS AS ONE',
    tagClass: 'from-purple-500/25 to-pink-500/25 border-purple-400/50 text-purple-300',
    title: 'Hand In Hand Through Every Storm',
    subtitle: 'Standing side by side, our destiny intertwined',
    src: 'assests/latest/couple-night-2.jpeg',
    fallback: 'assests/latest/WhatsApp Image 2026-11-14 at 11.11.52 AM (6).jpeg',
    theme: 'purple',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    note: 'Look at us. Standing together in this big world, choosing each other with honesty, loyalty, and deep love. No matter where life takes us, I promise to hold your hand, wipe your tears, celebrate your wins, and love you more with every single breath.',
    date: 'Written In Destiny • Rakesh & Vanshika ♾️'
  }
];

let currentMomentIdx = 0;
let isHeartbeatAnimating = false;

function initSacredMoments() {
  renderMoment(0);
  renderMomentThumbnails();
  initMomentSwipeGestures();
}

function renderMoment(idx) {
  if (idx < 0 || idx >= SACRED_MOMENTS.length) return;
  currentMomentIdx = idx;
  const m = SACRED_MOMENTS[idx];

  const tagEl = document.getElementById('moment-tag');
  const titleEl = document.getElementById('moment-title');
  const subtitleEl = document.getElementById('moment-subtitle');
  const imgEl = document.getElementById('moment-img');
  const noteEl = document.getElementById('moment-note');
  const dateEl = document.getElementById('moment-date');
  const counterEl = document.getElementById('moment-counter');
  const auraEl = document.getElementById('moment-card-aura');

  if (tagEl) {
    tagEl.className = 'inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ' + m.tagClass + ' border text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] shadow-md transition-all duration-300';
    tagEl.innerHTML = `<span class="w-2 h-2 rounded-full animate-ping" style="background-color: ${m.accentColor}"></span><span>${m.tag}</span>`;
  }
  if (titleEl) titleEl.textContent = m.title;
  if (subtitleEl) subtitleEl.textContent = m.subtitle;
  if (noteEl) noteEl.textContent = m.note;
  if (dateEl) dateEl.textContent = m.date;
  if (counterEl) counterEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(SACRED_MOMENTS.length).padStart(2, '0')}`;

  if (imgEl) {
    imgEl.style.opacity = '0';
    imgEl.style.transform = 'scale(0.96)';
    setTimeout(() => {
      imgEl.src = m.src;
      imgEl.onerror = () => { imgEl.src = m.fallback; };
      imgEl.alt = m.title;
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1)';
    }, 150);
  }

  if (auraEl) {
    auraEl.style.background = `radial-gradient(circle, ${m.glowColor} 0%, transparent 70%)`;
  }

  // Update dots
  const dots = document.querySelectorAll('.moment-dot');
  dots.forEach((d, i) => {
    if (i === idx) {
      d.classList.add('w-8', 'bg-amber-300');
      d.classList.remove('w-2', 'bg-white/20');
    } else {
      d.classList.remove('w-8', 'bg-amber-300');
      d.classList.add('w-2', 'bg-white/20');
    }
  });

  // Update thumbs
  const thumbs = document.querySelectorAll('.moment-thumb-item');
  thumbs.forEach((t, i) => {
    if (i === idx) {
      t.classList.add('ring-2', 'ring-amber-300', 'scale-105', 'opacity-100');
      t.classList.remove('opacity-50');
      t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    } else {
      t.classList.remove('ring-2', 'ring-amber-300', 'scale-105', 'opacity-100');
      t.classList.add('opacity-50');
    }
  });
}

function nextMoment() {
  const nextIdx = (currentMomentIdx + 1) % SACRED_MOMENTS.length;
  renderMoment(nextIdx);
  playMomentSoftChime();
}

function prevMoment() {
  const prevIdx = (currentMomentIdx - 1 + SACRED_MOMENTS.length) % SACRED_MOMENTS.length;
  renderMoment(prevIdx);
  playMomentSoftChime();
}

function goToMoment(idx) {
  renderMoment(idx);
  playMomentSoftChime();
}

function renderMomentThumbnails() {
  const container = document.getElementById('moment-thumbs-row');
  if (!container) return;
  container.innerHTML = SACRED_MOMENTS.map((m, i) => `
    <button onclick="goToMoment(${i})" class="moment-thumb-item shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-white/20 transition-all duration-300 cursor-pointer ${i === 0 ? 'ring-2 ring-amber-300 scale-105 opacity-100' : 'opacity-50 hover:opacity-80'}">
      <img src="${m.src}" onerror="this.src='${m.fallback}'" alt="${m.title}" class="w-full h-full object-cover">
    </button>
  `).join('');
}

function initMomentSwipeGestures() {
  const card = document.getElementById('moment-main-card');
  if (!card) return;
  let startX = 0;
  let startY = 0;

  card.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  card.addEventListener('touchend', (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (dx < 0) nextMoment();
      else prevMoment();
    }
  }, { passive: true });
}

// ============================================================
// TOUCH TO FEEL HEARTBEAT INTERACTION
// ============================================================
function triggerMomentHeartbeat() {
  if (isHeartbeatAnimating) return;
  isHeartbeatAnimating = true;

  const btn = document.getElementById('moment-heartbeat-btn');
  const frame = document.getElementById('moment-photo-frame');
  const m = SACRED_MOMENTS[currentMomentIdx];

  // 1. Play Web Audio Heartbeat Dual Thump (Lub-Dub)
  playRealisticHeartbeatSound();

  // 2. Mobile Haptic Vibration
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([40, 50, 40, 60]); } catch (e) {}
  }

  // 3. Frame Pulse Animation
  if (frame) {
    frame.classList.add('moment-pulse-active');
    setTimeout(() => frame.classList.remove('moment-pulse-active'), 1200);
  }

  // 4. Button Feedback
  if (btn) {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span>💓</span><span>Beating For You...</span>`;
    btn.classList.add('scale-105', 'bg-rose-500');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('scale-105', 'bg-rose-500');
      isHeartbeatAnimating = false;
    }, 1500);
  }

  // 5. Shower Heart & Sparkle Particles
  burstMomentHearts(m.accentColor);
}

function playRealisticHeartbeatSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playThump = (time, freq, gainVal, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + dur);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(gainVal, time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + dur + 0.05);
    };

    const now = ctx.currentTime;
    // Lub (First thump)
    playThump(now, 68, 0.28, 0.16);
    // Dub (Second thump, 130ms later)
    playThump(now + 0.13, 56, 0.22, 0.18);
  } catch (e) {}
}

function playMomentSoftChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  } catch (e) {}
}

function burstMomentHearts(color) {
  const container = document.getElementById('moment-particles-container') || document.body;
  const count = 18;
  const emojis = ['❤️', '💖', '✨', '🌹', '💕', '👑'];

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'moment-floating-heart pointer-events-none fixed z-[9999] select-none';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.fontSize = (14 + Math.random() * 18) + 'px';

    const btn = document.getElementById('moment-heartbeat-btn');
    const rect = btn ? btn.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    p.style.left = startX + 'px';
    p.style.top = startY + 'px';

    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
    const dist = 60 + Math.random() * 120;
    const targetX = Math.cos(angle) * dist;
    const targetY = Math.sin(angle) * dist - 50;

    p.style.transition = 'all 1.1s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    p.style.opacity = '1';
    p.style.transform = 'translate(-50%, -50%) scale(0.6)';

    container.appendChild(p);

    requestAnimationFrame(() => {
      p.style.transform = `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) scale(1.3) rotate(${Math.random() * 40 - 20}deg)`;
      p.style.opacity = '0';
    });

    setTimeout(() => { if (p.parentNode) p.remove(); }, 1200);
  }
}

// ============================================================
// FULLSCREEN CINEMA MODE
// ============================================================
function openMomentCinema() {
  const modal = document.getElementById('moment-cinema-modal');
  if (!modal) return;
  const m = SACRED_MOMENTS[currentMomentIdx];

  const cinemaImg = document.getElementById('cinema-img');
  const cinemaTag = document.getElementById('cinema-tag');
  const cinemaTitle = document.getElementById('cinema-title');
  const cinemaNote = document.getElementById('cinema-note');
  const cinemaDate = document.getElementById('cinema-date');

  if (cinemaImg) {
    cinemaImg.src = m.src;
    cinemaImg.onerror = () => { cinemaImg.src = m.fallback; };
  }
  if (cinemaTag) cinemaTag.textContent = m.tag;
  if (cinemaTitle) cinemaTitle.textContent = m.title;
  if (cinemaNote) cinemaNote.textContent = m.note;
  if (cinemaDate) cinemaDate.textContent = m.date;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  playMomentSoftChime();
}

function closeMomentCinema() {
  const modal = document.getElementById('moment-cinema-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
}

// Auto init on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSacredMoments);
} else {
  initSacredMoments();
}

// Window global exports
if (typeof window !== 'undefined') {
  window.nextMoment = nextMoment;
  window.prevMoment = prevMoment;
  window.goToMoment = goToMoment;
  window.triggerMomentHeartbeat = triggerMomentHeartbeat;
  window.openMomentCinema = openMomentCinema;
  window.closeMomentCinema = closeMomentCinema;
}
