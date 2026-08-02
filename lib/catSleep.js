const { SPEED_MAP, COLOR_MAP, FONT_FAMILY, CHAR_WIDTH, escapeXml } = require('./style');

// Same shared-left-x grid trick as catSit.js: each row keeps its own
// hand-tuned leading spaces so columns line up despite differing lengths.
const ROWS = {
  head: '  /\\_/\\',
  face: ' ( -.- )',
  body: '  )   (',
  base: ' (__ __)',
};
const MAX_ROW_LEN = 8; // length of " ( -.- )" / " (__ __)"

function buildCatSleepSvg({ speed, colors }) {
  const speedCfg = SPEED_MAP[speed];
  const catColor = COLOR_MAP[colors];
  const glow = `drop-shadow(0 0 3px ${catColor})`;

  const width = 240;
  const height = 130;
  const lineHeight = 20;
  const startY = 40;
  const startX = Math.round((width - MAX_ROW_LEN * CHAR_WIDTH) / 2);

  const row = (text, y) =>
    `<text x="${startX}" y="${y}" xml:space="preserve">${escapeXml(text)}</text>`;

  const zBaseX = startX + MAX_ROW_LEN * CHAR_WIDTH - 10;
  const zBaseY = startY - lineHeight - 4;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    text {
      font-family: ${FONT_FAMILY};
      font-weight: bold;
      fill: ${catColor};
      filter: ${glow};
    }
    #cat-group {
      font-size: 16px;
      transform-box: fill-box;
      transform-origin: 50% 100%;
      animation: breathe ${speedCfg.sway} ease-in-out infinite;
    }
    @keyframes breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.015); }
    }
    .zzz {
      font-size: 12px;
      opacity: 0;
      animation: zfloat ${speedCfg.blink} ease-in infinite;
    }
    .zzz.z1 { animation-delay: 0s; }
    .zzz.z2 { animation-delay: calc(${speedCfg.blink} / 3); font-size: 15px; }
    .zzz.z3 { animation-delay: calc(${speedCfg.blink} / 3 * 2); font-size: 18px; }
    @keyframes zfloat {
      0% { opacity: 0; transform: translate(0, 0); }
      15% { opacity: 1; }
      80% { opacity: 1; }
      100% { opacity: 0; transform: translate(10px, -22px); }
    }
  </style>

  <text class="zzz z1" x="${zBaseX}" y="${zBaseY}">z</text>
  <text class="zzz z2" x="${zBaseX + 6}" y="${zBaseY - 8}">z</text>
  <text class="zzz z3" x="${zBaseX + 13}" y="${zBaseY - 18}">Z</text>

  <g id="cat-group">
    ${row(ROWS.head, startY)}
    ${row(ROWS.face, startY + lineHeight)}
    ${row(ROWS.body, startY + 2 * lineHeight)}
    ${row(ROWS.base, startY + 3 * lineHeight)}
  </g>
</svg>`;
}

module.exports = { buildCatSleepSvg };
