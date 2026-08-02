const { COLOR_MAP, FONT_FAMILY, escapeXml, buildGlow } = require('./style');

const FACTS = [
  'Cats spend 70% of their life sleeping.',
  'A group of cats is called a clowder.',
  'Cats can rotate their ears 180 degrees.',
  "A cat's purr vibrates at a frequency that promotes healing.",
  'Cats have a third eyelid called a haw.',
  'A cat cannot taste sweetness.',
  'Cats walk like camels: front and back legs on one side, then the other.',
  'The oldest known pet cat existed 9,500 years ago.',
  'Cats have 32 muscles in each ear.',
  'A cat\'s nose print is as unique as a human fingerprint.',
  'Cats can jump up to six times their length.',
  'Adult cats meow mainly to communicate with humans, not other cats.',
];

function pickFact() {
  return FACTS[Math.floor(Math.random() * FACTS.length)];
}

function buildQuoteSvg({ colors, glow: glowEnabled = true }) {
  const catColor = COLOR_MAP[colors];
  const glow = buildGlow(catColor, glowEnabled);
  const fact = pickFact();

  const fontSize = 13;
  const charWidth = fontSize * 0.6;
  const paddingX = 14;
  const prefix = '(=^-^=) ';
  const fullText = prefix + fact;
  const width = Math.round(fullText.length * charWidth + paddingX * 2);
  const height = 40;

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
    fullText
  )}</text>
</svg>`;
}

module.exports = { buildQuoteSvg };
