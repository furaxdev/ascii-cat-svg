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

// Shared single-line text badge used by most simple endpoints (weather,
// jokes, stats, ...) so each module doesn't repeat the same SVG boilerplate.
function buildTextBadgeSvg({ colors, glow: glowEnabled = true, label, fontSize = 13 }) {
  const color = COLOR_MAP[colors];
  const glow = buildGlow(color, glowEnabled);
  const charWidth = fontSize * 0.6;
  const paddingX = 14;
  const width = Math.round(label.length * charWidth + paddingX * 2);
  const height = 32;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    text {
      font-family: ${FONT_FAMILY};
      font-size: ${fontSize}px;
      font-weight: bold;
      fill: ${color};
      filter: ${glow};
    }
  </style>
  <text x="${paddingX}" y="${height / 2 + fontSize / 3}" xml:space="preserve">${escapeXml(
    label
  )}</text>
</svg>`;
}

module.exports = {
  SPEED_MAP,
  COLOR_MAP,
  FONT_FAMILY,
  CHAR_WIDTH,
  sanitize,
  escapeXml,
  buildGlow,
  buildTextBadgeSvg,
};
