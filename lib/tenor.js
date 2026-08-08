const TENOR_API_KEY = process.env.TENOR_API_KEY;

function isConfigured() {
  return Boolean(TENOR_API_KEY);
}

async function fetchRandomGifUrl(query) {
  const params = new URLSearchParams({
    q: query,
    key: TENOR_API_KEY,
    client_key: 'ascii-cat-svg',
    limit: '25',
    media_filter: 'gif',
    contentfilter: 'medium',
  });
  const res = await fetch(`https://tenor.googleapis.com/v2/search?${params}`);
  if (!res.ok) throw new Error(`Tenor API failed: ${res.status}`);
  const json = await res.json();
  const results = json.results || [];
  if (results.length === 0) return null;
  const pick = results[Math.floor(Math.random() * results.length)];
  return pick.media_formats.gif.url;
}

module.exports = { fetchRandomGifUrl, isConfigured };
