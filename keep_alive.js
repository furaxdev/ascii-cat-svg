const PING_INTERVAL_MS = 10 * 60 * 1000;

// Render provides RENDER_EXTERNAL_URL on deployed services; pinging our own
// public URL periodically counts as real incoming traffic, which is what
// stops the free-tier instance from spinning down after ~15min idle.
// This runs alongside (not instead of) the GitHub Actions keep-alive
// workflow — either one is enough on its own, but having both is harmless.
function startKeepAlive() {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) return; // not running on Render (e.g. local dev) — nothing to do

  setInterval(() => {
    fetch(`${url}/cat`).catch((err) => {
      console.error('keep-alive ping failed:', err.message);
    });
  }, PING_INTERVAL_MS);
}

module.exports = { startKeepAlive };
