const { COLOR_MAP, FONT_FAMILY, escapeXml } = require('./style');

const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_FILENAME = 'counter.json';

async function incrementCount() {
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ascii-cat-svg',
  };

  const getRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers });
  if (!getRes.ok) throw new Error(`Gist fetch failed: ${getRes.status}`);
  const gist = await getRes.json();
  const content = JSON.parse(gist.files[GIST_FILENAME].content);
  const count = (content.count || 0) + 1;

  const patchRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: { [GIST_FILENAME]: { content: JSON.stringify({ count }) } },
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
