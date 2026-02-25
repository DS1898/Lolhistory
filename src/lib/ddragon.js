const FALLBACK_VERSION = '15.6.1';
let _version = FALLBACK_VERSION;
let _initialized = false;
let _championMap = {}; // { championId: koreanName }

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
  const champions = Object.values(data.data);

  // 챔피언 ID → 한글 이름 맵 저장
  _championMap = {};
  for (const c of champions) {
    _championMap[c.id] = c.name;
  }

  return champions.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

// 챔피언 ID → 한글 이름 반환 (맵이 없으면 ID 그대로 반환)
export function getChampionName(championId) {
  if (!championId) return '';
  return _championMap[championId] || championId;
}
