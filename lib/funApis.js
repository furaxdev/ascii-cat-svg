const { buildTextBadgeSvg } = require('./style');

async function fetchJoke() {
  const res = await fetch('https://icanhazdadjoke.com', {
    headers: { Accept: 'application/json', 'User-Agent': 'ascii-cat-svg (https://ascii-cat-svg.onrender.com)' },
  });
  if (!res.ok) throw new Error(`Joke API failed: ${res.status}`);
  const json = await res.json();
  return json.joke;
}

async function fetchAdvice() {
  const res = await fetch('https://api.adviceslip.com/advice');
  if (!res.ok) throw new Error(`Advice API failed: ${res.status}`);
  const json = await res.json();
  return json.slip.advice;
}

async function fetchQuote() {
  const res = await fetch('https://zenquotes.io/api/random');
  if (!res.ok) throw new Error(`Quote API failed: ${res.status}`);
  const json = await res.json();
  const entry = json[0];
  return `${entry.q} — ${entry.a}`;
}

function buildJokeSvg({ colors, glow, joke }) {
  const label = joke ? `\u{1F602} ${joke}` : '\u{1F602} could not fetch a joke';
  return buildTextBadgeSvg({ colors, glow, label, fontSize: 13 });
}

function buildAdviceSvg({ colors, glow, advice }) {
  const label = advice ? `\u{1F4A1} ${advice}` : '\u{1F4A1} could not fetch advice';
  return buildTextBadgeSvg({ colors, glow, label, fontSize: 13 });
}

function buildQuoteBadgeSvg({ colors, glow, quote }) {
  const label = quote ? `\u{1F4AC} ${quote}` : '\u{1F4AC} could not fetch a quote';
  return buildTextBadgeSvg({ colors, glow, label, fontSize: 13 });
}

module.exports = {
  fetchJoke,
  fetchAdvice,
  fetchQuote,
  buildJokeSvg,
  buildAdviceSvg,
  buildQuoteBadgeSvg,
};
