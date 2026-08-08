const BASE_URL = 'https://ascii-cat-svg.onrender.com';

// Each tool declares its endpoint and a list of form fields. The page's
// client-side JS reads these as JSON and builds a generator: an input
// panel that rewrites the preview <img> src (and the Markdown/HTML boxes)
// on every change — no server round-trip needed since the params are just
// a query string.
const TOOLS = [
  {
    id: 'cat',
    category: 'cats',
    title: 'Sitting cat',
    path: '/cat',
    fields: [
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' },
      { name: 'speed', label: 'Speed', type: 'select', options: ['slow', 'normal', 'fast'], default: 'normal' },
    ],
  },
  {
    id: 'cat-sleep',
    category: 'cats',
    title: 'Sleeping cat',
    path: '/cat/sleep',
    fields: [
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'purple' },
      { name: 'speed', label: 'Speed', type: 'select', options: ['slow', 'normal', 'fast'], default: 'normal' },
    ],
  },
  {
    id: 'quote',
    category: 'cats',
    title: 'Random cat fact',
    path: '/quote',
    fields: [{ name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' }],
  },
  {
    id: 'visits',
    category: 'cats',
    title: 'Visit counter',
    path: '/visits',
    note: 'Each key keeps its own independent count (capped at 1 visitor/day, cached 1h).',
    fields: [
      {
        name: 'key',
        label: 'Your key',
        type: 'text',
        default: '',
        placeholder: 'e.g. your GitHub username',
        hint: 'Any short unique name for yourself — reuse it every time so it stays the same counter.',
      },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' },
    ],
  },
  {
    id: 'gif',
    category: 'cats',
    title: 'Random cat GIF',
    path: '/gif',
    note: 'A real animated GIF via cataas.com — redirects there, not one of our SVG badges, so no colors/glow options.',
    noGlow: true,
    fields: [
      {
        name: 'text',
        label: 'Caption (optional)',
        type: 'text',
        default: '',
        placeholder: 'e.g. hello world',
        hint: 'Leave empty for a plain random cat gif, or add a caption overlaid on it.',
      },
    ],
  },
  {
    id: 'clock',
    category: 'time',
    title: 'Local clock',
    path: '/clock',
    note: 'Cached 60s, so it stays close to live without hammering the server. This preview auto-refreshes every 5s.',
    livePreview: 5000,
    fields: [
      { name: 'tz', label: 'Timezone', type: 'timezone', default: 'Europe/Paris' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'blue' },
    ],
  },
  {
    id: 'last-commit',
    category: 'github',
    title: 'Last GitHub commit',
    path: '/github/last-commit',
    fields: [
      {
        name: 'username',
        label: 'GitHub username',
        type: 'text',
        default: '',
        placeholder: 'e.g. furaxdev',
        hint: 'Your GitHub username, exactly as it appears in your profile URL.',
      },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'purple' },
    ],
  },
  {
    id: 'discord',
    category: 'utility',
    title: 'Discord presence',
    path: '/discord',
    note: 'Via Lanyard — you must join discord.gg/lanyard for it to see your presence. This preview auto-refreshes every 5s; a real README embed updates whenever GitHub/your browser refetches the image (cached 30s).',
    livePreview: 5000,
    fields: [
      {
        name: 'id',
        label: 'Discord user ID',
        type: 'text',
        default: '',
        placeholder: 'e.g. 123456789012345678',
        hint: 'Settings → Advanced → enable Developer Mode, then right-click your profile → Copy User ID.',
      },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'blue' },
    ],
  },
  {
    id: 'weather',
    category: 'utility',
    title: 'Weather',
    path: '/weather',
    note: 'Via open-meteo. Cached 15min.',
    fields: [
      { name: 'city', label: 'City', type: 'text', default: 'Paris', placeholder: 'e.g. Paris' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'blue' },
    ],
  },
  {
    id: 'github-repo',
    category: 'github',
    title: 'GitHub repo stats',
    path: '/github/repo',
    note: 'Stars + forks for any public repo. Cached 10min.',
    fields: [
      { name: 'owner', label: 'Repo owner', type: 'text', default: 'furaxdev', placeholder: 'e.g. furaxdev' },
      { name: 'repo', label: 'Repo name', type: 'text', default: 'ascii-cat-svg', placeholder: 'e.g. ascii-cat-svg' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'purple' },
    ],
  },
  {
    id: 'github-followers',
    category: 'github',
    title: 'GitHub followers',
    path: '/github/followers',
    note: 'Cached 10min.',
    fields: [
      { name: 'username', label: 'GitHub username', type: 'text', default: 'furaxdev', placeholder: 'e.g. furaxdev' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' },
    ],
  },
  {
    id: 'joke',
    category: 'fun',
    title: 'Random dad joke',
    path: '/joke',
    note: 'A new joke every time the badge is fetched.',
    fields: [{ name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' }],
  },
  {
    id: 'advice',
    category: 'fun',
    title: 'Random advice',
    path: '/advice',
    fields: [{ name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'blue' }],
  },
  {
    id: 'quote-general',
    category: 'fun',
    title: 'Random quote',
    path: '/quote/general',
    note: 'Not cat-themed — inspirational quotes with author.',
    fields: [{ name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'purple' }],
  },
  {
    id: 'crypto',
    category: 'finance',
    title: 'Crypto price',
    path: '/crypto',
    note: 'Via CoinGecko. Cached 2min.',
    fields: [
      { name: 'coin', label: 'Coin', type: 'select', options: ['btc', 'eth', 'sol', 'doge'], default: 'btc' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' },
    ],
  },
  {
    id: 'exchange-rate',
    category: 'finance',
    title: 'Exchange rate',
    path: '/exchange-rate',
    note: 'Cached 1h.',
    fields: [
      { name: 'from', label: 'From currency', type: 'text', default: 'USD', placeholder: 'e.g. USD' },
      { name: 'to', label: 'To currency', type: 'text', default: 'EUR', placeholder: 'e.g. EUR' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'blue' },
    ],
  },
  {
    id: 'npm',
    category: 'finance',
    title: 'npm weekly downloads',
    path: '/npm',
    note: 'Cached 1h.',
    fields: [
      { name: 'package', label: 'Package name', type: 'text', default: 'express', placeholder: 'e.g. express' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'purple' },
    ],
  },
  {
    id: 'countdown',
    category: 'time',
    title: 'Countdown',
    path: '/countdown',
    fields: [
      { name: 'date', label: 'Target date', type: 'text', default: '2026-12-25', placeholder: 'YYYY-MM-DD' },
      { name: 'label', label: 'Event name', type: 'text', default: 'Christmas', placeholder: 'e.g. Christmas' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' },
    ],
  },
  {
    id: 'age',
    category: 'time',
    title: 'Age calculator',
    path: '/age',
    fields: [
      { name: 'birthdate', label: 'Birth date', type: 'text', default: '2000-01-01', placeholder: 'YYYY-MM-DD' },
      { name: 'label', label: 'Name (optional)', type: 'text', default: '', placeholder: 'e.g. Furax' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'blue' },
    ],
  },
  {
    id: 'moon',
    category: 'time',
    title: 'Moon phase',
    path: '/moon',
    fields: [{ name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'purple' }],
  },
  {
    id: 'uptime',
    category: 'utility',
    title: 'Site uptime check',
    path: '/uptime',
    note: 'Live HTTP check on every load — not cached beyond 60s.',
    fields: [
      { name: 'url', label: 'URL to check', type: 'text', default: 'https://github.com', placeholder: 'https://example.com' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' },
    ],
  },
  {
    id: 'qr',
    category: 'utility',
    title: 'QR code',
    path: '/qr',
    note: 'Real SVG QR code — no glow toggle here, it is a scannable code, not a text badge.',
    noGlow: true,
    fields: [
      { name: 'text', label: 'Content to encode', type: 'text', default: 'https://github.com/furaxdev', placeholder: 'URL or text' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' },
    ],
  },
];

// Per-category theming (accent color, background gradient, and a small
// vector icon — no emoji, plain SVG shapes so it renders identically
// everywhere) so pages read as distinct sections instead of one undifferentiated list.
const CATEGORY_THEME = {
  cats: {
    label: 'Cats',
    accent: '#00ff88',
    bg: ['#0f0c29', '#1c3b2e', '#24243e'],
    icon: '<path d="M6 10 L9 4 L12 8 L16 8 L19 4 L22 10 Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /><circle cx="11" cy="14" r="1" fill="currentColor" /><circle cx="17" cy="14" r="1" fill="currentColor" /><path d="M12 17 Q14 19 16 17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />',
  },
  github: {
    label: 'GitHub',
    accent: '#39c5ff',
    bg: ['#0a1a2e', '#132b45', '#0f2138'],
    icon: '<path d="M10 7 L5 14 L10 21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /><path d="M18 7 L23 14 L18 21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />',
  },
  fun: {
    label: 'Fun',
    accent: '#b388ff',
    bg: ['#1a0f2e', '#2a1b45', '#241a3e'],
    icon: '<rect x="6" y="6" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.6" /><circle cx="10.5" cy="10.5" r="1.3" fill="currentColor" /><circle cx="14" cy="14" r="1.3" fill="currentColor" /><circle cx="17.5" cy="17.5" r="1.3" fill="currentColor" />',
  },
  finance: {
    label: 'Finance',
    accent: '#ffcc4d',
    bg: ['#241c05', '#3a2e0c', '#2e2408'],
    icon: '<circle cx="14" cy="14" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6" /><path d="M14 9.5v9M11.5 12c0-1.4 1.2-2.2 2.5-2.2s2.5.8 2.5 2c0 2.5-5 1.5-5 4 0 1.2 1.2 2.2 2.5 2.2s2.5-.8 2.5-2.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />',
  },
  time: {
    label: 'Time',
    accent: '#5be3ff',
    bg: ['#04222b', '#0a3543', '#082a36'],
    icon: '<circle cx="14" cy="14" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6" /><path d="M14 9v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />',
  },
  utility: {
    label: 'Utility',
    accent: '#ff8a5b',
    bg: ['#2b1608', '#3d220f', '#2e1a0a'],
    icon: '<path d="M9 19 L18 10 a2.5 2.5 0 0 0 -3.5 -3.5 L6 15 a2.5 2.5 0 0 0 0 3.5 a2.5 2.5 0 0 0 3.5 0 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /><circle cx="19.5" cy="8.5" r="1.4" fill="currentColor" />',
  },
};

// Every tool gets the same glow toggle, so it's appended once here instead
// of repeating it in each entry above (QR codes opt out — glow makes no
// sense on a scannable code).
TOOLS.forEach((t) => {
  if (!t.noGlow) {
    t.fields.push({ name: 'glow', label: 'Glow', type: 'checkbox', default: true });
  }
});

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const SHARED_CSS = `
  :root {
    color-scheme: dark;
    --accent: #00ff88;
    --bg-from: #0f0c29;
    --bg-via: #302b63;
    --bg-to: #24243e;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0 0 80px;
    background: linear-gradient(135deg, var(--bg-from) 0%, var(--bg-via) 50%, var(--bg-to) 100%);
    font-family: 'Courier New', Courier, monospace;
    color: #e6e6e6;
  }
  header {
    text-align: center;
    padding: 40px 20px 20px;
  }
  h1 {
    color: var(--accent);
    text-shadow: 0 0 10px var(--accent);
    font-size: 2em;
    margin: 0 0 4px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  h1 a { color: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; }
  .category-icon {
    width: 26px;
    height: 26px;
    color: var(--accent);
    filter: drop-shadow(0 0 4px var(--accent));
  }
  .category-icon.small { width: 18px; height: 18px; }
  .subtitle {
    color: #9f9f9f;
    margin: 0 0 20px;
  }
  .back-link {
    display: inline-block;
    color: var(--accent);
    text-decoration: none;
    font-size: 0.85em;
    margin-bottom: 20px;
  }
  .back-link:hover { text-decoration: underline; }
  main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    margin-top: 20px;
  }
  .card {
    display: block;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 16px;
    text-decoration: none;
    color: #e6e6e6;
    transition: border-color 0.15s, background 0.15s;
  }
  .card:hover {
    border-color: rgba(179, 136, 255, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }
  .card h3 {
    margin: 0 0 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1em;
  }
  .card p {
    margin: 0;
    color: #9f9f9f;
    font-size: 0.78em;
  }
  .tool h2 {
    color: var(--accent);
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .note {
    color: #9f9f9f;
    font-size: 0.85em;
    margin: 0 0 20px;
  }
  .generator {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 30px;
  }
  @media (max-width: 700px) {
    .generator { grid-template-columns: 1fr; }
  }
  .panel h3 {
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6a6a6a;
    margin: 0 0 10px;
  }
  .field {
    display: block;
    margin-bottom: 16px;
  }
  .field span {
    display: block;
    font-size: 0.85em;
    color: #9f9f9f;
    margin-bottom: 4px;
  }
  .field select, .field input {
    width: 100%;
    background: #1a1a2e;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #e6e6e6;
    padding: 8px 10px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.9em;
  }
  .field input::placeholder { color: #5a5a6a; }
  .field-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .field-checkbox input {
    width: auto;
    margin: 0;
  }
  .field-checkbox span { margin: 0; }
  .hint {
    display: block;
    color: #6a6a6a;
    font-size: 0.78em;
    margin-top: 4px;
    line-height: 1.4;
  }
  .preview {
    background: repeating-conic-gradient(#1a1a2e 0% 25%, #16162a 0% 50%) 0 0 / 20px 20px;
    border-radius: 8px;
    min-height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    margin-bottom: 16px;
    overflow: auto;
  }
  .snippet {
    background: #0a0a14;
    border-radius: 6px;
    padding: 10px;
    overflow-x: auto;
    font-size: 0.78em;
    margin: 0 0 10px;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .copy {
    background: transparent;
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.85em;
    margin-bottom: 20px;
  }
  .copy:hover { background: color-mix(in srgb, var(--accent) 15%, transparent); }
  .copy.copied { border-color: #00ff88; color: #00ff88; }
  footer {
    text-align: center;
    margin-top: 40px;
    color: #6a6a6a;
    font-size: 0.85em;
  }
  footer a { color: #39c5ff; }
`;

function categoryIconSvg(category, extraClass = '', colorOverride = null) {
  const theme = CATEGORY_THEME[category];
  if (!theme) return '';
  const style = colorOverride
    ? ` style="color: ${colorOverride}; filter: drop-shadow(0 0 4px ${colorOverride});"`
    : '';
  return `<svg class="category-icon ${extraClass}" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"${style}>${theme.icon}</svg>`;
}

function pageShell({ title, body, extraScript = '', theme = null }) {
  const themeOverride = theme
    ? `<style>:root{--accent:${theme.accent};--bg-from:${theme.bg[0]};--bg-via:${theme.bg[1]};--bg-to:${theme.bg[2]};}</style>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${SHARED_CSS}</style>
${themeOverride}
</head>
<body>
  ${body}
  <footer>
    <a href="https://github.com/furaxdev/ascii-cat-svg">github.com/furaxdev/ascii-cat-svg</a>
  </footer>
  ${extraScript}
</body>
</html>`;
}

function buildIndexHtml() {
  const cards = TOOLS.map((t) => {
    const theme = CATEGORY_THEME[t.category];
    const style = theme ? ` style="border-color: color-mix(in srgb, ${theme.accent} 30%, transparent);"` : '';
    const titleStyle = theme ? ` style="color: ${theme.accent};"` : '';
    return `
    <a class="card" href="/g/${t.id}"${style}>
      <h3${titleStyle}>${categoryIconSvg(t.category, 'small', theme ? theme.accent : null)}${escapeHtml(t.title)}</h3>
      <p>${escapeHtml(t.note || t.path)}</p>
    </a>`;
  }).join('\n');

  const body = `
  <header>
    <h1>&gt;_ ascii-cat-svg</h1>
    <p class="subtitle">Cat-themed dynamic SVG badges for GitHub READMEs — pick one to configure, preview, and copy.</p>
  </header>
  <main>
    <div class="grid">${cards}</div>
  </main>`;

  return pageShell({ title: 'ascii-cat-svg — badge generator', body });
}

function fieldHtml(t, f) {
  const hintHtml = f.hint ? `<small class="hint">${escapeHtml(f.hint)}</small>` : '';
  if (f.type === 'select') {
    const opts = f.options
      .map((o) => `<option value="${o}"${o === f.default ? ' selected' : ''}>${o}</option>`)
      .join('');
    return `
      <label class="field">
        <span>${escapeHtml(f.label)}</span>
        <select data-tool="${t.id}" data-param="${f.name}">${opts}</select>
        ${hintHtml}
      </label>`;
  }
  if (f.type === 'timezone') {
    return `
      <label class="field">
        <span>${escapeHtml(f.label)}</span>
        <select data-tool="${t.id}" data-param="${f.name}" data-timezone-select data-default="${escapeHtml(f.default)}"></select>
        ${hintHtml}
      </label>`;
  }
  if (f.type === 'checkbox') {
    return `
      <label class="field field-checkbox">
        <input type="checkbox" data-tool="${t.id}" data-param="${f.name}" data-checkbox${f.default ? ' checked' : ''} />
        <span>${escapeHtml(f.label)}</span>
        ${hintHtml}
      </label>`;
  }
  return `
      <label class="field">
        <span>${escapeHtml(f.label)}</span>
        <input type="text" data-tool="${t.id}" data-param="${f.name}" value="${escapeHtml(f.default)}" placeholder="${escapeHtml(f.placeholder || '')}" />
        ${hintHtml}
      </label>`;
}

function buildToolPageHtml(id) {
  const t = TOOLS.find((tool) => tool.id === id);
  if (!t) return null;

  const fieldsHtml = t.fields.map((f) => fieldHtml(t, f)).join('\n');
  const toolJson = JSON.stringify({ id: t.id, title: t.title, path: t.path, livePreview: t.livePreview || null });
  const theme = CATEGORY_THEME[t.category];

  const body = `
  <header>
    <h1><a href="/">${categoryIconSvg(t.category)}ascii-cat-svg</a></h1>
    ${theme ? `<p class="subtitle">${escapeHtml(theme.label)}</p>` : ''}
  </header>
  <main>
    <a class="back-link" href="/">&larr; all badges</a>
    <section class="tool" id="${t.id}">
      <h2>${categoryIconSvg(t.category)}${escapeHtml(t.title)}</h2>
      ${t.note ? `<p class="note">${escapeHtml(t.note)}</p>` : ''}
      <div class="generator">
        <div class="panel">
          <h3>Properties</h3>
          ${fieldsHtml}
        </div>
        <div class="panel">
          <h3>Preview</h3>
          <div class="preview"><img data-preview="${t.id}" alt="${escapeHtml(t.title)}" /></div>
          <h3>Markdown</h3>
          <pre class="snippet"><code data-md="${t.id}"></code></pre>
          <button class="copy" data-copy-target="md-${t.id}">Copy Markdown</button>
          <h3>HTML</h3>
          <pre class="snippet"><code data-html="${t.id}"></code></pre>
          <button class="copy" data-copy-target="html-${t.id}">Copy HTML</button>
        </div>
      </div>
    </section>
  </main>`;

  const extraScript = `<script>
    const BASE_URL = ${JSON.stringify(BASE_URL)};
    const tool = ${toolJson};

    function buildUrl() {
      const inputs = document.querySelectorAll('[data-tool="' + tool.id + '"]');
      const params = new URLSearchParams();
      inputs.forEach((el) => {
        if (el.type === 'checkbox') {
          if (!el.checked) params.set(el.dataset.param, 'off');
        } else if (el.value) {
          params.set(el.dataset.param, el.value);
        }
      });
      const qs = params.toString();
      return BASE_URL + tool.path + (qs ? '?' + qs : '');
    }

    function refresh() {
      const url = buildUrl();
      const md = '![' + tool.title + '](' + url + ')';
      const html = '<img src="' + url + '" alt="' + tool.title + '" />';

      // Cache-bust only the live preview <img>, never the copied snippets —
      // a real README embed shouldn't carry a throwaway timestamp param.
      const previewUrl = tool.livePreview
        ? url + (url.includes('?') ? '&' : '?') + '_=' + Date.now()
        : url;

      document.querySelector('[data-preview="' + tool.id + '"]').src = previewUrl;
      document.querySelector('[data-md="' + tool.id + '"]').textContent = md;
      document.querySelector('[data-html="' + tool.id + '"]').textContent = html;
    }

    document.querySelectorAll('[data-timezone-select]').forEach((select) => {
      const zones = (typeof Intl.supportedValuesOf === 'function')
        ? Intl.supportedValuesOf('timeZone')
        : ['Europe/Paris', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney'];
      const defaultZone = select.dataset.default;
      zones.forEach((zone) => {
        const opt = document.createElement('option');
        opt.value = zone;
        opt.textContent = zone.replace(/_/g, ' ');
        if (zone === defaultZone) opt.selected = true;
        select.appendChild(opt);
      });
    });

    refresh();
    document.querySelectorAll('[data-tool="' + tool.id + '"]').forEach((el) => {
      el.addEventListener('input', refresh);
    });
    if (tool.livePreview) {
      setInterval(refresh, tool.livePreview);
    }

    document.querySelectorAll('.copy').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sep = btn.dataset.copyTarget.indexOf('-');
        const kind = btn.dataset.copyTarget.slice(0, sep);
        const selector = kind === 'md' ? '[data-md="' + tool.id + '"]' : '[data-html="' + tool.id + '"]';
        const text = document.querySelector(selector).textContent;
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('copied');
          }, 1500);
        });
      });
    });
  </script>`;

  return pageShell({ title: `${t.title} — ascii-cat-svg`, body, extraScript, theme });
}

module.exports = { buildIndexHtml, buildToolPageHtml, TOOL_IDS: TOOLS.map((t) => t.id) };
