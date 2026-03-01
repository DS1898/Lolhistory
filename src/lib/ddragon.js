const FALLBACK_VERSION = '15.6.1';
let _version = FALLBACK_VERSION;
let _initialized = false;
let _championMap = {};
let _spells = [];
let _spellMap = {};
let _items = {};
let _runes = [];

export async function initDDragon() {
  if (_initialized) return _version;
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await res.json();
    _version = versions[0];
  } catch {
    console.warn('DDragon 버전 로드 실패, 기본 버전 사용:', FALLBACK_VERSION);
  }
  _initialized = true;
  return _version;
}

export function getVersion() { return _version; }

export function getChampionIconUrl(championId) {
  if (!championId) return null;
  return `https://ddragon.leagueoflegends.com/cdn/${_version}/img/champion/${championId}.png`;
}

export async function fetchChampions() {
  const version = await initDDragon();
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion.json`);
  const data = await res.json();
  const champions = Object.values(data.data);
  _championMap = {};
  for (const c of champions) _championMap[c.id] = c.name;
  return champions.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

export function getChampionName(championId) {
  if (!championId) return '';
  return _championMap[championId] || championId;
}

// ── 스펠 ──────────────────────────────────────
export async function fetchSpells() {
  if (_spells.length > 0) return _spells;
  const version = await initDDragon();
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/summoner.json`);
  const data = await res.json();
  _spells = Object.values(data.data).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  _spellMap = {};
  for (const s of _spells) _spellMap[s.id] = s;
  return _spells;
}

export function getSpellIconUrl(spellId) {
  if (!spellId) return null;
  return `https://ddragon.leagueoflegends.com/cdn/${_version}/img/spell/${spellId}.png`;
}

export function getSpellName(spellId) {
  return _spellMap[spellId]?.name || spellId || '';
}

// ── 아이템 ────────────────────────────────────
export async function fetchItems() {
  if (Object.keys(_items).length > 0) return _items;
  const version = await initDDragon();
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/item.json`);
  const data = await res.json();
  _items = data.data;
  return _items;
}

export function getItemIconUrl(itemId) {
  if (!itemId || itemId === '0') return null;
  return `https://ddragon.leagueoflegends.com/cdn/${_version}/img/item/${itemId}.png`;
}

export function getItemName(itemId) {
  return _items[itemId]?.name || '';
}

// ── 룬 ──────────────────────────────────────
export async function fetchRunes() {
  if (_runes.length > 0) return _runes;
  const version = await initDDragon();
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/runesReforged.json`);
  const data = await res.json();
  _runes = data;
  return _runes;
}

export function getRuneIconUrl(icon) {
  if (!icon) return null;
  return `https://ddragon.leagueoflegends.com/cdn/img/${icon}`;
}

// 모든 키스톤 룬 목록 반환 (flat)
export function getAllKeystones(runes) {
  const result = [];
  for (const path of runes) {
    if (path.slots && path.slots[0]) {
      for (const rune of path.slots[0].runes) {
        result.push({ ...rune, pathName: path.name, pathIcon: path.icon });
      }
    }
  }
  return result;
}

// 모든 보조 경로 반환
export function getSecondaryPaths(runes) {
  return runes.map((p) => ({ id: p.id, name: p.name, icon: p.icon }));
}
