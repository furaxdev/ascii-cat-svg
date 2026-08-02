const crypto = require('crypto');
const { COLOR_MAP, FONT_FAMILY, escapeXml } = require('./style');

const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_FILENAME = 'counter.json';
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000; // one visit per visitor per day

function hashVisitor(key) {
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 16);
}

async function incrementCount(visitorKey) {
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ascii-cat-svg',
  };

  const getRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers });
  if (!getRes.ok) throw new Error(`Gist fetch failed: ${getRes.status}`);
  const gist = await getRes.json();
  const content = JSON.parse(gist.files[GIST_FILENAME].content);
  let count = content.count || 0;
  const seen = content.seen || {};

  const now = Date.now();
  const visitorHash = hashVisitor(visitorKey);
  const lastSeen = seen[visitorHash];
  const isNewVisit = !lastSeen || now - lastSeen > DEDUP_WINDOW_MS;

  if (isNewVisit) {
    count += 1;
    seen[visitorHash] = now;
  }

  // drop stale entries so the gist doesn't grow forever
  for (const [hash, ts] of Object.entries(seen)) {
    if (now - ts > DEDUP_WINDOW_MS) delete seen[hash];
  }

  const patchRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: { [GIST_FILENAME]: { content: JSON.stringify({ count, seen }) } },
    }),
  });
  if (!patchRes.ok) throw new Error(`Gist update failed: ${patchRes.status}`);

  return count;
}

function buildVisitsSvg({ colors, count }) {
  const catColor = COLOR_MAP[colors];
  const glow = `drop-shadow(0 0 3px ${catColor})`;
  const label = `\u{1F43E} views: ${count}`;

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

module.exports = { incrementCount, buildVisitsSvg, isConfigured: () => Boolean(GIST_ID && GITHUB_TOKEN) };
