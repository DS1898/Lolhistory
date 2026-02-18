import { fetchApi } from './client';

export async function getAccountByRiotId(region, gameName, tagLine) {
  return fetchApi(`/riot/account/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
}

export async function getSummonerByPuuid(region, puuid) {
  return fetchApi(`/riot/summoner/${region}/${puuid}`);
}

export async function getLeagueEntries(region, summonerId) {
  return fetchApi(`/riot/league/${region}/${summonerId}`);
}

export async function getMatchIds(region, puuid, start = 0, count = 20) {
  return fetchApi(`/riot/matches/${region}/${puuid}?start=${start}&count=${count}`);
}

export async function getMatchDetail(region, matchId) {
  return fetchApi(`/riot/match/${region}/${matchId}`);
}

export async function getChampionMasteries(region, puuid, count = 10) {
  return fetchApi(`/riot/mastery/${region}/${puuid}?count=${count}`);
}

export async function getPlayerProfile(region, gameName, tagLine) {
  const account = await getAccountByRiotId(region, gameName, tagLine);
  const summoner = await getSummonerByPuuid(region, account.puuid);
  const leagues = await getLeagueEntries(region, summoner.id);

  return {
    account,
    summoner,
    leagues,
    soloRank: leagues.find(l => l.queueType === 'RANKED_SOLO_5x5') || null,
    flexRank: leagues.find(l => l.queueType === 'RANKED_FLEX_SR') || null,
  };
}
