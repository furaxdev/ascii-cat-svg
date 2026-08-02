const { COLOR_MAP, FONT_FAMILY, escapeXml } = require('./style');
const gistStore = require('./gistStore');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'https://ascii-cat-svg.onrender.com/spotify/callback';
const SCOPE = 'user-read-currently-playing user-read-playback-state';
const TOKENS_FILENAME = 'spotify-tokens.json';

function isConfigured() {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

// `label` is a name each user picks for themselves (e.g. their GitHub
// username) so one shared Spotify app can serve any number of end users,
// each with their own stored refresh token — instead of being wired to a
// single hardcoded account.
function buildAuthUrl(label) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state: label,
  });
  return `https://accounts.spotify.com/authorize?${params}`;
}

async function exchangeCodeForToken(code, label) {
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
  const tokens = await res.json();

  const store = await gistStore.readJson(TOKENS_FILENAME, { users: {} });
  store.users = store.users || {};
  store.users[label] = tokens.refresh_token;
  await gistStore.writeJson(TOKENS_FILENAME, store);

  return tokens;
}

async function getAccessToken(label) {
  const store = await gistStore.readJson(TOKENS_FILENAME, { users: {} });
  const refreshToken = store.users && store.users[label];
  if (!refreshToken) throw new Error(`No Spotify connection for "${label}" yet`);

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`Spotify refresh failed: ${res.status}`);
  const json = await res.json();
  return json.access_token;
}

async function fetchNowPlaying(label) {
  const accessToken = await getAccessToken(label);
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
};
