const { COLOR_MAP, FONT_FAMILY, escapeXml, buildGlow } = require('./style');

// Matches Discord's own status colors/icons instead of a plain text label.
const STATUS_ICON = {
  online: '\u{1F7E2}', // green circle
  idle: '\u{1F319}', // crescent moon
  dnd: '\u{26D4}', // no entry
  offline: '\u{26AA}', // white circle
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
    statusIcon: STATUS_ICON[discord_status] || '❓',
    activity: activity ? activity.name : null,
    customStatus: customStatus ? customStatus.state : null,
  };
}

function buildDiscordSvg({ colors, presence, glow: glowEnabled = true }) {
  const catColor = COLOR_MAP[colors];
  const glow = buildGlow(catColor, glowEnabled);

  let label;
  if (!presence) {
    label = '\u{2753} discord unavailable';
  } else if (presence.activity) {
    label = `${presence.statusIcon} playing ${presence.activity}`;
  } else if (presence.customStatus) {
    label = `${presence.statusIcon} ${presence.customStatus}`;
  } else {
    label = `${presence.statusIcon} discord`;
  }

  const fontSize = 13;
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

module.exports = { fetchDiscordPresence, buildDiscordSvg };
