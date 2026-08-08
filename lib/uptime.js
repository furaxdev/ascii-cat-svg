const { buildTextBadgeSvg } = require('./style');

async function checkUptime(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    const ms = Date.now() - start;
    return { up: res.ok, status: res.status, ms };
  } catch {
    return { up: false, status: null, ms: null };
  }
}

function buildUptimeSvg({ colors, glow, result }) {
  const label = result.up
    ? `\u{1F7E2} up (${result.status}, ${result.ms}ms)`
    : `\u{1F534} down${result.status ? ` (${result.status})` : ''}`;
  return buildTextBadgeSvg({ colors, glow, label });
}

module.exports = { checkUptime, buildUptimeSvg };
