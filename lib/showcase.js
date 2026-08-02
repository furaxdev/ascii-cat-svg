const BASE_URL = 'https://ascii-cat-svg.onrender.com';

// Each tool declares its endpoint and a list of form fields. The page's
// client-side JS reads these as JSON and builds a generator: an input
// panel that rewrites the preview <img> src (and the Markdown/HTML boxes)
// on every change — no server round-trip needed since the params are just
// a query string.
const TOOLS = [
  {
    id: 'cat',
    title: 'Sitting cat',
    path: '/cat',
    fields: [
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' },
      { name: 'speed', label: 'Speed', type: 'select', options: ['slow', 'normal', 'fast'], default: 'normal' },
    ],
  },
  {
    id: 'cat-sleep',
    title: 'Sleeping cat',
    path: '/cat/sleep',
    fields: [
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'purple' },
      { name: 'speed', label: 'Speed', type: 'select', options: ['slow', 'normal', 'fast'], default: 'normal' },
    ],
  },
  {
    id: 'quote',
    title: 'Random cat fact',
    path: '/quote',
    fields: [{ name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' }],
  },
  {
    id: 'visits',
    title: 'Visit counter',
    path: '/visits',
    note: 'Pick any name that\'s yours — each key keeps its own independent count (capped at 1 visitor/day, cached 1h).',
    fields: [
      { name: 'key', label: 'Your key', type: 'text', default: 'my-profile' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'green' },
    ],
  },
  {
    id: 'clock',
    title: 'Local clock',
    path: '/clock',
    note: 'Cached 60s, so it stays close to live without hammering the server.',
    fields: [
      { name: 'tz', label: 'Timezone (IANA)', type: 'text', default: 'Europe/Paris' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'blue' },
    ],
  },
  {
    id: 'last-commit',
    title: 'Last GitHub commit',
    path: '/github/last-commit',
    fields: [
      { name: 'username', label: 'GitHub username', type: 'text', default: 'furaxdev' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'purple' },
    ],
  },
  {
    id: 'discord',
    title: 'Discord presence',
    path: '/discord',
    note: 'Via Lanyard — you must join discord.gg/lanyard for it to see your presence.',
    fields: [
      { name: 'id', label: 'Discord user ID', type: 'text', default: '' },
      { name: 'colors', label: 'Colors', type: 'select', options: ['green', 'blue', 'purple'], default: 'blue' },
    ],
  },
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildShowcaseHtml() {
  const sections = TOOLS.map((t) => {
    const fieldsHtml = t.fields
      .map((f) => {
        if (f.type === 'select') {
          const opts = f.options
            .map((o) => `<option value="${o}"${o === f.default ? ' selected' : ''}>${o}</option>`)
            .join('');
          return `
            <label class="field">
              <span>${escapeHtml(f.label)}</span>
              <select data-tool="${t.id}" data-param="${f.name}">${opts}</select>
            </label>`;
        }
        return `
            <label class="field">
              <span>${escapeHtml(f.label)}</span>
              <input type="text" data-tool="${t.id}" data-param="${f.name}" value="${escapeHtml(f.default)}" />
            </label>`;
      })
      .join('\n');

    return `
    <section class="tool" id="${t.id}">
      <h2>${escapeHtml(t.title)}</h2>
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
    </section>`;
  }).join('\n');

  const navLinks = TOOLS.map((t) => `<a href="#${t.id}">${escapeHtml(t.title)}</a>`).join('\n');

  const toolsJson = JSON.stringify(
    TOOLS.map((t) => ({ id: t.id, title: t.title, path: t.path }))
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ascii-cat-svg — badge generator</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0 0 80px;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    font-family: 'Courier New', Courier, monospace;
    color: #e6e6e6;
  }
  header {
    text-align: center;
    padding: 40px 20px 20px;
  }
  h1 {
    color: #00ff88;
    text-shadow: 0 0 10px #00ff88;
    font-size: 2em;
    margin: 0 0 4px;
  }
  .subtitle {
    color: #9f9f9f;
    margin: 0 0 20px;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 16px;
    max-width: 900px;
    margin: 0 auto 20px;
  }
  nav a {
    color: #39c5ff;
    text-decoration: none;
    font-size: 0.85em;
    border: 1px solid rgba(57, 197, 255, 0.4);
    padding: 4px 10px;
    border-radius: 6px;
  }
  nav a:hover { background: rgba(57, 197, 255, 0.1); }
  main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
  }
  .tool {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 40px 0;
  }
  .tool h2 {
    color: #b388ff;
    margin: 0 0 8px;
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
    border: 1px solid #b388ff;
    color: #b388ff;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.85em;
    margin-bottom: 20px;
  }
  .copy:hover { background: rgba(179, 136, 255, 0.15); }
  .copy.copied { border-color: #00ff88; color: #00ff88; }
  footer {
    text-align: center;
    margin-top: 40px;
    color: #6a6a6a;
    font-size: 0.85em;
  }
  footer a { color: #39c5ff; }
</style>
</head>
<body>
  <header>
    <h1>&gt;_ ascii-cat-svg</h1>
    <p class="subtitle">Cat-themed dynamic SVG badges for GitHub READMEs — configure, preview, copy.</p>
    <nav>${navLinks}</nav>
  </header>
  <main>
    ${sections}
  </main>
  <footer>
    <a href="https://github.com/furaxdev/ascii-cat-svg">github.com/furaxdev/ascii-cat-svg</a>
  </footer>
  <script>
    const BASE_URL = ${JSON.stringify(BASE_URL)};
    const TOOLS = ${toolsJson};

    function buildUrl(toolId) {
      const inputs = document.querySelectorAll('[data-tool="' + toolId + '"]');
      const params = new URLSearchParams();
      inputs.forEach((el) => {
        if (el.value) params.set(el.dataset.param, el.value);
      });
      const tool = TOOLS.find((t) => t.id === toolId);
      const qs = params.toString();
      return BASE_URL + tool.path + (qs ? '?' + qs : '');
    }

    function refresh(toolId) {
      const tool = TOOLS.find((t) => t.id === toolId);
      const url = buildUrl(toolId);
      const md = '![' + tool.title + '](' + url + ')';
      const html = '<img src="' + url + '" alt="' + tool.title + '" />';

      document.querySelector('[data-preview="' + toolId + '"]').src = url;
      document.querySelector('[data-md="' + toolId + '"]').textContent = md;
      document.querySelector('[data-html="' + toolId + '"]').textContent = html;
    }

    TOOLS.forEach((tool) => {
      refresh(tool.id);
      document.querySelectorAll('[data-tool="' + tool.id + '"]').forEach((el) => {
        el.addEventListener('input', () => refresh(tool.id));
      });
    });

    document.querySelectorAll('.copy').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sep = btn.dataset.copyTarget.indexOf('-');
        const kind = btn.dataset.copyTarget.slice(0, sep);
        const toolId = btn.dataset.copyTarget.slice(sep + 1);
        const selector = kind === 'md' ? '[data-md="' + toolId + '"]' : '[data-html="' + toolId + '"]';
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
  </script>
</body>
</html>`;
}

module.exports = { buildShowcaseHtml };
