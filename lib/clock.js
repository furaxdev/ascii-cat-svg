const { COLOR_MAP, FONT_FAMILY, escapeXml } = require('./style');

function buildClockSvg({ colors, tz }) {
  const catColor = COLOR_MAP[colors];
  const glow = `drop-shadow(0 0 3px ${catColor})`;

  let timeStr;
  try {
    timeStr = new Intl.DateTimeFormat('fr-FR', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    timeStr = 'invalid tz';
  }

  const label = `\u{1F550} ${tz}: ${timeStr}`;
  const fontSize = 14;
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
      fill: ${catColor};
      filter: ${glow};
    }
  </style>
  <text x="${paddingX}" y="${height / 2 + fontSize / 3}" xml:space="preserve">${escapeXml(
    label
  )}</text>
</svg>`;
}

module.exports = { buildClockSvg };
