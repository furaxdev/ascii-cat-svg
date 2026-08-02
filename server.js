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
function buildCatSvg({ speed, colors }) {
  const speedCfg = SPEED_MAP[speed];
  const catColor = COLOR_MAP[colors];
  const glow = `drop-shadow(0 0 3px ${catColor})`;

  const width = 220;
  const height = 130;
  const lineHeight = 20;
  const startY = 20;

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
  <style>
    text {
      font-family: 'Courier New', Courier, monospace;
      font-size: 16px;
      font-weight: bold;
      fill: ${catColor};
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
  </style>

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
</svg>`;
}

app.get('/cat', (req, res) => {
  const speed = sanitize(req.query.speed, ['slow', 'normal', 'fast'], 'normal');
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');

  const svg = buildCatSvg({ speed, colors });

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
