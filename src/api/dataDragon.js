import { DATA_DRAGON_FALLBACK_VERSION } from '../utils/constants';

let cachedVersion = null;

export async function getLatestVersion() {
  if (cachedVersion) return cachedVersion;
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await res.json();
    cachedVersion = versions[0];
    return cachedVersion;
  } catch {
    return DATA_DRAGON_FALLBACK_VERSION;
  }
}

function getBaseUrl(version) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}`;
}

export function getImgBase(version) {
  return `${getBaseUrl(version)}/img`;
}

export async function fetchAllChampions() {
  const version = await getLatestVersion();
  const res = await fetch(`${getBaseUrl(version)}/data/ko_KR/champion.json`);
  if (!res.ok) throw new Error('챔피언 데이터를 불러오는데 실패했습니다.');
  const data = await res.json();
  return { champions: data.data, version };
}

export async function fetchChampionDetail(championId) {
  const version = await getLatestVersion();
  const res = await fetch(`${getBaseUrl(version)}/data/ko_KR/champion/${championId}.json`);
  if (!res.ok) throw new Error('챔피언 상세 정보를 불러오는데 실패했습니다.');
  const data = await res.json();
  return data.data[championId];
}

export async function fetchSummonerSpells() {
  const version = await getLatestVersion();
  const res = await fetch(`${getBaseUrl(version)}/data/ko_KR/summoner.json`);
  if (!res.ok) throw new Error('소환사 주문 데이터를 불러오는데 실패했습니다.');
  const data = await res.json();
  return data.data;
}
