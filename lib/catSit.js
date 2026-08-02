const { SPEED_MAP, COLOR_MAP, FONT_FAMILY, CHAR_WIDTH, escapeXml } = require('./style');

// Each row of the ASCII art is anchored to the same left x instead of being
// centered per-line: with monospace glyphs, centering rows of different
// lengths independently (text-anchor="middle" per <text>) throws off the
// column alignment between rows — e.g. the whiskers row ends up a
// half-character off from the eyes row above it. A shared left edge plus
// consistent leading spaces per row keeps every column lined up.
const ROWS = {
  head: '  /\\_/\\',
  eyesOpen: ' ( o.o )',
  eyesClosed: ' ( -.- )',
  whiskers: '  > ^ <',
  legs: ' /|   |\\',
  feet: '(_)   (_)',
};
const MAX_ROW_LEN = 9; // length of "(_)   (_)", the widest row

function buildCatSitSvg({ speed, colors }) {
  const speedCfg = SPEED_MAP[speed];
  const catColor = COLOR_MAP[colors];
  const glow = `drop-shadow(0 0 3px ${catColor})`;

  const width = 240;
  const height = 140;
  const lineHeight = 20;
  const startY = 20;
  const startX = Math.round((width - MAX_ROW_LEN * CHAR_WIDTH) / 2);

  const row = (text, y, id) =>
    `<text${id ? ` id="${id}"` : ''} x="${startX}" y="${y}" xml:space="preserve">${escapeXml(
      text
    )}</text>`;

  // Anchored right at the edge of the last foot glyph so the tail reads as
  // attached to the body instead of floating next to it.
  const tailBaseX = Math.round(startX + MAX_ROW_LEN * CHAR_WIDTH - 4);
  const tailBaseY = startY + 4 * lineHeight - 4;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    text {
      font-family: ${FONT_FAMILY};
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
    #tail {
      fill: none;
      stroke: ${catColor};
      stroke-width: 2.5;
      stroke-linecap: round;
      filter: ${glow};
      transform-box: view-box;
      transform-origin: ${tailBaseX}px ${tailBaseY}px;
      animation: wag ${speedCfg.sway} ease-in-out infinite;
    }
    @keyframes wag {
      0%, 100% { transform: rotate(-10deg); }
      50% { transform: rotate(8deg); }
    }
  </style>

  <path id="tail" d="M${tailBaseX},${tailBaseY} C ${tailBaseX + 16},${tailBaseY - 12} ${tailBaseX + 26},${tailBaseY - 32} ${tailBaseX + 16},${tailBaseY - 48}" />

  <g id="cat-group">
    ${row(ROWS.head, startY)}
    ${row(ROWS.eyesOpen, startY + lineHeight, 'eyes-open')}
    ${row(ROWS.eyesClosed, startY + lineHeight, 'eyes-closed')}
    ${row(ROWS.whiskers, startY + 2 * lineHeight)}
    ${row(ROWS.legs, startY + 3 * lineHeight)}
    ${row(ROWS.feet, startY + 4 * lineHeight)}
  </g>
</svg>`;
}

module.exports = { buildCatSitSvg };
