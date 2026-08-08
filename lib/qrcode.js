const QRCode = require('qrcode');
const { COLOR_MAP } = require('./style');

async function buildQrSvg({ colors, text }) {
  const color = COLOR_MAP[colors];
  const svg = await QRCode.toString(text, {
    type: 'svg',
    margin: 1,
    color: { dark: color, light: '#00000000' },
  });
  return svg;
}

module.exports = { buildQrSvg };
