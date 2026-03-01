const REGIONS = {
  KR: { routing: 'asia', platform: 'kr' },
  JP1: { routing: 'asia', platform: 'jp1' },
  NA1: { routing: 'americas', platform: 'na1' },
  EUW1: { routing: 'europe', platform: 'euw1' },
  EUNE1: { routing: 'europe', platform: 'eun1' },
  OC1: { routing: 'sea', platform: 'oc1' },
  BR1: { routing: 'americas', platform: 'br1' },
  LA1: { routing: 'americas', platform: 'la1' },
  LA2: { routing: 'americas', platform: 'la2' },
  TR1: { routing: 'europe', platform: 'tr1' },
  RU: { routing: 'europe', platform: 'ru' },
  PH2: { routing: 'sea', platform: 'ph2' },
  SG2: { routing: 'sea', platform: 'sg2' },
  TH2: { routing: 'sea', platform: 'th2' },
  TW2: { routing: 'sea', platform: 'tw2' },
  VN2: { routing: 'sea', platform: 'vn2' },
};

function corsHeaders(origin, allowedOrigin) {
  // Only reflect the requesting origin if it matches the configured allowed origin.
  // Falls back to '*' only when no allowed origin is configured (e.g. local dev without env vars).
  const allow = allowedOrigin
    ? (origin === allowedOrigin ? origin : allowedOrigin)
    : '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data, status = 200, origin, allowedOrigin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin, allowedOrigin) },
  });
}

function getRegionConfig(regionKey) {
  return REGIONS[regionKey.toUpperCase()] || null;
}

async function riotFetch(url, apiKey) {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': apiKey },
  });

  if (!res.ok) {
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return res;
}

const routes = [
  {
    // GET /api/riot/account/:region/:gameName/:tagLine
    pattern: /^\/api\/riot\/account\/([^/]+)\/([^/]+)\/([^/]+)$/,
    handler: async (matches, apiKey) => {
      const [, region, gameName, tagLine] = matches;
      const config = getRegionConfig(region);
      if (!config) return null;
      const url = `https://${config.routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
      return riotFetch(url, apiKey);
    },
  },
  {
    // GET /api/riot/summoner/:region/:puuid
    pattern: /^\/api\/riot\/summoner\/([^/]+)\/([^/]+)$/,
    handler: async (matches, apiKey) => {
      const [, region, puuid] = matches;
      const config = getRegionConfig(region);
      if (!config) return null;
      const url = `https://${config.platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
      return riotFetch(url, apiKey);
    },
  },
  {
    // GET /api/riot/league/:region/:summonerId
    pattern: /^\/api\/riot\/league\/([^/]+)\/([^/]+)$/,
    handler: async (matches, apiKey) => {
      const [, region, summonerId] = matches;
      const config = getRegionConfig(region);
      if (!config) return null;
      const url = `https://${config.platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
      return riotFetch(url, apiKey);
    },
  },
  {
    // GET /api/riot/matches/:region/:puuid?start=0&count=20
    pattern: /^\/api\/riot\/matches\/([^/]+)\/([^/]+)$/,
    handler: async (matches, apiKey, url) => {
      const [, region, puuid] = matches;
      const config = getRegionConfig(region);
      if (!config) return null;
      const params = new URL(url).searchParams;
      const start = params.get('start') || '0';
      const count = params.get('count') || '20';
      const riotUrl = `https://${config.routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
      return riotFetch(riotUrl, apiKey);
    },
  },
  {
    // GET /api/riot/match/:region/:matchId
    pattern: /^\/api\/riot\/match\/([^/]+)\/([^/]+)$/,
    handler: async (matches, apiKey) => {
      const [, region, matchId] = matches;
      const config = getRegionConfig(region);
      if (!config) return null;
      const url = `https://${config.routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
      return riotFetch(url, apiKey);
    },
  },
  {
    // GET /api/riot/mastery/:region/:puuid?count=10
    pattern: /^\/api\/riot\/mastery\/([^/]+)\/([^/]+)$/,
    handler: async (matches, apiKey, url) => {
      const [, region, puuid] = matches;
      const config = getRegionConfig(region);
      if (!config) return null;
      const params = new URL(url).searchParams;
      const count = params.get('count') || '10';
      const riotUrl = `https://${config.platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${count}`;
      return riotFetch(riotUrl, apiKey);
    },
  },
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = env.CORS_ORIGIN || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, allowedOrigin) });
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin, allowedOrigin);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    for (const route of routes) {
      const match = path.match(route.pattern);
      if (match) {
        const apiKey = env.RIOT_API_KEY;
        if (!apiKey || apiKey === 'RGAPI-your-api-key-here') {
          return jsonResponse({ error: 'API key not configured' }, 500, origin, allowedOrigin);
        }

        const res = await route.handler(match, apiKey, request.url);
        if (!res) {
          return jsonResponse({ error: 'Invalid region' }, 400, origin, allowedOrigin);
        }

        const body = await res.text();
        return new Response(body, {
          status: res.status,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin, allowedOrigin),
          },
        });
      }
    }

    return jsonResponse({ error: 'Not found' }, 404, origin, allowedOrigin);
  },
};
