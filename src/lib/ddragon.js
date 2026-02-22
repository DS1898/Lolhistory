const FALLBACK_VERSION = '15.6.1';
let _version = FALLBACK_VERSION;
let _initialized = false;

export async function initDDragon() {
  if (_initialized) return _version;
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await res.json();
    _version = versions[0];
  } catch {
    // fallback version 유지
  } finally {
    _initialized = true;
  }
  return _version;
}

export function getVersion() {
  return _version;
}

export function getChampionIconUrl(championId) {
  if (!championId) return null;
  return `https://ddragon.leagueoflegends.com/cdn/${_version}/img/champion/${championId}.png`;
}

export async function fetchChampions() {
  const version = await initDDragon();
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion.json`
  );
  const data = await res.json();
  return Object.values(data.data).sort((a, b) =>
    a.name.localeCompare(b.name, 'ko')
  );
}
