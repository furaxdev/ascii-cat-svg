const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

function isConfigured() {
  return Boolean(GIPHY_API_KEY);
}

async function fetchRandomGifUrl(query) {
  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    q: query,
    limit: '25',
    rating: 'pg-13',
  });
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?${params}`);
  if (!res.ok) throw new Error(`Giphy API failed: ${res.status}`);
  const json = await res.json();
  const results = json.data || [];
  if (results.length === 0) return null;
  const pick = results[Math.floor(Math.random() * results.length)];
  return pick.images.original.url;
}

module.exports = { fetchRandomGifUrl, isConfigured };
