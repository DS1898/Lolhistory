const RECENT_KEY = 'soop_recent_streamers';

export function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

export function saveRecent(s) {
  const list = getRecent().filter((r) => r.id !== s.id);
  localStorage.setItem(RECENT_KEY, JSON.stringify([s, ...list].slice(0, 5)));
}
