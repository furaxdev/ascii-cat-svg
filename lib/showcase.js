const BASE_URL = 'https://ascii-cat-svg.onrender.com';

const TOOLS = [
  {
    title: 'Sitting cat',
    path: '/cat',
    params: '?colors=blue&speed=normal',
    query: '?colors=green|blue|purple&speed=slow|normal|fast',
  },
  {
    title: 'Sleeping cat',
    path: '/cat/sleep',
    params: '?colors=purple',
    query: '?colors=green|blue|purple&speed=slow|normal|fast',
  },
  {
    title: 'Random cat fact',
    path: '/quote',
    params: '?colors=green',
    query: '?colors=green|blue|purple',
  },
  {
    title: 'Visit counter',
    path: '/visits',
    params: '?colors=green',
    query: '?colors=green|blue|purple (persists via a private gist, capped at 1/visitor/day, cached 1h)',
  },
  {
    title: 'Local clock',
    path: '/clock',
    params: '?tz=Europe/Paris&colors=blue',
    query: '?tz=<IANA timezone>&colors=green|blue|purple (cached 60s)',
  },
  {
    title: 'Last GitHub commit',
    path: '/github/last-commit',
    params: '?username=furaxdev&colors=purple',
    query: '?username=<github user>&colors=green|blue|purple (cached 5min)',
  },
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildShowcaseHtml() {
  const cards = TOOLS.map((t) => {
    const imgUrl = `${BASE_URL}${t.path}${t.params}`;
    const md = `![${t.title}](${imgUrl})`;
    return `
      <section class="card">
        <h2>${escapeHtml(t.title)}</h2>
        <div class="preview"><img src="${imgUrl}" alt="${escapeHtml(t.title)}" /></div>
        <code class="endpoint">${escapeHtml(t.path)}</code>
        <p class="query">${escapeHtml(t.query)}</p>
        <pre class="snippet"><code>${escapeHtml(md)}</code></pre>
        <button class="copy" data-snippet="${escapeHtml(md)}">Copy markdown</button>
      </section>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ascii-cat-svg — cat-themed README widgets</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 40px 20px 80px;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    font-family: 'Courier New', Courier, monospace;
    color: #e6e6e6;
  }
  h1 {
    text-align: center;
    color: #00ff88;
    text-shadow: 0 0 10px #00ff88;
    font-size: 2em;
    margin-bottom: 4px;
  }
  .subtitle {
    text-align: center;
    color: #9f9f9f;
    margin-bottom: 40px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
  }
  .card h2 {
    margin: 0 0 12px;
    font-size: 1.1em;
    color: #39c5ff;
  }
  .preview {
    background: repeating-conic-gradient(#1a1a2e 0% 25%, #16162a 0% 50%) 0 0 / 20px 20px;
    border-radius: 8px;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    overflow: auto;
  }
  .endpoint {
    display: inline-block;
    background: rgba(0, 255, 136, 0.1);
    color: #00ff88;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    margin-bottom: 8px;
  }
  .query {
    font-size: 0.8em;
    color: #9f9f9f;
    margin: 0 0 12px;
    word-break: break-word;
  }
  .snippet {
    background: #0a0a14;
    border-radius: 6px;
    padding: 10px;
    overflow-x: auto;
    font-size: 0.75em;
    margin: 0 0 10px;
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
  }
  .copy:hover { background: rgba(179, 136, 255, 0.15); }
  .copy.copied { border-color: #00ff88; color: #00ff88; }
  footer {
    text-align: center;
    margin-top: 60px;
    color: #6a6a6a;
    font-size: 0.85em;
  }
  footer a { color: #39c5ff; }
</style>
</head>
<body>
  <h1>&gt;_ ascii-cat-svg</h1>
  <p class="subtitle">Cat-themed dynamic SVG widgets for GitHub READMEs — pick one, copy the markdown.</p>
  <div class="grid">
    ${cards}
  </div>
  <footer>
    <a href="https://github.com/furaxdev/ascii-cat-svg">github.com/furaxdev/ascii-cat-svg</a>
  </footer>
  <script>
    document.querySelectorAll('.copy').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.snippet).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy markdown';
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
