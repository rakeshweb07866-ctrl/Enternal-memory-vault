// ==========================================
// VISUAL EFFECTS ENGINE
// (Canvas Floating Hearts, Confetti & Grand Fireworks)
// ==========================================

// 1. Background Floating Hearts & Golden Stardust
function initCanvasHearts() {
  const canvas = document.getElementById('canvas-container');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 45;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 16 + 8;
      this.speedY = Math.random() * 0.9 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.7 + 0.2;
      this.isHeart = Math.random() > 0.35;
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -20) { this.reset(); this.y = height + 10; }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      if (this.isHeart) {
        ctx.fillStyle = '#ff3b77';
        ctx.font = `${this.size}px serif`;
        ctx.fillText('💖', this.x, this.y);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// 2. Rose Petals & Golden Confetti Shower
function triggerAnniversaryConfetti() {
  for (let i = 0; i < 60; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = (Math.random() * 3 + 2) + 's';
    petal.style.opacity = Math.random();
    petal.style.width = (Math.random() * 12 + 8) + 'px';
    petal.style.height = (Math.random() * 12 + 8) + 'px';
    petal.style.background = Math.random() > 0.5 ? '#f59e0b' : '#f43f5e';
    document.body.appendChild(petal);

    setTimeout(() => petal.remove(), 5000);
  }
}

// 3. Grand Fullscreen Cinematic Fireworks Engine
let fireworksAnimFrame = null;
let fireworksCanvas = null;
let fireworksCtx = null;
let fireworksParticles = [];
let fireworksRockets = [];
let floatingHearts = [];
let fireworksActive = false;

class CinematicRocket {
  constructor(w, h) {
    this.x = Math.random() * (w * 0.8) + (w * 0.1);
    this.y = h;
    this.targetY = Math.random() * (h * 0.45) + (h * 0.08);
    this.speed = Math.random() * 4 + 7;
    this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
    this.color = ['#ffd700', '#ff3b77', '#f43f5e', '#a855f7', '#38bdf8', '#fbbf24', '#34d399'][Math.floor(Math.random() * 7)];
    this.trail = [];
  }
  update() {
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > 8) this.trail.shift();
    this.trail.forEach(t => t.alpha *= 0.85);

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    return this.y <= this.targetY;
  }
  draw(ctx) {
    this.trail.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class FireworkSpark {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.012;
    this.gravity = 0.08;
    this.friction = 0.96;
    this.size = Math.random() * 2.5 + 1.5;
  }
  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    return this.alpha <= 0;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class CinematicHeart {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.reset();
    this.y = Math.random() * h;
  }
  reset() {
    this.x = Math.random() * this.w;
    this.y = this.h + 20;
    this.speedY = Math.random() * 1.5 + 0.8;
    this.amplitude = Math.random() * 30 + 10;
    this.frequency = Math.random() * 0.02 + 0.01;
    this.phase = Math.random() * Math.PI * 2;
    this.size = Math.random() * 18 + 12;
    this.alpha = Math.random() * 0.6 + 0.3;
    this.char = Math.random() > 0.4 ? '💖' : (Math.random() > 0.5 ? '🌹' : '✨');
  }
  update() {
    this.y -= this.speedY;
    this.phase += this.frequency;
    this.currX = this.x + Math.sin(this.phase) * this.amplitude;
    if (this.y < -30) this.reset();
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = `${this.size}px serif`;
    ctx.fillText(this.char, this.currX || this.x, this.y);
    ctx.restore();
  }
}

function initFireworksEngine() {
  fireworksCanvas = document.getElementById('anniv-fireworks-canvas');
  if (!fireworksCanvas) return;
  fireworksCtx = fireworksCanvas.getContext('2d');
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;

  floatingHearts = [];
  for (let i = 0; i < 25; i++) {
    floatingHearts.push(new CinematicHeart(fireworksCanvas.width, fireworksCanvas.height));
  }
}

function launchRocketBurst(w, h) {
  if (fireworksRockets.length < 5) {
    fireworksRockets.push(new CinematicRocket(w, h));
  }
}

function explodeRocket(x, y, color) {
  const colors = [color, '#ffd700', '#ffffff', '#ff3b77', '#f43f5e', '#a855f7'];
  const count = 55;
  for (let i = 0; i < count; i++) {
    const c = colors[Math.floor(Math.random() * colors.length)];
    fireworksParticles.push(new FireworkSpark(x, y, c));
  }
}

function loopFireworks() {
  if (!fireworksActive || !fireworksCtx) return;
  const w = fireworksCanvas.width;
  const h = fireworksCanvas.height;

  fireworksCtx.clearRect(0, 0, w, h);

  if (Math.random() < 0.08) launchRocketBurst(w, h);

  for (let i = fireworksRockets.length - 1; i >= 0; i--) {
    const r = fireworksRockets[i];
    const exploded = r.update();
    r.draw(fireworksCtx);
    if (exploded) {
      explodeRocket(r.x, r.y, r.color);
      fireworksRockets.splice(i, 1);
    }
  }

  for (let i = fireworksParticles.length - 1; i >= 0; i--) {
    const p = fireworksParticles[i];
    const dead = p.update();
    p.draw(fireworksCtx);
    if (dead) fireworksParticles.splice(i, 1);
  }

  floatingHearts.forEach(heart => {
    heart.update();
    heart.draw(fireworksCtx);
  });

  fireworksAnimFrame = requestAnimationFrame(loopFireworks);
}

function playGrandCinematicAnniversaryAnimation() {
  if (!isAnniversaryActive()) {
    openAnniversarySurpriseModal();
    return;
  }
  const screen = document.getElementById('anniv-grand-cinematic-screen');
  if (!screen) return;

  screen.classList.remove('hidden');
  screen.classList.add('flex');
  fireworksActive = true;

  initFireworksEngine();
  if (fireworksAnimFrame) cancelAnimationFrame(fireworksAnimFrame);
  loopFireworks();

  triggerAnniversaryConfetti();

  if (typeof toggleRomanticMusic === 'function' && !isPlayingMusic) {
    toggleRomanticMusic();
  }
}

function dismissGrandCinematicScreen() {
  const screen = document.getElementById('anniv-grand-cinematic-screen');
  if (screen) {
    screen.classList.add('hidden');
    screen.classList.remove('flex');
  }
  fireworksActive = false;
  if (fireworksAnimFrame) cancelAnimationFrame(fireworksAnimFrame);
  if (fireworksCtx && fireworksCanvas) fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
}

function enterCelebrationFromCinematic() {
  dismissGrandCinematicScreen();
  sessionStorage.setItem('anniv_cinematic_played', 'true');
  setTimeout(() => {
    openPrincessWelcomeModal(true);
  }, 300);
}
