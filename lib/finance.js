const { buildTextBadgeSvg } = require('./style');

const COIN_NAMES = { btc: 'bitcoin', eth: 'ethereum', sol: 'solana', doge: 'dogecoin' };
const CACHE_TTL_MS = 90 * 1000;
const cryptoCache = new Map();

// Coinbase's public spot-price endpoint has a far more generous rate limit
// than CoinGecko's free tier (which started 429-ing us under normal load),
// so it's the primary source; CoinGecko is only a fallback if a coin isn't
// listed there. A short in-memory cache also cuts down repeat calls when
// several requests land within the same couple of minutes.
async function fetchFromCoinbase(symbol) {
  const res = await fetch(`https://api.coinbase.com/v2/prices/${symbol.toUpperCase()}-USD/spot`);
  if (!res.ok) return null;
  const json = await res.json();
  const price = json.data && parseFloat(json.data.amount);
  return Number.isFinite(price) ? price : null;
}

async function fetchFromCoingecko(id) {
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
  if (!res.ok) throw new Error(`Coingecko failed: ${res.status}`);
  const json = await res.json();
  const price = json[id] && json[id].usd;
  return price !== undefined ? price : null;
}

async function fetchCryptoPrice(coin) {
  const symbol = coin.toLowerCase();
  const id = COIN_NAMES[symbol] || symbol;

  const cached = cryptoCache.get(symbol);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.price !== null ? { id, price: cached.price } : null;
  }

  let price = await fetchFromCoinbase(symbol);
  if (price === null) {
    price = await fetchFromCoingecko(id);
  }

  cryptoCache.set(symbol, { price, at: Date.now() });
  return price !== null ? { id, price } : null;
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
