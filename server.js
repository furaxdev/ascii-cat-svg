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
const { startKeepAlive } = require('./keep_alive');
const { fetchWeather, buildWeatherSvg } = require('./lib/weather');
const { fetchRepoStats, fetchFollowers, buildRepoStatsSvg, buildFollowersSvg } = require('./lib/githubRepo');
const { fetchJoke, fetchAdvice, fetchQuote, buildJokeSvg, buildAdviceSvg, buildQuoteBadgeSvg } = require('./lib/funApis');
const {
  fetchCryptoPrice,
  fetchExchangeRate,
  fetchNpmDownloads,
  buildCryptoSvg,
  buildExchangeRateSvg,
  buildNpmDownloadsSvg,
} = require('./lib/finance');
const { buildCountdownSvg, buildAgeSvg, buildMoonPhaseSvg } = require('./lib/timeCalc');
const { checkUptime, buildUptimeSvg } = require('./lib/uptime');
const { buildQrSvg } = require('./lib/qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

function readGlow(req) {
  return req.query.glow !== 'off';
}

function readCatParams(req) {
  return {
    speed: sanitize(req.query.speed, ['slow', 'normal', 'fast'], 'normal'),
    colors: sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green'),
    glow: readGlow(req),
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
  sendSvg(res, buildQuoteSvg({ colors, glow: readGlow(req) }));
});

app.get('/visits', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  // Required so different people embedding /visits each get their own
  // independent counter instead of sharing one global count.
  const siteKey = req.query.key;

  if (!isConfigured() || !siteKey) {
    res.status(siteKey ? 503 : 400);
    sendSvg(res, buildVisitsSvg({ colors, count: '?', glow }));
    return;
  }

  try {
    const visitorKey = `${req.ip}:${req.get('user-agent') || ''}`;
    const count = await incrementCount(siteKey, visitorKey);
    // GitHub proxies README images through camo, which rotates source IPs on
    // every reload — that defeats IP-based dedup entirely. Caching the
    // response is what actually stops reload-spam: camo (and browsers) will
    // serve this cached copy instead of hitting the origin again.
    sendSvg(res, buildVisitsSvg({ colors, count, glow }), 'public, max-age=3600');
  } catch (err) {
    console.error('visits counter error:', err.message);
    res.status(502);
    sendSvg(res, buildVisitsSvg({ colors, count: '?', glow }));
  }
});

app.get('/clock', (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const tz = req.query.tz || 'Europe/Paris';
  sendSvg(res, buildClockSvg({ colors, tz, glow: readGlow(req) }), 'public, max-age=60');
});

app.get('/github/last-commit', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const username = req.query.username || 'furaxdev';

  try {
    const commit = await fetchLastCommit(username);
    sendSvg(res, buildLastCommitSvg({ colors, commit, glow }), 'public, max-age=300');
  } catch (err) {
    console.error('last-commit error:', err.message);
    res.status(502);
    sendSvg(res, buildLastCommitSvg({ colors, commit: null, glow }));
  }
});

app.get('/discord', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const userId = req.query.id;

  if (!userId) {
    res.status(400);
    sendSvg(res, buildDiscordSvg({ colors, presence: null, glow }));
    return;
  }

  try {
    const presence = await fetchDiscordPresence(userId);
    sendSvg(res, buildDiscordSvg({ colors, presence, glow }), 'public, max-age=30');
  } catch (err) {
    console.error('discord presence error:', err.message);
    res.status(502);
    sendSvg(res, buildDiscordSvg({ colors, presence: null, glow }));
  }
});

app.get('/spotify', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const label = req.query.user;

  if (!spotify.isConfigured() || !label) {
    res.status(label ? 503 : 400);
    sendSvg(res, spotify.buildSpotifySvg({ colors, track: null }));
    return;
  }

  try {
    const track = await spotify.fetchNowPlaying(label);
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
  const label = req.query.user;
  if (!label) {
    res.status(400).send('Add ?user=<a name for yourself> to the URL, e.g. /spotify/login?user=yourname');
    return;
  }
  res.redirect(spotify.buildAuthUrl(label));
});

