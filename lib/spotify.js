const { COLOR_MAP, FONT_FAMILY, escapeXml } = require('./style');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'https://ascii-cat-svg.onrender.com/spotify/callback';
const SCOPE = 'user-read-currently-playing user-read-playback-state';

function isConfigured() {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
  });
  return `https://accounts.spotify.com/authorize?${params}`;
}

async function exchangeCodeForToken(code) {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  if (!res.ok) throw new Error(`Spotify token exchange failed: ${res.status}`);
  return res.json();
}

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });
  if (!res.ok) throw new Error(`Spotify refresh failed: ${res.status}`);
  const json = await res.json();
  return json.access_token;
}

async function fetchNowPlaying() {
  if (!REFRESH_TOKEN) throw new Error('SPOTIFY_REFRESH_TOKEN not set');
  const accessToken = await getAccessToken();
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 204) return null; // nothing playing
  if (!res.ok) throw new Error(`Spotify now-playing failed: ${res.status}`);
  const json = await res.json();
  if (!json.item) return null;
  return {
    title: json.item.name,
    artist: json.item.artists.map((a) => a.name).join(', '),
    isPlaying: json.is_playing,
  };
}

function buildSpotifySvg({ colors, track }) {
  const catColor = COLOR_MAP[colors];
  const glow = `drop-shadow(0 0 3px ${catColor})`;
  const label = track
    ? `\u{1F3A7} ${track.isPlaying ? 'listening to' : 'paused'}: ${track.title} — ${track.artist}`
    : '\u{1F3A7} not listening right now';

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

module.exports = {
  isConfigured,
  buildAuthUrl,
  exchangeCodeForToken,
  fetchNowPlaying,
  buildSpotifySvg,
  hasRefreshToken: () => Boolean(REFRESH_TOKEN),
};
