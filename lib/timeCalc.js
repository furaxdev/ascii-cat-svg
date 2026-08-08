const { buildTextBadgeSvg } = require('./style');

function buildCountdownSvg({ colors, glow, targetDate, label: eventLabel }) {
  const target = new Date(targetDate);
  let label;
  if (isNaN(target.getTime())) {
    label = '\u{23F3} invalid date';
  } else {
    const diffMs = target.getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const name = eventLabel || 'target date';
    label =
      days > 0
        ? `\u{23F3} ${name}: ${days} day${days === 1 ? '' : 's'} left`
        : days === 0
        ? `\u{23F3} ${name}: today!`
        : `\u{23F3} ${name}: ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
  }
  return buildTextBadgeSvg({ colors, glow, label });
}

function buildAgeSvg({ colors, glow, birthDate, label: personLabel }) {
  const birth = new Date(birthDate);
  let label;
  if (isNaN(birth.getTime())) {
    label = '\u{1F382} invalid date';
  } else {
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const hadBirthdayThisYear =
      now.getMonth() > birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
    if (!hadBirthdayThisYear) years -= 1;
    const name = personLabel ? `${personLabel} is` : 'age:';
    label = `\u{1F382} ${name} ${years} years old`;
  }
  return buildTextBadgeSvg({ colors, glow, label });
}

const MOON_PHASES = [
  { name: 'new moon' },
  { name: 'waxing crescent' },
  { name: 'first quarter' },
  { name: 'waxing gibbous' },
  { name: 'full moon' },
  { name: 'waning gibbous' },
  { name: 'last quarter' },
  { name: 'waning crescent' },
];

function moonPhaseName(date) {
  // Days since a known new moon (2000-01-06), divided into an 8-phase cycle.
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const synodicMonth = 29.53058867;
  const daysSince = (date.getTime() - knownNewMoon) / 86400000;
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
  const index = Math.floor((phase / synodicMonth) * 8) % 8;
  return MOON_PHASES[index].name;
}

function buildMoonPhaseSvg({ colors, glow }) {
  const label = `\u{1F319} moon tonight: ${moonPhaseName(new Date())}`;
  return buildTextBadgeSvg({ colors, glow, label });
}

module.exports = { buildCountdownSvg, buildAgeSvg, buildMoonPhaseSvg };