app.get('/spotify/callback', async (req, res) => {
  const { code, error, state } = req.query;
  if (error) {
    res.status(400).send(`Spotify auth error: ${error}`);
    return;
  }
  if (!code || !state) {
    res.status(400).send('Missing code or state');
    return;
  }

  try {
    await spotify.exchangeCodeForToken(code, state);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><body style="font-family:monospace;background:#0f0c29;color:#00ff88;padding:40px;">
      <h2>Spotify connected ✅</h2>
      <p>You're all set, <b>${state}</b>. Use this badge in your README:</p>
      <pre style="background:#1a1a2e;padding:10px;border:1px solid #00ff88;">![Spotify](https://ascii-cat-svg.onrender.com/spotify?user=${encodeURIComponent(state)})</pre>
    </body></html>`);
  } catch (err) {
    res.status(502).send(`Token exchange failed: ${err.message}`);
  }
});

app.get('/weather', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const city = req.query.city;
  if (!city) {
    res.status(400);
    sendSvg(res, buildWeatherSvg({ colors, glow, weather: null }));
    return;
  }
  try {
    const weather = await fetchWeather(city);
    sendSvg(res, buildWeatherSvg({ colors, glow, weather }), 'public, max-age=900');
  } catch (err) {
    console.error('weather error:', err.message);
    res.status(502);
    sendSvg(res, buildWeatherSvg({ colors, glow, weather: null }));
  }
});

app.get('/github/repo', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const owner = req.query.owner;
  const repo = req.query.repo;
  if (!owner || !repo) {
    res.status(400);
    sendSvg(res, buildRepoStatsSvg({ colors, glow, stats: null, repoName: '' }));
    return;
  }
  try {
    const stats = await fetchRepoStats(owner, repo);
    sendSvg(res, buildRepoStatsSvg({ colors, glow, stats, repoName: repo }), 'public, max-age=600');
  } catch (err) {
    console.error('repo stats error:', err.message);
    res.status(502);
    sendSvg(res, buildRepoStatsSvg({ colors, glow, stats: null, repoName: repo }));
  }
});

app.get('/github/followers', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const username = req.query.username;
  if (!username) {
    res.status(400);
    sendSvg(res, buildFollowersSvg({ colors, glow, stats: null, username: '' }));
    return;
  }
  try {
    const stats = await fetchFollowers(username);
    sendSvg(res, buildFollowersSvg({ colors, glow, stats, username }), 'public, max-age=600');
  } catch (err) {
    console.error('followers error:', err.message);
    res.status(502);
    sendSvg(res, buildFollowersSvg({ colors, glow, stats: null, username }));
  }
});

app.get('/joke', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  try {
    const joke = await fetchJoke();
    sendSvg(res, buildJokeSvg({ colors, glow, joke }));
  } catch (err) {
    console.error('joke error:', err.message);
    res.status(502);
    sendSvg(res, buildJokeSvg({ colors, glow, joke: null }));
  }
});

app.get('/advice', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  try {
    const advice = await fetchAdvice();
    sendSvg(res, buildAdviceSvg({ colors, glow, advice }));
  } catch (err) {
    console.error('advice error:', err.message);
    res.status(502);
    sendSvg(res, buildAdviceSvg({ colors, glow, advice: null }));
  }
});

app.get('/quote/general', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  try {
    const quote = await fetchQuote();
    sendSvg(res, buildQuoteBadgeSvg({ colors, glow, quote }));
  } catch (err) {
    console.error('quote error:', err.message);
    res.status(502);
    sendSvg(res, buildQuoteBadgeSvg({ colors, glow, quote: null }));
  }
});

app.get('/crypto', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const coin = req.query.coin || 'btc';
  try {
    const data = await fetchCryptoPrice(coin);
    sendSvg(res, buildCryptoSvg({ colors, glow, coin, data }), 'public, max-age=120');
  } catch (err) {
    console.error('crypto error:', err.message);
    res.status(502);
    sendSvg(res, buildCryptoSvg({ colors, glow, coin, data: null }));
  }
});

app.get('/exchange-rate', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const from = req.query.from || 'USD';
  const to = req.query.to || 'EUR';
  try {
    const rate = await fetchExchangeRate(from, to);
    sendSvg(res, buildExchangeRateSvg({ colors, glow, from, to, rate }), 'public, max-age=3600');
  } catch (err) {
    console.error('exchange rate error:', err.message);
    res.status(502);
    sendSvg(res, buildExchangeRateSvg({ colors, glow, from, to, rate: null }));
  }
});

app.get('/npm', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const pkg = req.query.package;
  if (!pkg) {
    res.status(400);
    sendSvg(res, buildNpmDownloadsSvg({ colors, glow, pkg: '', downloads: null }));
    return;
  }
  try {
    const downloads = await fetchNpmDownloads(pkg);
    sendSvg(res, buildNpmDownloadsSvg({ colors, glow, pkg, downloads }), 'public, max-age=3600');
  } catch (err) {
    console.error('npm downloads error:', err.message);
    res.status(502);
    sendSvg(res, buildNpmDownloadsSvg({ colors, glow, pkg, downloads: null }));
  }
});

app.get('/countdown', (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const targetDate = req.query.date;
  const label = req.query.label;
  sendSvg(res, buildCountdownSvg({ colors, glow, targetDate, label }), 'public, max-age=3600');
});

app.get('/age', (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const birthDate = req.query.birthdate;
  const label = req.query.label;
  sendSvg(res, buildAgeSvg({ colors, glow, birthDate, label }), 'public, max-age=3600');
});

app.get('/moon', (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  sendSvg(res, buildMoonPhaseSvg({ colors, glow }), 'public, max-age=3600');
});

app.get('/uptime', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const glow = readGlow(req);
  const url = req.query.url;
  if (!url) {
    res.status(400);
    sendSvg(res, buildUptimeSvg({ colors, glow, result: { up: false, status: null, ms: null } }));
    return;
  }
  const result = await checkUptime(url);
  sendSvg(res, buildUptimeSvg({ colors, glow, result }), 'public, max-age=60');
});

app.get('/qr', async (req, res) => {
  const colors = sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green');
  const text = req.query.text;
  if (!text) {
    res.status(400).send('Add ?text=<content to encode>');
    return;
  }
  try {
    const svg = await buildQrSvg({ colors, text });
    sendSvg(res, svg, 'public, max-age=3600');
  } catch (err) {
    console.error('qr error:', err.message);
    res.status(502).send('Failed to generate QR code');
  }
});

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(buildShowcaseHtml());
});

app.listen(PORT, () => {
  console.log(`ASCII cat SVG service running on port ${PORT}`);
  startKeepAlive();
});
