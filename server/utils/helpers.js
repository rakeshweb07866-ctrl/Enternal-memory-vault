// ==========================================
// SERVER UTILITY HELPERS
// IST Time, Device Parser, etc.
// ==========================================

/**
 * Format time in Indian Standard Time (IST)
 */
function getISTTimeString() {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format date in Indian Standard Time (IST)
 */
function getISTDateString() {
  return new Date().toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Parse device details from User-Agent string
 */
function parseDeviceDetails(uaString, clientDevice = {}) {
  const ua = uaString || '';
  let deviceType = 'desktop';
  let deviceName = 'Windows PC';
  let os = 'Windows';
  let browser = 'Chrome';

  // 1. Detect OS
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) {
    const v = ua.match(/Android\s+([\d.]+)/i);
    os = v ? `Android ${v[1]}` : 'Android';
    deviceType = 'mobile';
  } else if (/iPhone/i.test(ua)) {
    const v = ua.match(/OS\s+([\d_]+)/i);
    os = v ? `iOS ${v[1].replace(/_/g, '.')}` : 'iOS';
    deviceType = 'mobile';
  } else if (/iPad/i.test(ua)) {
    const v = ua.match(/OS\s+([\d_]+)/i);
    os = v ? `iPadOS ${v[1].replace(/_/g, '.')}` : 'iPadOS';
    deviceType = 'tablet';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // 2. Detect Browser
  if (/Edg\/([\d.]+)/i.test(ua)) {
    browser = `Edge ${ua.match(/Edg\/([\d.]+)/i)[1].split('.')[0]}`;
  } else if (/SamsungBrowser\/([\d.]+)/i.test(ua)) {
    browser = `Samsung Internet ${ua.match(/SamsungBrowser\/([\d.]+)/i)[1].split('.')[0]}`;
  } else if (/OPR\/([\d.]+)/i.test(ua)) {
    browser = 'Opera';
  } else if (/Chrome\/([\d.]+)/i.test(ua)) {
    browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/i)[1].split('.')[0]}`;
  } else if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox\/([\d.]+)/i.test(ua)) {
    browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/i)[1].split('.')[0]}`;
  }

  // 3. Detect Device Model
  if (/iPhone/i.test(ua)) {
    deviceType = 'mobile';
    deviceName = 'Apple iPhone';
  } else if (/iPad/i.test(ua)) {
    deviceType = 'tablet';
    deviceName = 'Apple iPad';
  } else if (/Android/i.test(ua)) {
    deviceType = 'mobile';
    const modelMatch = ua.match(/;\s*([^;]+?)\s*(?:Build\/|\))/i);
    if (modelMatch && modelMatch[1]) {
      let rawModel = modelMatch[1].trim();
      rawModel = rawModel.replace(/^Linux;\s*/i, '').replace(/^wv;\s*/i, '');
      if (rawModel.length > 2 && rawModel.length < 35 && !rawModel.includes('Android')) {
        deviceName = rawModel;
      } else {
        deviceName = 'Android Phone';
      }
    } else {
      deviceName = 'Android Phone';
    }
  } else if (/Windows/i.test(ua)) {
    deviceType = 'desktop';
    deviceName = 'Windows PC / Laptop';
  } else if (/Macintosh/i.test(ua)) {
    deviceType = 'desktop';
    deviceName = 'MacBook / Mac';
  }

  return { deviceType, deviceName, os, browser };
}

module.exports = { getISTTimeString, getISTDateString, parseDeviceDetails };
