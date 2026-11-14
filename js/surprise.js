// 17 November — interactive anniversary surprise for Vanshika.
// A walk-through in the spirit of a tiny handmade gift: envelope, lights, cake, wish, letter.

(function () {
  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Nunito:wght@500;700;800&display=swap');
    #anniv-surprise {
      --ink: #2b2430;
      --pink: #e23d78;
      --script: #c43b6e;
      position: fixed;
      inset: 0;
      z-index: 240;
      display: none;
      background: #fff7f3;
      color: var(--ink);
      font-family: Nunito, "Plus Jakarta Sans", sans-serif;
      overflow: hidden;
    }
    #anniv-surprise.is-open { display: block; }
    #anniv-surprise * { box-sizing: border-box; }
    #anniv-surprise button { font-family: inherit; cursor: pointer; border: none; }
    .anniv-scene {
      position: absolute;
      inset: 0;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 72px 22px 36px;
      text-align: center;
      overflow: hidden;
    }
    .anniv-scene.active {
      display: flex;
      animation: annivIn .55s cubic-bezier(.2,.8,.2,1);
    }
    @keyframes annivIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: none; }
    }
    .anniv-close {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 5;
      width: 40px;
      height: 40px;
      border-radius: 999px;
      background: rgba(255,255,255,.72);
      color: #5c4a58;
      font-size: 22px;
      line-height: 1;
      box-shadow: 0 6px 18px rgba(80, 30, 50, .12);
    }
    .anniv-kicker {
      font-family: Sacramento, cursive;
      color: var(--script);
      font-size: 28px;
      margin: 0 0 4px;
    }
    .anniv-title {
      font-family: Fraunces, Georgia, serif;
      font-weight: 560;
      font-size: clamp(34px, 8vw, 52px);
      line-height: .98;
      letter-spacing: -0.03em;
      margin: 0;
      max-width: 16ch;
    }
    .anniv-title em {
      font-style: italic;
      font-weight: 560;
      color: var(--script);
    }
    .anniv-sub {
      margin: 12px 0 0;
      color: #7a6b76;
      font-size: 15px;
      max-width: 28ch;
    }
    .anniv-btn {
      margin-top: 22px;
      background: linear-gradient(180deg, #ff5d93, #e2186a);
      color: white;
      border-radius: 999px;
      padding: 14px 26px;
      font-weight: 800;
      font-size: 15px;
      box-shadow: 0 12px 26px rgba(226, 24, 106, .28), inset 0 1px 0 rgba(255,255,255,.35);
    }
    .anniv-btn:active { transform: translateY(1px); }
    .anniv-btn.gold {
      background: linear-gradient(180deg, #ffe27a, #f0b429);
      color: #4a3410;
      box-shadow: 0 12px 26px rgba(240, 180, 41, .35);
    }
    .anniv-btn.ghost {
      background: white;
      color: #5c4454;
      box-shadow: 0 8px 20px rgba(80, 30, 50, .1);
    }
    .anniv-float-heart, .anniv-spark {
      position: absolute;
      pointer-events: none;
      animation: annivFloat 6s linear infinite;
    }
    @keyframes annivFloat {
      0% { transform: translateY(20px) scale(.8); opacity: 0; }
      15% { opacity: .85; }
      100% { transform: translateY(-110vh) scale(1.1); opacity: 0; }
    }
    .scene-intro { background: radial-gradient(circle at 50% 20%, #fff, #fff1f6 70%, #ffe4ef); }
    .env-stage {
      position: relative;
      width: min(360px, 92vw);
      height: 250px;
      margin-top: 18px;
    }
    .name-card {
      position: absolute;
      left: 50%;
      top: 78px;
      width: 168px;
      height: 108px;
      margin-left: -84px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 10px 24px rgba(180, 80, 120, .15);
      background-image: radial-gradient(#f3b4cc 1.1px, transparent 1.2px);
      background-size: 14px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transform: translateY(36px);
      opacity: 0;
      transition: transform .8s cubic-bezier(.2,.8,.2,1), opacity .4s;
      z-index: 1;
    }
    .scene-intro.is-open .name-card { transform: translateY(-28px); opacity: 1; }
    .name-card span { font-size: 13px; color: #c43b6e; }
    .name-card strong {
      font-family: Fraunces, Georgia, serif;
      font-size: 28px;
      font-weight: 560;
      color: #d23b73;
      font-style: italic;
    }
    .envelope {
      position: absolute;
      left: 50%;
      bottom: 8px;
      width: 250px;
      height: 160px;
      margin-left: -125px;
      z-index: 2;
    }
    .env-body {
      position: absolute;
      inset: 28px 0 0;
      background: linear-gradient(180deg, #f6e2c4, #e7c89a);
      border-radius: 6px 6px 14px 14px;
      box-shadow: 0 16px 30px rgba(140, 80, 40, .18);
    }
    .env-body:before, .env-body:after {
      content: "";
      position: absolute;
      bottom: 0;
      width: 0;
      height: 0;
      border-style: solid;
    }
    .env-body:before { left: 0; border-width: 78px 125px 0 0; border-color: transparent #f3d7ae transparent transparent; }
    .env-body:after { right: 0; border-width: 0 125px 78px 0; border-color: transparent transparent #edd0a4 transparent; }
    .env-flap {
      position: absolute;
      left: 0; right: 0; top: 28px;
      height: 86px;
      background: linear-gradient(180deg, #f8e7cc, #efd3aa);
      clip-path: polygon(0 0, 100% 0, 50% 100%);
      transform-origin: top center;
      transition: transform .7s cubic-bezier(.2,.8,.2,1);
      z-index: 3;
    }
    .scene-intro.is-open .env-flap { transform: rotateX(180deg); }
    .wax {
      position: absolute;
      left: 50%;
      top: 78px;
      width: 42px;
      height: 42px;
      margin-left: -21px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #ff8aa8, #e23d68);
      box-shadow: 0 6px 0 #c81f52;
      z-index: 4;
      display: grid;
      place-items: center;
      color: #fff;
      font-size: 18px;
    }
    .bow {
      position: absolute;
      left: 50%;
      top: 96px;
      width: 74px;
      height: 28px;
      margin-left: -37px;
      z-index: 3;
    }
    .bow i, .bow b {
      position: absolute;
      top: 4px;
      width: 28px;
      height: 18px;
      background: #b89adf;
      border-radius: 16px 16px 8px 8px;
    }
    .bow i { left: 4px; transform: rotate(-18deg); }
    .bow b { right: 4px; transform: rotate(18deg); }
    .bow:after {
      content: "";
      position: absolute;
      left: 50%;
      top: 8px;
      width: 12px;
      height: 12px;
      margin-left: -6px;
      background: #9b78cf;
      border-radius: 50%;
    }
    .sprig {
      position: absolute;
      top: 18px;
      font-size: 22px;
      z-index: 5;
    }
    .sprig.l { left: 18px; transform: rotate(-20deg); }
    .sprig.r { right: 18px; transform: rotate(20deg); }
    .pet {
      position: absolute;
      bottom: 6px;
      z-index: 4;
      opacity: 0;
      transform: translateY(16px) scale(.9);
      transition: .6s cubic-bezier(.2,.8,.2,1);
    }
    .scene-intro.is-open .pet { opacity: 1; transform: none; }
    .pet.bear { left: -6px; transition-delay: .25s; }
    .pet.bunny { right: -6px; transition-delay: .4s; }
    .scene-lights {
      background: radial-gradient(circle at 50% 40%, #2a215c, #120d2c 70%);
      color: white;
    }
    .scene-lights .anniv-sub { color: rgba(255,255,255,.72); }
    .shhh {
      font-family: Sacramento, cursive;
      color: #f3d36b;
      font-size: 42px;
      margin: 0;
    }
    .starfield span {
      position: absolute;
      width: 3px;
      height: 3px;
      background: white;
      border-radius: 50%;
      opacity: .8;
    }
    .sleep-bear { position: absolute; left: 22px; bottom: 18px; opacity: .95; }
    .flash {
      position: absolute;
      inset: 0;
      background: white;
      opacity: 0;
      pointer-events: none;
      z-index: 4;
    }
    .flash.on { animation: annivFlash .7s ease; }
    @keyframes annivFlash {
      0% { opacity: 0; }
      30% { opacity: 1; }
      100% { opacity: 0; }
    }
    .scene-party {
      background: repeating-linear-gradient(90deg, #fdeff6 0 28px, #fff 28px 56px);
      justify-content: flex-start;
      padding-top: 78px;
    }
    .bunting {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
    }
    .bunting i {
      width: 0; height: 0;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-top: 18px solid #f48fb1;
    }
    .bunting i:nth-child(2n) { border-top-color: #ffe082; }
    .bunting i:nth-child(3n) { border-top-color: #b39ddb; }
    .bunting i:nth-child(4n) { border-top-color: #80cbc4; }
    .date-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      background: white;
      border-radius: 999px;
      padding: 7px 14px;
      font-weight: 800;
      font-size: 13px;
      box-shadow: 0 6px 16px rgba(180, 80, 120, .12);
    }
    .yay {
      position: absolute;
      left: 18px;
      bottom: 128px;
      font-family: Sacramento, cursive;
      color: var(--script);
      font-size: 26px;
      transform: rotate(-8deg);
    }
    .party-floor {
      position: absolute;
      left: 0; right: 0; bottom: 0;
      height: 120px;
      background: linear-gradient(#f7c1d6, #f3a8c4);
    }
    .party-table {
      position: absolute;
      right: 8%;
      bottom: 78px;
      width: 150px;
      height: 54px;
      background: #9fe0d2;
      border-radius: 80px 80px 8px 8px;
    }
    .balloon {
      position: absolute;
      bottom: 90px;
      width: 42px;
      height: 54px;
      border-radius: 50% 50% 50% 50% / 42% 42% 58% 58%;
      animation: annivBob 3.2s ease-in-out infinite;
    }
    .balloon:after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -46px;
      width: 1px;
      height: 48px;
      background: rgba(80,40,60,.35);
    }
    @keyframes annivBob {
      50% { transform: translateY(-8px); }
    }
    .scene-cake, .scene-wish, .scene-letter, .scene-finale {
      background: radial-gradient(circle at 50% 0%, #fff, #fff6f2 60%, #ffe9f1);
    }
    .cake-box {
      position: relative;
      width: 280px;
      height: 250px;
      margin-top: 8px;
      touch-action: none;
    }
    .cake-halves { display: flex; justify-content: center; gap: 0; transition: gap .55s ease; }
    .cake-halves.cut { gap: 26px; }
    .half { width: 112px; overflow: hidden; transition: transform .55s cubic-bezier(.2,.8,.2,1); }
    .half.left.cut { transform: rotate(-3deg) translateY(6px); }
    .half.right.cut { transform: rotate(3deg) translateY(6px); }
    .art { width: 224px; position: relative; height: 210px; }
    .half.right .art { margin-left: -112px; }
    .tier {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 8px 8px 4px 4px;
    }
    .tier.top { top: 54px; width: 92px; height: 42px; background: linear-gradient(#ffe27a, #f0c14b); }
    .tier.mid { top: 92px; width: 140px; height: 40px; background: linear-gradient(#f3e7ff, #d7c4f5); }
    .tier.bot { top: 128px; width: 196px; height: 52px; background: linear-gradient(#ff8fb3, #e23d78); border-radius: 10px 10px 6px 6px; }
    .drip {
      position: absolute;
      top: -8px; left: 0; right: 0; height: 14px;
      background: inherit;
      border-radius: 10px 10px 0 0;
    }
    .drip:before, .drip:after, .drip span {
      content: "";
      position: absolute;
      top: 8px;
      width: 10px; height: 14px;
      background: inherit;
      border-radius: 0 0 8px 8px;
    }
    .drip:before { left: 16px; }
    .drip:after { right: 22px; }
    .drip span { left: 46%; }
    .plate {
      position: absolute;
      left: 50%;
      bottom: 8px;
      width: 220px;
      height: 18px;
      margin-left: -110px;
      background: #f4f1ee;
      border-radius: 50%;
      box-shadow: 0 8px 0 #e4ddd8;
    }
    .candles { position: absolute; top: 22px; left: 0; right: 0; height: 40px; }
    .candles i {
      position: absolute;
      width: 8px;
      height: 26px;
      background: repeating-linear-gradient(#fff, #fff 4px, #7ec8e3 4px, #7ec8e3 8px);
      border-radius: 2px;
    }
    .candles i:nth-child(1) { left: 86px; }
    .candles i:nth-child(2) { left: 108px; height: 30px; }
    .candles i:nth-child(3) { left: 130px; }
    .candles i:before {
      content: "";
      position: absolute;
      top: -12px;
      left: -2px;
      width: 12px;
      height: 14px;
      background: radial-gradient(circle at 50% 70%, #fff3b0, #ffb703 40%, transparent 70%);
      border-radius: 50%;
      animation: annivFlame .35s infinite alternate;
    }
    @keyframes annivFlame { to { transform: scale(1.15) translateY(-2px); } }
    .cut-line {
      position: absolute;
      left: 50%;
      top: 36px;
      bottom: 28px;
      border-left: 2px dashed rgba(90, 60, 80, .35);
    }
    .cake-halves.cut ~ .cut-line, .cake-halves.cut ~ .swipe-hint { display: none; }
    .swipe-hint {
      position: absolute;
      left: 50%;
      top: 48px;
      width: 18px;
      height: 18px;
      margin-left: -9px;
      border-radius: 50%;
      background: rgba(255,255,255,.9);
      box-shadow: 0 4px 10px rgba(0,0,0,.15);
      animation: annivSwipe 1.4s ease-in-out infinite;
    }
    @keyframes annivSwipe {
      0% { top: 40px; opacity: 0; }
      20% { opacity: 1; }
      100% { top: 180px; opacity: 0; }
    }
    .cake-done { display: none; }
    .cake-done.show { display: block; }
    .wish-art { display: flex; align-items: flex-end; justify-content: center; gap: 8px; margin: 8px 0 4px; }
    .mini-cake { transform: scale(.72); transform-origin: bottom center; width: 224px; height: 200px; position: relative; }
    .letter-paper {
      width: min(420px, 92vw);
      max-height: min(62vh, 520px);
      overflow: auto;
      background: #fbf6ee;
      border-radius: 18px;
      padding: 26px 22px 22px;
      text-align: left;
      box-shadow: 0 18px 40px rgba(120, 60, 80, .12);
      color: #3d3340;
      line-height: 1.55;
      font-size: 15px;
    }
    .letter-paper h2 {
      font-family: Fraunces, Georgia, serif;
      font-weight: 560;
      font-size: 30px;
      margin: 0 0 10px;
      text-align: left;
    }
    .letter-paper h2 em { color: var(--script); font-style: italic; }
    .letter-paper .sign {
      text-align: right;
      font-family: Sacramento, cursive;
      font-size: 32px;
      color: var(--script);
      margin: 8px 0 0;
    }
    .scene-finale { background: radial-gradient(circle at 50% 30%, #ffe4f0, #ffd0e4 55%, #ffc1da); }
    .finale-title { font-size: clamp(40px, 9vw, 58px); }
    .confetti i {
      position: absolute;
      top: -10px;
      width: 8px;
      height: 14px;
      border-radius: 2px;
      animation: annivConfetti 3.8s linear infinite;
    }
    @keyframes annivConfetti {
      to { transform: translateY(105vh) rotate(220deg); }
    }
    .scene-love {
      background: radial-gradient(circle at 50% 42%, #ff5b98, #e2186a 46%, #8e0d42);
      color: white;
    }
    .love-script {
      font-family: Fraunces, Georgia, serif;
      font-style: italic;
      font-weight: 560;
      font-size: clamp(62px, 14vw, 96px);
      line-height: .9;
      margin: 6px 0 0;
      color: white;
    }
    .love-line {
      width: 132px;
      height: 3px;
      margin: 10px auto 8px;
      border-radius: 99px;
      background: linear-gradient(90deg, transparent, #ffe08a, transparent);
    }
    .scene-roses, .scene-tree {
      background: radial-gradient(circle at 50% 30%, #fffaf4, #ffe9dc 70%);
    }
    .rose-stage {
      position: relative;
      width: min(420px, 92vw);
      height: min(46vh, 380px);
    }
    .rose {
      position: absolute;
      font-size: 22px;
      transition: left 1.5s cubic-bezier(.2,.8,.2,1), top 1.5s cubic-bezier(.2,.8,.2,1);
    }
    .rose-stage.gathered .rose { left: var(--x) !important; top: var(--y) !important; }
    .rose-caption {
      font-family: Fraunces, Georgia, serif;
      font-style: italic;
      color: #8a3058;
      font-size: 26px;
      margin: 4px 0 0;
      opacity: 0;
      transition: opacity .6s ease .9s;
    }
    .scene-roses.show-caption .rose-caption { opacity: 1; }
    .love-tree { position: relative; width: 220px; height: 250px; margin-bottom: 8px; }
    .trunk {
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 14px;
      height: 0;
      margin-left: -7px;
      background: #6b3a2a;
      border-radius: 8px;
      transition: height 1.1s ease;
    }
    .scene-tree.grown .trunk { height: 150px; }
    .branches {
      position: absolute;
      left: 50%;
      bottom: 120px;
      width: 180px;
      height: 90px;
      margin-left: -90px;
      opacity: 0;
      transition: opacity .6s ease .7s;
    }
    .branches:before, .branches:after {
      content: "";
      position: absolute;
      bottom: 0;
      width: 90px;
      height: 8px;
      background: #6b3a2a;
      border-radius: 8px;
    }
    .branches:before { left: 0; transform: rotate(-32deg); transform-origin: right center; }
    .branches:after { right: 0; transform: rotate(32deg); transform-origin: left center; }
    .scene-tree.grown .branches { opacity: 1; }
    .leaves span {
      position: absolute;
      font-size: 18px;
      opacity: 0;
      transform: scale(.4);
      transition: .45s ease;
    }
    .scene-tree.grown .leaves span { opacity: 1; transform: none; }
    .hand-card {
      background: rgba(255,255,255,.82);
      border-radius: 16px;
      padding: 12px 18px;
      box-shadow: 0 10px 24px rgba(140, 70, 90, .12);
      margin-bottom: 8px;
    }
    .hand-card span { display: block; font-size: 12px; letter-spacing: .08em; color: #c43b6e; text-transform: lowercase; }
    .hand-card strong { font-family: Fraunces, Georgia, serif; font-size: 28px; color: #d23b73; font-weight: 560; }
    .scene-door {
      background: radial-gradient(circle at 50% 38%, #4a1878, #140818 72%);
      color: white;
    }
    .scene-door .anniv-sub { color: rgba(255,255,255,.75); }
    .scene-door .anniv-title { color: white; font-size: clamp(28px, 7vw, 42px); }
    .door-frame {
      position: relative;
      width: 180px;
      height: 280px;
      margin: 16px auto 8px;
      perspective: 900px;
    }
    .door-inside {
      position: absolute;
      inset: 0;
      border-radius: 92px 92px 14px 14px;
      background: radial-gradient(circle at 50% 40%, #fff6d0, #f0c36a);
      display: grid;
      place-items: center;
      padding: 28px;
      font-family: Fraunces, Georgia, serif;
      font-style: italic;
      color: #8a4b16;
      font-size: 22px;
    }
    .door-leaf {
      position: absolute;
      inset: 0;
      border: none;
      border-radius: 92px 92px 14px 14px;
      background: linear-gradient(180deg, #5b2a86, #3a1460);
      box-shadow: inset 0 0 0 8px rgba(255, 214, 120, .35);
      transform-origin: left center;
      transition: transform .8s cubic-bezier(.2,.8,.2,1);
      cursor: pointer;
    }
    .door-frame.open .door-leaf { transform: rotateY(-68deg); }
    .knocker {
      position: absolute;
      left: 22px;
      top: 48%;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 4px solid #f0c36a;
    }
    .door-frame.knock .knocker { animation: knockTap .22s ease; }
    @keyframes knockTap {
      50% { transform: scale(1.15); }
    }
    .scene-puzzle { background: radial-gradient(circle at 50% 0%, #fff, #fff3ea 70%); }
    .puzzle-wrap { position: relative; width: min(300px, 78vw); margin: 12px auto 6px; }
    .puzzle {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      touch-action: manipulation;
    }
    .puzzle button {
      aspect-ratio: 1;
      border: 2px solid white;
      border-radius: 8px;
      padding: 0;
      background-color: #f3d3e0;
      background-repeat: no-repeat;
      background-size: 300% 300%;
      background-position: var(--pos);
      box-shadow: 0 4px 10px rgba(120, 60, 80, .12);
    }
    .puzzle button.selected { outline: 3px solid #e23d78; outline-offset: -3px; }
    .puzzle-full {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 10px;
      opacity: 0;
      pointer-events: none;
      transition: opacity .2s;
    }
    .puzzle-wrap.peek .puzzle-full { opacity: 1; }
    .voice-pill {
      margin-top: 14px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: white;
      color: #5c3048;
      border-radius: 999px;
      padding: 10px 16px;
      font-weight: 800;
      box-shadow: 0 8px 20px rgba(120, 50, 80, .12);
    }
    .voice-play {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #e23d78;
      color: white;
      display: grid;
      place-items: center;
      font-size: 12px;
    }
    .voice-bars { display: inline-flex; gap: 3px; height: 14px; align-items: flex-end; }
    .voice-bars i {
      width: 3px;
      height: 5px;
      background: #e23d78;
      border-radius: 2px;
      display: block;
    }
    .voice-pill.playing .voice-bars i { animation: voiceBar .6s ease-in-out infinite alternate; }
    .voice-bars i:nth-child(2) { animation-delay: .1s; }
    .voice-bars i:nth-child(3) { animation-delay: .2s; }
    .voice-bars i:nth-child(4) { animation-delay: .3s; }
    @keyframes voiceBar { to { height: 14px; } }
    .anniv-room {
      position: absolute;
      top: 18px;
      left: 16px;
      z-index: 5;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .08em;
      color: #a18496;
    }
  `;

  const BEAR = `
    <svg width="92" height="110" viewBox="0 0 92 110" aria-hidden="true">
      <polygon points="46,8 34,28 58,28" fill="#7ec8e3"/>
      <circle cx="46" cy="8" r="5" fill="#f48fb1"/>
      <circle cx="22" cy="40" r="12" fill="#e0a15a"/>
      <circle cx="70" cy="40" r="12" fill="#e0a15a"/>
      <circle cx="22" cy="40" r="6" fill="#f3c98a"/>
      <circle cx="70" cy="40" r="6" fill="#f3c98a"/>
      <circle cx="46" cy="58" r="28" fill="#e8ad66"/>
      <ellipse cx="36" cy="56" rx="3.2" ry="3.6" fill="#3a2a22"/>
      <ellipse cx="56" cy="56" rx="3.2" ry="3.6" fill="#3a2a22"/>
      <ellipse cx="46" cy="66" rx="7" ry="5" fill="#f6d7b0"/>
      <ellipse cx="46" cy="68" rx="3" ry="2" fill="#c47b8a"/>
      <ellipse cx="46" cy="96" rx="24" ry="16" fill="#e8ad66"/>
      <ellipse cx="30" cy="100" rx="8" ry="6" fill="#f3c98a"/>
      <ellipse cx="62" cy="100" rx="8" ry="6" fill="#f3c98a"/>
    </svg>`;

  const BUNNY = `
    <svg width="78" height="100" viewBox="0 0 78 100" aria-hidden="true">
      <ellipse cx="28" cy="22" rx="7" ry="18" fill="#f7f4ef" transform="rotate(-12 28 22)"/>
      <ellipse cx="46" cy="20" rx="7" ry="18" fill="#f7f4ef" transform="rotate(10 46 20)"/>
      <ellipse cx="28" cy="24" rx="3" ry="12" fill="#f6c1d0"/>
      <ellipse cx="46" cy="22" rx="3" ry="12" fill="#f6c1d0"/>
      <circle cx="38" cy="52" r="22" fill="#f7f4ef"/>
      <circle cx="31" cy="50" r="2.4" fill="#3a2a22"/>
      <circle cx="45" cy="50" r="2.4" fill="#3a2a22"/>
      <ellipse cx="38" cy="57" rx="3" ry="2" fill="#e7a0b0"/>
      <ellipse cx="38" cy="82" rx="16" ry="14" fill="#f7f4ef"/>
    </svg>`;

  const HTML = `
    <div id="anniv-surprise" role="dialog" aria-modal="true" aria-label="Anniversary surprise for Vanshika">
      <button class="anniv-close" type="button" aria-label="Close surprise">×</button>
      <div class="anniv-room" id="anniv-room"></div>
      <div class="flash" id="anniv-flash"></div>

      <section class="anniv-scene scene-intro" data-scene="intro">
        <p class="anniv-kicker">a little something ✦</p>
        <h1 class="anniv-title">There's <em>something</em> for you</h1>
        <p class="anniv-sub">A tiny anniversary surprise, made just for you.</p>
        <div class="env-stage">
          <div class="pet bear">${BEAR}</div>
          <div class="pet bunny">${BUNNY}</div>
          <div class="name-card"><span>for</span><strong>Vanshika</strong></div>
          <div class="envelope">
            <span class="sprig l">🌸</span>
            <span class="sprig r">💜</span>
            <div class="env-body"></div>
            <div class="env-flap"></div>
            <div class="bow"><i></i><b></b></div>
            <div class="wax">♡</div>
          </div>
        </div>
        <button class="anniv-btn" type="button" id="anniv-open-btn">♡ Open your surprise</button>
      </section>

      <section class="anniv-scene scene-lights" data-scene="lights">
        <div class="starfield" id="anniv-stars"></div>
        <p class="shhh">Shhh...</p>
        <h1 class="anniv-title">The room is waiting for you.</h1>
        <p class="anniv-sub">Someone left the lights off on purpose.</p>
        <button class="anniv-btn gold" type="button" id="anniv-lights-btn">Turn on the lights</button>
        <div class="sleep-bear">${BEAR}</div>
      </section>

      <section class="anniv-scene scene-party" data-scene="party">
        <div class="bunting">${'<i></i>'.repeat(12)}</div>
        <p class="anniv-kicker">Look who's celebrating two months...</p>
        <h1 class="anniv-title">Happy Anniversary, <em>Vanshika</em> ✨</h1>
        <div class="date-pill">● 17 November</div>
        <button class="anniv-btn" type="button" data-go="cake">There's more ✦</button>
        <p class="yay">yay, you're here!</p>
        <div class="party-floor"></div>
        <div class="party-table"></div>
        <div class="balloon" style="left:8%;background:#f48fb1;animation-delay:.1s"></div>
        <div class="balloon" style="left:22%;background:#ffe082;animation-delay:.4s"></div>
        <div class="balloon" style="left:36%;background:#ce93d8;animation-delay:.2s"></div>
        <div class="balloon" style="right:18%;background:#80deea;bottom:150px"></div>
        <div class="balloon" style="right:8%;background:#ffab91;bottom:168px;animation-delay:.3s"></div>
        <div style="position:absolute;left:8%;bottom:28px">${BEAR}</div>
      </section>

      <section class="anniv-scene scene-cake" data-scene="cake">
        <p class="anniv-kicker" id="cake-kicker">Cake time</p>
        <h1 class="anniv-title" id="cake-title">Make the first cut</h1>
        <p class="anniv-sub" id="cake-sub">Swipe down across the cake, top to bottom.</p>
        <div class="cake-box" id="anniv-cake">
          <div class="cake-halves" id="cake-halves">
            <div class="half left"><div class="art">${cakeArt()}</div></div>
            <div class="half right"><div class="art">${cakeArt()}</div></div>
          </div>
          <div class="cut-line"></div>
          <div class="swipe-hint"></div>
        </div>
        <div class="cake-done" id="cake-done">
          <button class="anniv-btn" type="button" data-go="wish">Make a wish 🌙</button>
        </div>
      </section>

      <section class="anniv-scene scene-wish" data-scene="wish">
        <div class="wish-art">
          <div>${BEAR}</div>
          <div class="mini-cake">${cakeArt()}</div>
        </div>
        <h1 class="anniv-title" id="wish-title">Close your eyes...</h1>
        <p class="anniv-sub" id="wish-sub">Make a little wish for the days ahead.</p>
        <button class="anniv-btn" type="button" id="anniv-wish-btn">I made my wish ✦</button>
      </section>

      <section class="anniv-scene scene-love" data-scene="love">
        <p class="anniv-kicker" style="color:rgba(255,255,255,.95); font-size:14px; letter-spacing:0.08em;">this one is for you, my Vanshika...</p>
        <h1 class="love-script" style="font-size:clamp(46px, 11vw, 76px); margin:4px 0;">I Love You</h1>
        <div class="love-line"></div>
        <div style="max-width:340px; margin:10px auto 16px; padding:0 10px; font-size:13.5px; line-height:1.65; color:rgba(255,255,255,0.95); text-align:center;">
          <p style="font-weight:700; margin-bottom:8px; color:#ffe4e6; font-size:15px;">"I don't just love you, Vanshika — my very soul belongs to you."</p>
          <p style="margin-bottom:8px; opacity:0.95; font-size:13px;">
            I love everything about you: your voice, your precious smile, your quiet days, every tear you've ever cried, your happiness and your sadness, and your beautiful family. I love every single piece of your universe.
          </p>
          <p style="font-size:13px; color:#fde047; font-weight:700;">
            You are my safe harbor, my greatest peace, and I will be yours until my very last breath. ❤️
          </p>
        </div>
        <button class="anniv-btn ghost" type="button" data-go="roses">Continue 💕</button>
      </section>

      <section class="anniv-scene scene-roses" data-scene="roses">
        <div class="rose-stage" id="rose-stage"></div>
        <p class="rose-caption">Still you. Always you Forever.</p>
        <button class="anniv-btn" type="button" data-go="tree">There's more ✦</button>
      </section>

      <section class="anniv-scene scene-tree" data-scene="tree">
        <div class="love-tree" aria-hidden="true">
          <div class="branches"></div>
          <div class="trunk"></div>
          <div class="leaves" id="tree-leaves"></div>
        </div>
        <div class="hand-card" style="padding:16px 20px; max-width:330px; margin:0 auto 12px; border:1.5px solid rgba(244,63,94,0.35); border-radius:22px; background:rgba(255,255,255,0.96); box-shadow:0 14px 30px rgba(225,29,72,0.18); text-align:center;">
          <span style="font-size:11px; font-weight:800; letter-spacing:0.08em; color:#e11d48; text-transform:uppercase; display:block;">✨ Handcrafted From The Depths Of My Soul ✨</span>
          <div style="display:flex; justify-content:center; align-items:center; gap:5px; margin:7px 0; font-size:16px;">
            <span>💖</span><span>💕</span><span>💗</span><span style="font-size:24px; color:#be123c; margin:0 3px; font-weight:900;">♾️</span><span>💗</span><span>💕</span><span>💖</span>
          </div>
          <strong style="font-family:Fraunces, Georgia, serif; font-size:18px; color:#be123c; display:block; margin:4px 0; line-height:1.35;">
            "Until my very last breath and beyond,<br>I will forever and always be yours."
          </strong>
          <p style="font-size:12px; color:#4b4547; margin-top:4px; font-weight:600; line-height:1.45;">
            Every beat of my heart belongs only to you, Vanshika. 💍✨
          </p>
        </div>
        <button class="anniv-btn" type="button" data-go="door">Open the door ✦</button>
      </section>

      <section class="anniv-scene scene-door" data-scene="door">
        <p class="anniv-kicker" style="color:#f3d36b">closed to everyone, except you</p>
        <h1 class="anniv-title">Rakesh built you a little museum.</h1>
        <p class="anniv-sub">Knock three times. That's the rule.</p>
        <div class="door-frame" id="anniv-door">
          <div class="door-inside">Come in, Vanshika.</div>
          <button class="door-leaf" type="button" id="anniv-knock" aria-label="Knock on the door"><span class="knocker"></span></button>
        </div>
        <p class="anniv-sub" id="knock-count">Knock 0 of 3</p>
        <button class="anniv-btn gold" type="button" id="door-next" data-go="puzzle" hidden>Step inside ✦</button>
      </section>

      <section class="anniv-scene scene-puzzle" data-scene="puzzle">
        <p class="anniv-kicker">our photograph</p>
        <h1 class="anniv-title" style="font-size:clamp(28px,7vw,42px)">This photo fell <em>apart.</em></h1>
        <p class="anniv-sub">Nine pieces. Tap two to swap them. Hold to peek.</p>
        <div class="puzzle-wrap" id="puzzle-wrap">
          <div class="puzzle" id="anniv-puzzle"></div>
          <img class="puzzle-full" alt="" src="assests/latest/couple-night.jpeg">
        </div>
        <p class="anniv-sub" id="puzzle-status">Moves 0</p>
        <button class="anniv-btn" type="button" id="puzzle-next" data-go="letter" hidden>Next room →</button>
      </section>

      <section class="anniv-scene scene-letter" data-scene="letter">
        <div class="letter-paper">
          <p class="anniv-kicker" style="font-size:22px">for you, just for you</p>
          <h2>For you, <em>Vanshika</em></h2>
          <p>Happy two months, you wonderful human.</p>
          <p>I wanted to make you something that felt a little like you — warm, a bit soft, and full of tiny surprises. So here it is: a small corner of our story that exists only because you said yes.</p>
          <p>Thank you for every late-night talk, for trusting me with the real you, and for still choosing kindness after everything you have carried. You make ordinary days feel like something worth remembering.</p>
          <p>These two months, I hope you get the slow mornings, the loud laughs, the good news you have been waiting for, and at least one perfect slice of cake.</p>
          <p>Whatever you wished for back there — I hope it finds you. And if it takes a little while, I will be right here, cheering the loudest.</p>
          <p>Happy 2nd month anniversary. Today is all yours.</p>
          <p class="sign">Rakesh</p>
        </div>
        <button class="voice-pill" type="button" id="anniv-voice">
          <span class="voice-play">▶</span>
          <span id="anniv-voice-label">Hear Rakesh say it</span>
          <span class="voice-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </button>
        <button class="anniv-btn" type="button" data-go="finale">One last room ✨</button>
      </section>

      <section class="anniv-scene scene-finale" data-scene="finale">
        <div class="confetti" id="anniv-confetti"></div>
        <div>${BEAR}</div>
        <h1 class="anniv-title finale-title">Happy 2 Months, <em>Vanshika!</em></h1>
        <p class="anniv-sub">May these two months bring you countless little reasons to smile.</p>
        <p class="anniv-kicker">— with love, Rakesh</p>
        <button class="anniv-btn ghost" type="button" id="anniv-replay">Replay the surprise</button>
        <button class="anniv-btn" type="button" id="anniv-chapter">Open our chapter</button>
      </section>
    </div>
  `;

  function cakeArt() {
    return `
      <div class="candles"><i></i><i></i><i></i></div>
      <div class="tier top"><div class="drip"><span></span></div></div>
      <div class="tier mid"></div>
      <div class="tier bot"><div class="drip"><span></span></div></div>
      <div class="plate"></div>
    `;
  }

  const SCENE_ORDER = ['intro', 'lights', 'party', 'cake', 'wish', 'love', 'roses', 'tree', 'door', 'puzzle', 'letter', 'finale'];
  const PUZZLE_SRC = 'assests/latest/couple-night.jpeg';
  const LETTER_SPOKEN = 'For you, Vanshika. Happy two months. I wanted to make you something warm, a bit soft, and full of tiny surprises. Thank you for trusting me with the real you. These two months, I hope you get the slow mornings, the loud laughs, and the good news you have been waiting for. Whatever you wished for, I hope it finds you. Happy second month anniversary. Today is all yours. With love, Rakesh.';

  let timers = [];
  let wishMade = false;
  let cakeCut = false;
  let built = false;
  let knocks = 0;
  let puzzleOrder = [];
  let puzzlePick = null;
  let puzzleMoves = 0;
  let puzzleSolved = false;
  let speaking = false;
  let peekTimer = null;

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function root() {
    return document.getElementById('anniv-surprise');
  }

  function ensure() {
    if (built) return;
    const style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', HTML);
    const stars = document.getElementById('anniv-stars');
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.opacity = String(0.3 + Math.random() * 0.7);
      stars.appendChild(s);
    }
    const confetti = document.getElementById('anniv-confetti');
    const colors = ['#e23d78', '#f0b429', '#7e57c2', '#26c6da', '#fff'];
    for (let i = 0; i < 28; i++) {
      const bit = document.createElement('i');
      bit.style.left = Math.random() * 100 + '%';
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = (Math.random() * 2.5) + 's';
      bit.style.animationDuration = (2.8 + Math.random() * 2) + 's';
      confetti.appendChild(bit);
    }
    bind();
    built = true;
  }

  function stopVoice() {
    speaking = false;
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    const pill = document.getElementById('anniv-voice');
    if (pill) pill.classList.remove('playing');
    const label = document.getElementById('anniv-voice-label');
    if (label) label.textContent = 'Hear Rakesh say it';
  }

  function showScene(name) {
    clearTimers();
    stopVoice();
    const box = root();
    box.querySelectorAll('.anniv-scene').forEach((scene) => {
      scene.classList.toggle('active', scene.getAttribute('data-scene') === name);
    });
    const room = document.getElementById('anniv-room');
    const index = SCENE_ORDER.indexOf(name);
    if (room) room.textContent = index >= 0 ? (index + 1) + ' / ' + SCENE_ORDER.length : '';
    if (name === 'roses') startRoses();
    if (name === 'tree') growTree();
    if (name === 'puzzle') renderPuzzle();
  }

  function resetExperience() {
    wishMade = false;
    cakeCut = false;
    const intro = root().querySelector('.scene-intro');
    intro.classList.remove('is-open');
    const halves = document.getElementById('cake-halves');
    halves.classList.remove('cut');
    halves.querySelectorAll('.half').forEach((h) => h.classList.remove('cut'));
    document.getElementById('cake-done').classList.remove('show');
    document.getElementById('cake-kicker').textContent = 'Cake time';
    document.getElementById('cake-title').textContent = 'Make the first cut';
    document.getElementById('cake-sub').textContent = 'Swipe down across the cake, top to bottom.';
    document.getElementById('wish-title').textContent = 'Close your eyes...';
    document.getElementById('wish-sub').textContent = 'Make a little wish for the days ahead.';
    document.getElementById('anniv-wish-btn').textContent = 'I made my wish ✦';
    document.getElementById('anniv-open-btn').textContent = '♡ Open your surprise';
    const flash = document.getElementById('anniv-flash');
    flash.classList.remove('on');
    knocks = 0;
    const door = document.getElementById('anniv-door');
    if (door) door.classList.remove('open', 'knock');
    const knockCount = document.getElementById('knock-count');
    if (knockCount) knockCount.textContent = 'Knock 0 of 3';
    const doorNext = document.getElementById('door-next');
    if (doorNext) doorNext.hidden = true;
    const roseStage = document.getElementById('rose-stage');
    if (roseStage) roseStage.classList.remove('gathered');
    const roseScene = root().querySelector('.scene-roses');
    if (roseScene) roseScene.classList.remove('show-caption');
    const tree = root().querySelector('.scene-tree');
    if (tree) tree.classList.remove('grown');
    puzzlePick = null;
    puzzleMoves = 0;
    puzzleSolved = false;
    puzzleOrder = shuffledPuzzle();
    const puzzleNext = document.getElementById('puzzle-next');
    if (puzzleNext) puzzleNext.hidden = true;
    const status = document.getElementById('puzzle-status');
    if (status) status.textContent = 'Moves 0';
    stopVoice();
    showScene('intro');
  }

  function heartPoints(count) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const t = (Math.PI * 2 * i) / count;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push({ x: 50 + x * 1.55, y: 48 - y * 1.7 });
    }
    return pts;
  }

  function startRoses() {
    const stage = document.getElementById('rose-stage');
    const scene = root().querySelector('.scene-roses');
    if (!stage || !scene) return;
    if (!stage.dataset.built) {
      const flowers = ['🌹', '🌸', '🌷', '💮'];
      heartPoints(34).forEach((point, i) => {
        const rose = document.createElement('span');
        rose.className = 'rose';
        rose.textContent = flowers[i % flowers.length];
        rose.style.left = (6 + Math.random() * 82) + '%';
        rose.style.top = (8 + Math.random() * 74) + '%';
        rose.style.setProperty('--x', point.x + '%');
        rose.style.setProperty('--y', point.y + '%');
        rose.style.transitionDelay = (i * 0.02) + 's';
        stage.appendChild(rose);
      });
      stage.dataset.built = '1';
    }
    stage.classList.remove('gathered');
    scene.classList.remove('show-caption');
    later(() => {
      stage.classList.add('gathered');
      scene.classList.add('show-caption');
    }, 80);
  }

  function growTree() {
    const scene = root().querySelector('.scene-tree');
    const leaves = document.getElementById('tree-leaves');
    if (!scene || !leaves) return;
    if (!leaves.dataset.built) {
      const spots = [
        [18, 18], [38, 6], [58, 14], [78, 28], [30, 36], [50, 24], [68, 40], [44, 48], [86, 18], [10, 40]
      ];
      const bits = ['💗', '💖', '🌸', '💛', '💕'];
      spots.forEach((spot, i) => {
        const leaf = document.createElement('span');
        leaf.textContent = bits[i % bits.length];
        leaf.style.left = spot[0] + '%';
        leaf.style.top = spot[1] + '%';
        leaf.style.transitionDelay = (0.5 + i * 0.08) + 's';
        leaves.appendChild(leaf);
      });
      leaves.dataset.built = '1';
    }
    scene.classList.remove('grown');
    later(() => scene.classList.add('grown'), 40);
  }

  function shuffledPuzzle() {
    const order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = order[i];
      order[i] = order[j];
      order[j] = swap;
    }
    const solved = order.every((piece, index) => piece === index);
    if (solved) return shuffledPuzzle();
    return order;
  }

  function renderPuzzle() {
    const board = document.getElementById('anniv-puzzle');
    if (!board) return;
    if (!puzzleOrder.length) puzzleOrder = shuffledPuzzle();
    board.innerHTML = '';
    puzzleOrder.forEach((piece, slot) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      const col = piece % 3;
      const row = Math.floor(piece / 3);
      tile.style.backgroundImage = 'url("' + PUZZLE_SRC + '")';
      tile.style.setProperty('--pos', (col * 50) + '% ' + (row * 50) + '%');
      tile.setAttribute('aria-label', 'Photo piece ' + (piece + 1));
      if (puzzlePick === slot) tile.classList.add('selected');
      tile.addEventListener('click', () => swapPuzzle(slot));
      board.appendChild(tile);
    });
  }

  function swapPuzzle(slot) {
    if (puzzleSolved) return;
    const wrap = document.getElementById('puzzle-wrap');
    if (wrap && wrap.dataset.peeked === '1') {
      wrap.dataset.peeked = '0';
      return;
    }
    if (puzzlePick == null) {
      puzzlePick = slot;
      renderPuzzle();
      return;
    }
    if (puzzlePick === slot) {
      puzzlePick = null;
      renderPuzzle();
      return;
    }
    const next = puzzleOrder.slice();
    const held = next[puzzlePick];
    next[puzzlePick] = next[slot];
    next[slot] = held;
    puzzleOrder = next;
    puzzlePick = null;
    puzzleMoves += 1;
    const status = document.getElementById('puzzle-status');
    if (status) status.textContent = 'Moves ' + puzzleMoves;
    puzzleSolved = puzzleOrder.every((piece, index) => piece === index);
    renderPuzzle();
    if (puzzleSolved) {
      if (status) status.textContent = 'It belongs together again.';
      const nextBtn = document.getElementById('puzzle-next');
      if (nextBtn) nextBtn.hidden = false;
      burstHearts();
    }
  }

  function knockDoor() {
    const door = document.getElementById('anniv-door');
    if (!door || door.classList.contains('open')) return;
    knocks = Math.min(3, knocks + 1);
    door.classList.remove('knock');
    void door.offsetWidth;
    door.classList.add('knock');
    const count = document.getElementById('knock-count');
    if (count) count.textContent = 'Knock ' + knocks + ' of 3';
    if (knocks >= 3) {
      door.classList.add('open');
      const next = document.getElementById('door-next');
      if (next) next.hidden = false;
    }
  }

  function hearLetter() {
    if (!window.speechSynthesis) return;
    if (speaking) {
      stopVoice();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(LETTER_SPOKEN);
    utterance.lang = 'en-IN';
    utterance.rate = 0.92;
    utterance.onend = stopVoice;
    utterance.onerror = stopVoice;
    speaking = true;
    const pill = document.getElementById('anniv-voice');
    if (pill) pill.classList.add('playing');
    const label = document.getElementById('anniv-voice-label');
    if (label) label.textContent = 'Playing… tap to stop';
    window.speechSynthesis.speak(utterance);
  }

  function playMusic() {
    if (typeof toggleRomanticMusic === 'function' && typeof isPlayingMusic !== 'undefined' && !isPlayingMusic) {
      toggleRomanticMusic();
    }
  }

  function openAnniversarySurprise() {
    if (typeof canAccessNov17Chapter2 === 'function' && !canAccessNov17Chapter2()) {
      if (typeof openNov17Chapter2 === 'function') {
        const locked = document.getElementById('nov17-locked-modal');
        if (locked) {
          locked.classList.remove('hidden');
          locked.classList.add('flex');
        }
      }
      return;
    }
    ensure();
    resetExperience();
    const box = root();
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    playMusic();
  }

  function closeAnniversarySurprise() {
    clearTimers();
    stopVoice();
    const box = root();
    if (!box) return;
    box.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function burstHearts() {
    const box = root();
    for (let i = 0; i < 14; i++) {
      const heart = document.createElement('div');
      heart.className = 'anniv-float-heart';
      heart.textContent = i % 3 === 0 ? '✨' : '💗';
      heart.style.left = (10 + Math.random() * 80) + '%';
      heart.style.bottom = '0';
      heart.style.fontSize = (14 + Math.random() * 16) + 'px';
      heart.style.animationDuration = (3 + Math.random() * 2) + 's';
      box.appendChild(heart);
      later(() => heart.remove(), 5200);
    }
  }

  function onOpen() {
    const intro = root().querySelector('.scene-intro');
    if (intro.classList.contains('is-open')) return;
    intro.classList.add('is-open');
    const btn = document.getElementById('anniv-open-btn');
    btn.textContent = 'Step inside ✦';
    later(() => {
      if (root().querySelector('.scene-intro.active')) showScene('lights');
    }, 2200);
  }

  function onLights() {
    const flash = document.getElementById('anniv-flash');
    flash.classList.remove('on');
    void flash.offsetWidth;
    flash.classList.add('on');
    later(() => {
      showScene('party');
      burstHearts();
    }, 420);
  }

  function finishCake() {
    if (cakeCut) return;
    cakeCut = true;
    const halves = document.getElementById('cake-halves');
    halves.classList.add('cut');
    halves.querySelector('.half.left').classList.add('cut');
    halves.querySelector('.half.right').classList.add('cut');
    document.getElementById('cake-kicker').textContent = 'Cake time';
    document.getElementById('cake-title').textContent = 'You did it!';
    document.getElementById('cake-sub').textContent = 'The first slice is always the sweetest one.';
    document.getElementById('cake-done').classList.add('show');
    burstHearts();
  }

  function onWish() {
    if (!wishMade) {
      wishMade = true;
      document.getElementById('wish-title').textContent = 'Your wish is on its way';
      document.getElementById('wish-sub').textContent = 'Somewhere, a tiny star just said yes.';
      document.getElementById('anniv-wish-btn').textContent = 'Keep going ✦';
      burstHearts();
      return;
    }
    showScene('love');
  }

  function bind() {
    root().querySelector('.anniv-close').addEventListener('click', closeAnniversarySurprise);
    document.getElementById('anniv-open-btn').addEventListener('click', () => {
      const intro = root().querySelector('.scene-intro');
      if (!intro.classList.contains('is-open')) onOpen();
      else showScene('lights');
    });
    document.getElementById('anniv-lights-btn').addEventListener('click', onLights);
    root().querySelectorAll('[data-go]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.getAttribute('data-go');
        showScene(next);
        if (next === 'finale' || next === 'party') burstHearts();
      });
    });
    document.getElementById('anniv-wish-btn').addEventListener('click', onWish);
    document.getElementById('anniv-replay').addEventListener('click', () => {
      resetExperience();
    });
    document.getElementById('anniv-chapter').addEventListener('click', () => {
      closeAnniversarySurprise();
      if (typeof openNov17StoryOnly === 'function') openNov17StoryOnly();
    });
    document.getElementById('anniv-knock').addEventListener('click', knockDoor);
    document.getElementById('anniv-voice').addEventListener('click', hearLetter);
    const wrap = document.getElementById('puzzle-wrap');
    wrap.addEventListener('pointerdown', (event) => {
      if (event.target === wrap) return;
      peekTimer = setTimeout(() => {
        wrap.classList.add('peek');
        wrap.dataset.peeked = '1';
      }, 420);
    });
    function endPeek() {
      if (peekTimer) clearTimeout(peekTimer);
      peekTimer = null;
      wrap.classList.remove('peek');
    }
    wrap.addEventListener('pointerup', endPeek);
    wrap.addEventListener('pointerleave', endPeek);
    wrap.addEventListener('pointercancel', endPeek);

    const cake = document.getElementById('anniv-cake');
    let startY = null;
    function down(e) {
      if (cakeCut) return;
      startY = e.clientY || (e.touches && e.touches[0].clientY);
    }
    function up(e) {
      if (startY == null || cakeCut) return;
      const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
      if (y - startY > 90) finishCake();
      startY = null;
    }
    cake.addEventListener('pointerdown', (e) => {
      cake.setPointerCapture(e.pointerId);
      down(e);
    });
    cake.addEventListener('pointerup', up);
    cake.addEventListener('pointercancel', () => { startY = null; });
  }

  document.addEventListener('keydown', (e) => {
    const box = root();
    if (e.key === 'Escape' && box && box.classList.contains('is-open')) closeAnniversarySurprise();
  });

  window.openAnniversarySurprise = openAnniversarySurprise;
  window.closeAnniversarySurprise = closeAnniversarySurprise;
})();
