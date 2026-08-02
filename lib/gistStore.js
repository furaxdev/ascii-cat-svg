const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function headers() {
  return {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ascii-cat-svg',
  };
}

function isConfigured() {
  return Boolean(GIST_ID && GITHUB_TOKEN);
}

async function readJson(filename, fallback) {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers: headers() });
  if (!res.ok) throw new Error(`Gist fetch failed: ${res.status}`);
  const gist = await res.json();
  const file = gist.files[filename];
  return file ? JSON.parse(file.content) : fallback;
}

async function writeJson(filename, data) {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: { [filename]: { content: JSON.stringify(data) } } }),
  });
  if (!res.ok) throw new Error(`Gist update failed: ${res.status}`);
}

module.exports = { readJson, writeJson, isConfigured };
