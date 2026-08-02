const express = require('express');
const { sanitize } = require('./lib/style');
const { buildCatSitSvg } = require('./lib/catSit');
const { buildCatSleepSvg } = require('./lib/catSleep');
const { buildQuoteSvg } = require('./lib/quote');
const { incrementCount, buildVisitsSvg, isConfigured } = require('./lib/visits');
const { buildClockSvg } = require('./lib/clock');
const { fetchLastCommit, buildLastCommitSvg } = require('./lib/githubActivity');
const { fetchDiscordPresence, buildDiscordSvg } = require('./lib/discord');
const spotify = require('./lib/spotify');
const { buildShowcaseHtml } = require('./lib/showcase');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

function readCatParams(req) {
  return {
    speed: sanitize(req.query.speed, ['slow', 'normal', 'fast'], 'normal'),
    colors: sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green'),
  };
}

function sendSvg(res, svg, cacheControl = 'no-cache, max-age=0') {
  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', cacheControl);
  res.send(svg);
}

app.get('/cat', (req, res) => {
  sendSvg(res, buildCatSitSvg(readCatParams(req)));
});

app.get('/cat/sleep', (req, res) => {
  sendSvg(res, buildCatSleepSvg(readCatParams(req)));
});

app.get('/quote', (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  sendSvg(res, buildQuoteSvg({ colors }));
});

app.get('/visits', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');

  if (!isConfigured()) {
    res.status(503);
    sendSvg(res, buildVisitsSvg({ colors, count: '?' }));
    return;
  }

  try {
    const visitorKey = `${req.ip}:${req.get('user-agent') || ''}`;
    const count = await incrementCount(visitorKey);
    // GitHub proxies README images through camo, which rotates source IPs on
    // every reload — that defeats IP-based dedup entirely. Caching the
    // response is what actually stops reload-spam: camo (and browsers) will
    // serve this cached copy instead of hitting the origin again.
    sendSvg(res, buildVisitsSvg({ colors, count }), 'public, max-age=3600');
  } catch (err) {
    console.error('visits counter error:', err.message);
    res.status(502);
    sendSvg(res, buildVisitsSvg({ colors, count: '?' }));
  }
});

app.get('/clock', (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const tz = req.query.tz || 'Europe/Paris';
  sendSvg(res, buildClockSvg({ colors, tz }), 'public, max-age=60');
});

app.get('/github/last-commit', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const username = req.query.username || 'furaxdev';

  try {
    const commit = await fetchLastCommit(username);
    sendSvg(res, buildLastCommitSvg({ colors, commit }), 'public, max-age=300');
  } catch (err) {
    console.error('last-commit error:', err.message);
    res.status(502);
    sendSvg(res, buildLastCommitSvg({ colors, commit: null }));
  }
});

app.get('/discord', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const userId = req.query.id;

  if (!userId) {
    res.status(400);
    sendSvg(res, buildDiscordSvg({ colors, presence: null }));
    return;
  }

  try {
    const presence = await fetchDiscordPresence(userId);
    sendSvg(res, buildDiscordSvg({ colors, presence }), 'public, max-age=30');
  } catch (err) {
    console.error('discord presence error:', err.message);
    res.status(502);
    sendSvg(res, buildDiscordSvg({ colors, presence: null }));
  }
});

app.get('/spotify', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');

  if (!spotify.isConfigured() || !spotify.hasRefreshToken()) {
    res.status(503);
    sendSvg(res, spotify.buildSpotifySvg({ colors, track: null }));
    return;
  }

  try {
    const track = await spotify.fetchNowPlaying();
    sendSvg(res, spotify.buildSpotifySvg({ colors, track }), 'public, max-age=30');
  } catch (err) {
    console.error('spotify now-playing error:', err.message);
    res.status(502);
    sendSvg(res, spotify.buildSpotifySvg({ colors, track: null }));
  }
});

app.get('/spotify/login', (req, res) => {
  if (!spotify.isConfigured()) {
    res.status(503).send('Spotify not configured (missing SPOTIFY_CLIENT_ID/SECRET)');
    return;
  }
  res.redirect(spotify.buildAuthUrl());
});

app.get('/spotify/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) {
    res.status(400).send(`Spotify auth error: ${error}`);
    return;
  }
  if (!code) {
    res.status(400).send('Missing code');
    return;
  }

  try {
    const tokens = await spotify.exchangeCodeForToken(code);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><body style="font-family:monospace;background:#0f0c29;color:#00ff88;padding:40px;">
      <h2>Spotify connected ✅</h2>
      <p>Copy this refresh token and send it back — it will be stored as a Render secret, not in the repo:</p>
      <textarea style="width:100%;height:80px;background:#1a1a2e;color:#00ff88;border:1px solid #00ff88;padding:10px;">${tokens.refresh_token}</textarea>
    </body></html>`);
  } catch (err) {
    res.status(502).send(`Token exchange failed: ${err.message}`);
  }
});

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(buildShowcaseHtml());
});

app.listen(PORT, () => {
  console.log(`ASCII cat SVG service running on port ${PORT}`);
});
