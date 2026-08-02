const { COLOR_MAP, FONT_FAMILY, escapeXml, buildGlow } = require('./style');

// Real Discord status colors, matching their own badge dots.
const STATUS_COLOR = {
  online: '#43b581',
  idle: '#faa61a',
  dnd: '#f04747',
  offline: '#747f8d',
};

async function fetchDiscordPresence(userId) {
  const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
  if (!res.ok) throw new Error(`Lanyard API failed: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error('Lanyard: user not found (did they join discord.gg/lanyard?)');

  const { discord_status, activities } = json.data;
  const activity = activities.find((a) => a.type !== 4); // skip custom status, prefer game/app
  const customStatus = activities.find((a) => a.type === 4);

  return {
    status: discord_status,
    activity: activity ? activity.name : null,
    customStatus: customStatus ? customStatus.state : null,
  };
}

// Vector badge instead of an emoji glyph — emoji rendering varies wildly
// across platforms/fonts, but a plain SVG shape looks identical everywhere
// and matches Discord's own status dot design.
function buildStatusIcon(status, cx, cy) {
  const r = 6;
  const color = STATUS_COLOR[status] || STATUS_COLOR.offline;

  if (status === 'idle') {
    // crescent: a circle with a smaller offset circle cut out via mask
    return `
      <mask id="idle-mask">
        <rect x="${cx - r - 1}" y="${cy - r - 1}" width="${2 * r + 2}" height="${2 * r + 2}" fill="white" />
        <circle cx="${cx + 2}" cy="${cy - 2}" r="${r - 1.5}" fill="black" />
      </mask>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" mask="url(#idle-mask)" />`;
  }

  if (status === 'dnd') {
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />
      <rect x="${cx - r + 2}" y="${cy - 1.5}" width="${2 * r - 4}" height="3" rx="1.5" fill="#1a1a2e" />`;
  }

  if (status === 'offline') {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="2.5" />`;
  }

  // online (or unknown fallback): solid dot
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`;
}

function buildDiscordSvg({ colors, presence, glow: glowEnabled = true }) {
  const catColor = COLOR_MAP[colors];
  const glow = buildGlow(catColor, glowEnabled);

  const label = !presence
    ? 'discord unavailable'
    : presence.activity
    ? `playing ${presence.activity}`
    : presence.customStatus || 'discord';

  const fontSize = 13;
  const charWidth = fontSize * 0.6;
  const iconAreaWidth = 26;
  const paddingX = 14;
  const width = Math.round(label.length * charWidth + paddingX + iconAreaWidth + 10);
  const height = 32;
  const iconCx = paddingX + 6;
  const iconCy = height / 2;

  const icon = presence ? buildStatusIcon(presence.status, iconCx, iconCy) : '';

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
  ${icon}
  <text x="${paddingX + iconAreaWidth}" y="${height / 2 + fontSize / 3}" xml:space="preserve">${escapeXml(
    label
  )}</text>
</svg>`;
}

module.exports = { fetchDiscordPresence, buildDiscordSvg };
