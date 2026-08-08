const { buildTextBadgeSvg } = require('./style');

// WMO weather codes -> short description (no external icon set needed).
const WEATHER_DESC = {
  0: 'clear sky',
  1: 'mostly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'icy fog',
  51: 'light drizzle',
  53: 'drizzle',
  55: 'heavy drizzle',
  61: 'light rain',
  63: 'rain',
  65: 'heavy rain',
  71: 'light snow',
  73: 'snow',
  75: 'heavy snow',
  80: 'rain showers',
  81: 'rain showers',
  82: 'violent showers',
  95: 'thunderstorm',
  96: 'thunderstorm + hail',
  99: 'thunderstorm + hail',
};

async function fetchWeather(city) {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );
  if (!geoRes.ok) throw new Error(`Geocoding failed: ${geoRes.status}`);
  const geo = await geoRes.json();
  const place = geo.results && geo.results[0];
  if (!place) return null;

  const wRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code`
  );
  if (!wRes.ok) throw new Error(`Forecast failed: ${wRes.status}`);
  const w = await wRes.json();

  return {
    name: place.name,
    temp: Math.round(w.current.temperature_2m),
    desc: WEATHER_DESC[w.current.weather_code] || 'unknown',
  };
}

function buildWeatherSvg({ colors, glow, weather }) {
  const label = weather
    ? `\u{1F324} ${weather.name}: ${weather.temp}°C, ${weather.desc}`
    : '\u{1F324} city not found';
  return buildTextBadgeSvg({ colors, glow, label });
}

module.exports = { fetchWeather, buildWeatherSvg };
