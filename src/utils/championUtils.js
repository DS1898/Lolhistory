export function getChampionIconUrl(championId, version) {
  const v = version || '15.10.1';
  return `https://ddragon.leagueoflegends.com/cdn/${v}/img/champion/${championId}.png`;
}

export function getChampionSplashUrl(championId, skinNum = 0) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skinNum}.jpg`;
}

export function getChampionLoadingUrl(championId, skinNum = 0) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_${skinNum}.jpg`;
}

export function getItemIconUrl(itemId, version) {
  const v = version || '15.10.1';
  return `https://ddragon.leagueoflegends.com/cdn/${v}/img/item/${itemId}.png`;
}

export function getSummonerSpellIconUrl(spellId, version) {
  const v = version || '15.10.1';
  return `https://ddragon.leagueoflegends.com/cdn/${v}/img/spell/${spellId}.png`;
}

export function getProfileIconUrl(iconId, version) {
  const v = version || '15.10.1';
  return `https://ddragon.leagueoflegends.com/cdn/${v}/img/profileicon/${iconId}.png`;
}

export function getRankEmblemUrl(tier) {
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${tier.toLowerCase()}.png`;
}
