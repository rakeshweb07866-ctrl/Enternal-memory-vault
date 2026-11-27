# 🏗️ Memory Vault — Architecture Guide

## Project Structure (After Refactor)

```
D:\Memory-Vault\
├── server.js                        ← Entry point (thin, only setup + route registration)
│
├── server/                          ← Backend MVC Architecture
│   ├── routes/                      ← API Route Definitions
│   │   ├── auth.routes.js           ← POST /api/auth/login
│   │   ├── messages.routes.js       ← GET/POST /api/messages/*
│   │   ├── presence.routes.js       ← POST /api/presence/ping, /api/wishes/*
│   │   ├── admin.routes.js          ← All /api/admin/* endpoints
│   │   └── reel.routes.js           ← POST /api/upload-reel
│   │
│   ├── middleware/
│   │   └── auth.middleware.js       ← PIN validation, admin auth check
│   │
│   ├── utils/
│   │   ├── helpers.js               ← IST time formatter, device parser
│   │   ├── store.js                 ← Data persistence (messages, wishes, sessions)
│   │   └── presence.js             ← Online user tracking
│   │
│   └── socket.handler.js           ← All Socket.IO real-time event handlers
│
├── public/                          ← Frontend (served statically)
│   ├── index.html                   ← Main SPA (HTML structure only)
│   ├── admin.html                   ← Admin panel
│   │
│   ├── css/
│   │   └── styles.css               ← All custom styles
│   │
│   └── js/
│       ├── core/                    ← Core modules (loaded first)
│       │   ├── config.js            ← Firebase config, constants, auth helpers
│       │   └── app.js               ← App bootstrapper (session restore + init)
│       │
│       ├── features/                ← Feature modules (loaded after core)
│       │   ├── vault.js             ← Anniversary, Gallery, Coupons, Wishes, Reels
│       │   ├── jukebox.js           ← Music player (Jukebox)
│       │   ├── chat.js              ← Realtime chat (Firebase + Socket.IO)
│       │   ├── nov17.js             ← Nov 17 anniversary special feature
│       │   └── surprise.js          ← Surprise reveal feature
│       │
│       └── shared/                  ← Shared utilities
│           └── effects.js           ← Canvas hearts animation
│
├── data/                            ← Local JSON persistence (dev only)
│   ├── messages.json
│   ├── wishes.json
│   ├── login_sessions.json
│   └── security_pins.json
│
├── assests/                         ← Video files (reels, etc.)
├── package.json
└── vercel.json                      ← Vercel serverless config
```

---

## Adding a New Feature

### New Backend API Endpoint
1. Create `server/routes/my-feature.routes.js`
2. Register it in `server.js`: `app.use('/api/my-feature', require('./server/routes/my-feature.routes'))`
3. Add any new data helpers in `server/utils/store.js`

### New Frontend Feature
1. Create `public/js/features/my-feature.js`
2. Add `<script src="js/features/my-feature.js"></script>` in `index.html` (after vault.js)
3. Functions are globally accessible via `window.*`

---

## Key Architecture Decisions

| Decision | Reason |
|----------|--------|
| Vanilla JS (no bundler) | Simple Vercel deploy, no build step needed |
| Global functions via `window.*` | HTML `onclick=` handlers need global scope |
| Firebase RTDB | Cross-device real-time sync (Reels, Chat) |
| localStorage session | Login persistence across browser refresh |
| Socket.IO + REST fallback | Works even when WebSocket unavailable |

---

## Login Flow

```
User visits site
    ↓
config.js loads → reads localStorage (vault_session_pin, vault_session_name)
    ↓
app.js DOMContentLoaded:
    ├── Session found? → restore silently, show main app
    └── No session? → show login modal
```

---

## Deployment

- **Local Dev**: `node server.js` → runs on port 4000
- **Production**: Vercel serverless (see `vercel.json`)
- **Git Push**: NEVER `git push` without explicit user permission!
