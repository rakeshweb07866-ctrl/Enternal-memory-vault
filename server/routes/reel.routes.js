// ==========================================
// REEL UPLOAD ROUTE
// POST /api/upload-reel
// ==========================================

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// POST /api/upload-reel
router.post('/', express.raw({ type: '*/*', limit: '200mb' }), (req, res) => {
  try {
    if (!req.body || !req.body.length) {
      return res.status(400).json({ success: false, error: 'Empty video payload' });
    }
    const rawName = (req.query.name || req.headers['x-reel-name'] || 'vanshika-reel.mp4').toString();
    const safeName = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetFilename = safeName.endsWith('.mp4') ? safeName : `${safeName}.mp4`;

    const targetDir = path.join(__dirname, '../../assests');
    const publicTargetDir = path.join(__dirname, '../../public/assests');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    if (!fs.existsSync(publicTargetDir)) fs.mkdirSync(publicTargetDir, { recursive: true });

    fs.writeFileSync(path.join(targetDir, targetFilename), req.body);
    fs.writeFileSync(path.join(publicTargetDir, targetFilename), req.body);

    if (targetFilename.includes('reel-1') || targetFilename === 'vanshika-reel.mp4') {
      try {
        fs.writeFileSync(path.join(targetDir, 'vanshika-reel.mp4'), req.body);
        fs.writeFileSync(path.join(publicTargetDir, 'vanshika-reel.mp4'), req.body);
      } catch (e) {}
    }

    return res.json({ success: true, url: `assests/${targetFilename}`, filename: targetFilename });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
