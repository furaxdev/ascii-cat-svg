const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

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

const THEME_MAP = {
  dark: { from: '#0f0c29', via: '#302b63', to: '#24243e' },
  light: { from: '#dfe9f3', via: '#c9d6ff', to: '#e2d1f9' },
};

function sanitize(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// The blink swaps between two stacked <text> nodes faded in/out with CSS
// opacity keyframes, rather than mutating text content (unreliable across
// SVG renderers, and GitHub's image sanitizer strips <animate>/<set>).
function buildCatSvg({ theme, speed, colors }) {
  const speedCfg = SPEED_MAP[speed];
  const catColor = COLOR_MAP[colors];
  const bg = THEME_MAP[theme];
  const textColor = theme === 'light' ? '#1a1a2e' : catColor;
  const glow = theme === 'light' ? 'none' : `drop-shadow(0 0 3px ${catColor})`;

  const width = 260;
  const height = 180;
  const lineHeight = 20;
  const startY = 50;

  const topLine = ' /\\_/\\';
  const eyesOpen = '( o.o )';
  const eyesClosed = '( -.- )';
  const bodyLines = [' > ^ <', '/|   |\\', '(_)   (_)'];

  const bodyTspans = bodyLines
    .map((line, i) => {
      const y = startY + (i + 2) * lineHeight;
      return `<text x="50%" y="${y}" text-anchor="middle" xml:space="preserve">${escapeXml(
        line
      )}</text>`;
    })
    .join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg.from}" />
      <stop offset="50%" stop-color="${bg.via}" />
      <stop offset="100%" stop-color="${bg.to}" />
    </linearGradient>
    <style>
      text {
        font-family: 'Courier New', Courier, monospace;
        font-size: 16px;
        font-weight: bold;
        fill: ${textColor};
        filter: ${glow};
      }
      #cat-group {
        transform-box: fill-box;
        transform-origin: 50% 100%;
        animation: sway ${speedCfg.sway} ease-in-out infinite;
      }
      @keyframes sway {
        0%, 100% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
      }
      #eyes-open, #eyes-closed {
        animation: blink ${speedCfg.blink} linear infinite;
      }
      #eyes-open { animation-name: blink-open; }
      #eyes-closed { animation-name: blink-closed; }
      @keyframes blink-open {
        0%, 90%, 100% { opacity: 1; }
        92%, 98% { opacity: 0; }
      }
      @keyframes blink-closed {
        0%, 90%, 100% { opacity: 0; }
        92%, 98% { opacity: 1; }
      }
      #caption {
        font-size: 10px;
        font-weight: normal;
        fill: ${textColor};
        opacity: 0.7;
        filter: none;
      }
    </style>
  </defs>

  <rect width="100%" height="100%" fill="url(#bg-grad)" rx="12" ry="12" />

  <g id="cat-group">
    <text x="50%" y="${startY}" text-anchor="middle" xml:space="preserve">${escapeXml(
      topLine
    )}</text>
    <text id="eyes-open" x="50%" y="${startY + lineHeight}" text-anchor="middle" xml:space="preserve">${escapeXml(
      eyesOpen
    )}</text>
    <text id="eyes-closed" x="50%" y="${startY + lineHeight}" text-anchor="middle" xml:space="preserve">${escapeXml(
      eyesClosed
    )}</text>
    ${bodyTspans}
  </g>

  <text id="caption" x="50%" y="${height - 12}" text-anchor="middle">&gt;_ sitting cat.exe</text>
</svg>`;
}

app.get('/cat', (req, res) => {
  const theme = sanitize(req.query.theme, ['dark', 'light'], 'dark');
  const speed = sanitize(req.query.speed, ['slow', 'normal', 'fast'], 'normal');
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');

  const svg = buildCatSvg({ theme, speed, colors });

  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'no-cache, max-age=0');
  res.send(svg);
});

app.get('/', (req, res) => {
  res.redirect('/cat');
});

app.listen(PORT, () => {
  console.log(`ASCII cat SVG service running on port ${PORT}`);
});
