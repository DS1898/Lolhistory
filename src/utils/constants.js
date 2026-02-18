export const REGIONS = {
  KR: { label: '한국', routing: 'asia', platform: 'kr' },
  JP1: { label: '일본', routing: 'asia', platform: 'jp1' },
  NA1: { label: '북미', routing: 'americas', platform: 'na1' },
  EUW1: { label: '유럽 서부', routing: 'europe', platform: 'euw1' },
  EUNE1: { label: '유럽 북동', routing: 'europe', platform: 'eun1' },
  OC1: { label: '오세아니아', routing: 'sea', platform: 'oc1' },
  BR1: { label: '브라질', routing: 'americas', platform: 'br1' },
  LA1: { label: '라틴 아메리카 북', routing: 'americas', platform: 'la1' },
  LA2: { label: '라틴 아메리카 남', routing: 'americas', platform: 'la2' },
  TR1: { label: '터키', routing: 'europe', platform: 'tr1' },
  RU: { label: '러시아', routing: 'europe', platform: 'ru' },
  PH2: { label: '필리핀', routing: 'sea', platform: 'ph2' },
  SG2: { label: '싱가포르', routing: 'sea', platform: 'sg2' },
  TH2: { label: '태국', routing: 'sea', platform: 'th2' },
  TW2: { label: '대만', routing: 'sea', platform: 'tw2' },
  VN2: { label: '베트남', routing: 'sea', platform: 'vn2' },
};

export const DEFAULT_REGION = 'KR';

export const ROLES = [
  { key: 'TOP', label: '탑', icon: '🛡️' },
  { key: 'JUNGLE', label: '정글', icon: '🌿' },
  { key: 'MID', label: '미드', icon: '⚡' },
  { key: 'ADC', label: '원딜', icon: '🏹' },
  { key: 'SUPPORT', label: '서폿', icon: '💚' },
];

export const QUEUE_TYPES = {
  RANKED_SOLO_5x5: '솔로 랭크',
  RANKED_FLEX_SR: '자유 랭크',
  CHERRY: '아레나',
};

export const TIER_ORDER = [
  'CHALLENGER', 'GRANDMASTER', 'MASTER',
  'DIAMOND', 'EMERALD', 'PLATINUM',
  'GOLD', 'SILVER', 'BRONZE', 'IRON',
];

export const TEAM_SIDES = {
  BLUE: { key: 'BLUE', label: '블루팀', color: 'blue-team' },
  RED: { key: 'RED', label: '레드팀', color: 'red-team' },
};

export const DATA_DRAGON_FALLBACK_VERSION = '16.3.1';

export const CHAMPION_TAGS = {
  Fighter: '전사',
  Tank: '탱커',
  Mage: '마법사',
  Assassin: '암살자',
  Marksman: '원거리 딜러',
  Support: '서포터',
};
