const { COLOR_MAP, FONT_FAMILY, escapeXml, buildGlow } = require('./style');

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

async function fetchLastCommit(username) {
  const res = await fetch(`https://api.github.com/users/${username}/events/public`, {
    headers: { 'User-Agent': 'ascii-cat-svg', Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
  const events = await res.json();
  const push = events.find((e) => e.type === 'PushEvent');
  if (!push) return null;
  return { repo: push.repo.name.split('/')[1], when: timeAgo(push.created_at) };
}

function buildLastCommitSvg({ colors, commit, glow: glowEnabled = true }) {
  const catColor = COLOR_MAP[colors];
  const glow = buildGlow(catColor, glowEnabled);
  const label = commit
    ? `\u{1F4DD} last commit: ${commit.repo} (${commit.when})`
    : '\u{1F4DD} no recent activity';

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

module.exports = { fetchLastCommit, buildLastCommitSvg };
