const { COLOR_MAP, FONT_FAMILY, escapeXml } = require('./style');

const STATUS_LABEL = {
  online: 'online',
  idle: 'away',
  dnd: 'do not disturb',
  offline: 'offline',
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
    status: STATUS_LABEL[discord_status] || discord_status,
    activity: activity ? activity.name : null,
    customStatus: customStatus ? customStatus.state : null,
  };
}

function buildDiscordSvg({ colors, presence }) {
  const catColor = COLOR_MAP[colors];
  const glow = `drop-shadow(0 0 3px ${catColor})`;

  let label;
  if (!presence) {
    label = '\u{1F3AE} discord: unavailable';
  } else if (presence.activity) {
    label = `\u{1F3AE} ${presence.status} — playing ${presence.activity}`;
  } else if (presence.customStatus) {
    label = `\u{1F3AE} ${presence.status} — ${presence.customStatus}`;
  } else {
    label = `\u{1F3AE} discord: ${presence.status}`;
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
