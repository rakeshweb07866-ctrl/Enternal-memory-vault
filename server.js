// ==========================================
// MEMORY VAULT — SERVER ENTRY POINT
// Express app setup + route registration
// ==========================================
//
// Architecture:
//   server/
//     routes/           → API route handlers
//       auth.routes.js         (/api/auth/*)
//       messages.routes.js     (/api/messages/*)
//       presence.routes.js     (/api/presence/* & /api/wishes/*)
//       admin.routes.js        (/api/admin/*)
//       reel.routes.js         (/api/upload-reel)
//     middleware/
//       auth.middleware.js     (PIN validation, admin auth)
//     utils/
//       helpers.js             (IST time, device parser)
//       store.js               (data persistence layer)
//       presence.js            (online user tracking)
//     socket.handler.js        (Socket.IO events)
//
// ==========================================

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// ---- Socket.IO Setup ----
let io = null;
try {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });
} catch (e) {}

const PORT = process.env.PORT || 4000;

// ---- Core Middleware ----
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Make io available to route handlers via req.app.get('io')
app.set('io', io);

// ---- Socket.IO Event Handlers ----
if (io) {
  const { initSocketHandlers } = require('./server/socket.handler');
  initSocketHandlers(io);
}

// ---- API Routes ----
app.use('/api/auth', require('./server/routes/auth.routes'));
app.use('/api/messages', require('./server/routes/messages.routes'));
app.use('/api/presence', require('./server/routes/presence.routes'));
app.use('/api/wishes', require('./server/routes/presence.routes'));
app.use('/api/admin', require('./server/routes/admin.routes'));
app.use('/api/upload-reel', require('./server/routes/reel.routes'));

// ---- Admin Panel HTML ----
app.get('/admin', (req, res) => {
  const publicAdmin = path.join(__dirname, 'public', 'admin.html');
  const fs = require('fs');
  if (fs.existsSync(publicAdmin)) return res.sendFile(publicAdmin);
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ---- Catch-all: Serve SPA ----
app.get('*', (req, res) => {
  const fs = require('fs');
  const publicIndex = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(publicIndex)) return res.sendFile(publicIndex);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- Start Server (local only, not Vercel) ----
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`🚀 Memory Vault Server running on http://localhost:${PORT}`);
    console.log(`📁 Architecture: MVC with server/routes/, server/utils/, server/middleware/`);
  });
}

module.exports = app;
