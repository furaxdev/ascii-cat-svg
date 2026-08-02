const SPEED_MAP = {
  slow: { blink: '6s', sway: '4s' },
  normal: { blink: '3.5s', sway: '2.5s' },
  fast: { blink: '1.8s', sway: '1.2s' },
};

const COLOR_MAP = {
  green: '#00ff88',
  blue: '#39c5ff',
  purple: '#b388ff',
};

const FONT_FAMILY = "'Courier New', Courier, monospace";
const CHAR_WIDTH = 9.6; // approx advance width of bold 16px monospace

function sanitize(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildGlow(color, enabled) {
  return enabled ? `drop-shadow(0 0 3px ${color})` : 'none';
}

module.exports = { SPEED_MAP, COLOR_MAP, FONT_FAMILY, CHAR_WIDTH, sanitize, escapeXml, buildGlow };
