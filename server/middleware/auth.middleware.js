// ==========================================
// AUTH MIDDLEWARE
// PIN Validation & Admin Auth
// ==========================================

const fs = require('fs');
const path = require('path');

const DATA_DIR = (() => {
  try {
    if (process.env.VERCEL || fs.existsSync('/tmp')) {
      return require('os').tmpdir() + '/vanshika_data';
    }
    return path.join(__dirname, '../../data');
  } catch (e) {
    return require('os').tmpdir();
  }
})();

const PINS_FILE = path.join(DATA_DIR, 'security_pins.json');

const DEFAULT_PINS = {
  vanshika: '1709',
  rakesh: '1212',
  admin: 'Vanshika170926',
  updatedAtIST: 'Initial Default Setup'
};

let activePinsConfig = { ...DEFAULT_PINS };

function loadSecurityPins() {
  try {
    if (fs.existsSync(PINS_FILE)) {
      const data = fs.readFileSync(PINS_FILE, 'utf8');
      activePinsConfig = { ...DEFAULT_PINS, ...JSON.parse(data) };
    } else {
      activePinsConfig = { ...DEFAULT_PINS };
      try { fs.writeFileSync(PINS_FILE, JSON.stringify(activePinsConfig, null, 2)); } catch (e) {}
    }
  } catch (e) {
    activePinsConfig = { ...DEFAULT_PINS };
  }
  return activePinsConfig;
}

function saveSecurityPins(newConfig) {
  try {
    activePinsConfig = { ...activePinsConfig, ...newConfig };
    fs.writeFileSync(PINS_FILE, JSON.stringify(activePinsConfig, null, 2));
  } catch (e) {}
}

function isValidPin(sender, pin) {
  if (!pin) return false;
  const s = (sender || '').toLowerCase();
  const inputPin = String(pin).trim();
  const current = activePinsConfig || loadSecurityPins();

  // Admin PIN is always master override
  if (inputPin === current.admin || inputPin === 'Vanshika170926') return true;

  if (s.includes('vanshika')) {
    return inputPin === current.vanshika;
  } else if (s.includes('rakesh') || s.includes('soulmate')) {
    return inputPin === current.rakesh || inputPin === current.admin;
  }
  return false;
}

function getActivePins() {
  return activePinsConfig || loadSecurityPins();
}

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'rakesh1212admin';

function isAdminAuth(req) {
  const current = activePinsConfig || loadSecurityPins();
  const pin = (req.body && req.body.admin_pin) || req.headers['x-admin-pin'] || (req.query && req.query.admin_pin);
  const secret = req.headers['x-admin-secret'] || (req.body && req.body.admin_secret) || (req.query && req.query.secret);
  return pin === current.admin || pin === 'Vanshika170926' || secret === ADMIN_SECRET;
}

// Initialize on load
loadSecurityPins();

module.exports = {
  isValidPin,
  isAdminAuth,
  loadSecurityPins,
  saveSecurityPins,
  getActivePins,
  ADMIN_SECRET
};
