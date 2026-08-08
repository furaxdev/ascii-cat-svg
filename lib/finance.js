const { buildTextBadgeSvg } = require('./style');

const COIN_NAMES = { btc: 'bitcoin', eth: 'ethereum', sol: 'solana', doge: 'dogecoin' };

async function fetchCryptoPrice(coin) {
  const id = COIN_NAMES[coin.toLowerCase()] || coin.toLowerCase();
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
  if (!res.ok) throw new Error(`Coingecko failed: ${res.status}`);
  const json = await res.json();
  const price = json[id] && json[id].usd;
  return price !== undefined ? { id, price } : null;
}

async function fetchExchangeRate(from, to) {
  const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(from.toUpperCase())}`);
  if (!res.ok) throw new Error(`Exchange rate API failed: ${res.status}`);
  const json = await res.json();
  const rate = json.rates && json.rates[to.toUpperCase()];
  return rate !== undefined ? rate : null;
}

async function fetchNpmDownloads(pkg) {
  const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.downloads !== undefined ? json.downloads : null;
}

function buildCryptoSvg({ colors, glow, coin, data }) {
  const label = data
    ? `\u{1FA99} ${data.id}: $${data.price.toLocaleString('en-US')}`
    : `\u{1FA99} ${coin}: not found`;
  return buildTextBadgeSvg({ colors, glow, label });
}

function buildExchangeRateSvg({ colors, glow, from, to, rate }) {
  const label = rate !== null ? `\u{1F4B1} 1 ${from} = ${rate.toFixed(4)} ${to}` : `\u{1F4B1} rate not found`;
  return buildTextBadgeSvg({ colors, glow, label });
}

function buildNpmDownloadsSvg({ colors, glow, pkg, downloads }) {
  const label = downloads !== null
    ? `\u{1F4E6} ${pkg}: ${downloads.toLocaleString('en-US')}/week`
    : `\u{1F4E6} ${pkg}: not found`;
  return buildTextBadgeSvg({ colors, glow, label });
}

module.exports = {
  fetchCryptoPrice,
  fetchExchangeRate,
  fetchNpmDownloads,
  buildCryptoSvg,
  buildExchangeRateSvg,
  buildNpmDownloadsSvg,
};
