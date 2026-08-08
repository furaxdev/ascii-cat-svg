const { buildTextBadgeSvg } = require('./style');

async function fetchRepoStats(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { 'User-Agent': 'ascii-cat-svg', Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
  const json = await res.json();
  return {
    stars: json.stargazers_count,
    forks: json.forks_count,
    watchers: json.subscribers_count,
  };
}

async function fetchFollowers(username) {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: { 'User-Agent': 'ascii-cat-svg', Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
  const json = await res.json();
  return { followers: json.followers, publicRepos: json.public_repos };
}

function buildRepoStatsSvg({ colors, glow, stats, repoName }) {
  const label = stats
    ? `\u{2B50} ${repoName}: ${stats.stars} stars, ${stats.forks} forks`
    : '\u{2B50} repo not found';
  return buildTextBadgeSvg({ colors, glow, label });
}

function buildFollowersSvg({ colors, glow, stats, username }) {
  const label = stats
    ? `\u{1F465} ${username}: ${stats.followers} followers, ${stats.publicRepos} repos`
    : '\u{1F465} user not found';
  return buildTextBadgeSvg({ colors, glow, label });
}

module.exports = { fetchRepoStats, fetchFollowers, buildRepoStatsSvg, buildFollowersSvg };
