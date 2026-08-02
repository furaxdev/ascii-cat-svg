const crypto = require('crypto');
const { COLOR_MAP, FONT_FAMILY, escapeXml } = require('./style');
const gistStore = require('./gistStore');

const FILENAME = 'counter.json';
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000; // one visit per visitor per day

function hashVisitor(key) {
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 16);
}

// Keyed by `site` so anyone can embed /visits?key=their-own-key and get
// their own independent counter instead of sharing one global count.
async function incrementCount(siteKey, visitorKey) {
  const store = await gistStore.readJson(FILENAME, { sites: {} });
  const sites = store.sites || {};
  const site = sites[siteKey] || { count: 0, seen: {} };

  const now = Date.now();
  const visitorHash = hashVisitor(visitorKey);
  const lastSeen = site.seen[visitorHash];
  const isNewVisit = !lastSeen || now - lastSeen > DEDUP_WINDOW_MS;

  if (isNewVisit) {
    site.count += 1;
    site.seen[visitorHash] = now;
  }

  for (const [hash, ts] of Object.entries(site.seen)) {
    if (now - ts > DEDUP_WINDOW_MS) delete site.seen[hash];
  }

  sites[siteKey] = site;
  await gistStore.writeJson(FILENAME, { sites });

  return site.count;
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

module.exports = { incrementCount, buildVisitsSvg, isConfigured: gistStore.isConfigured };
