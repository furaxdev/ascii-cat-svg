const express = require('express');
const { sanitize } = require('./lib/style');
const { buildCatSitSvg } = require('./lib/catSit');
const { buildCatSleepSvg } = require('./lib/catSleep');
const { buildQuoteSvg } = require('./lib/quote');
const { incrementCount, buildVisitsSvg, isConfigured } = require('./lib/visits');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

function readCatParams(req) {
  return {
    speed: sanitize(req.query.speed, ['slow', 'normal', 'fast'], 'normal'),
    colors: sanitize(req.query.colors, ['green', 'blue', 'purple'], 'green'),
  };
}

function sendSvg(res, svg) {
  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'no-cache, max-age=0');
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
    sendSvg(res, buildVisitsSvg({ colors, count }));
  } catch (err) {
    console.error('visits counter error:', err.message);
    res.status(502);
    sendSvg(res, buildVisitsSvg({ colors, count: '?' }));
  }
});

app.get('/', (req, res) => {
  res.redirect('/cat');
});

app.listen(PORT, () => {
  console.log(`ASCII cat SVG service running on port ${PORT}`);
});
