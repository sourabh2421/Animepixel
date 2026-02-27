import { AnimePahe } from './animepahe.js';
import { AnimeUnity } from './animeunity.js';
import { HiAnime } from './hianime.js';
import { AnimeKai } from './animekai.js';
import { AnimeSaturn } from './animesaturn.js';
import { KickAssAnime } from './kickassanime.js';
import { GogoAnime } from './gogoanime.js';
import { Zoro } from './zoro.js';

/**
 * Provider router — dynamic dispatch by name. No silent fallback to any provider.
 * Provider must ONLY come from request; invalid name throws.
 * First 6 match official Consumet api.consumet.org; gogoanime/zoro need alternate API.
 */
function createProviders(baseUrl, headers) {
  return {
    animepahe: new AnimePahe(baseUrl, headers),
    animeunity: new AnimeUnity(baseUrl, headers),
    hianime: new HiAnime(baseUrl, headers),
    animekai: new AnimeKai(baseUrl, headers),
    animesaturn: new AnimeSaturn(baseUrl, headers),
    kickassanime: new KickAssAnime(baseUrl, headers),
    gogoanime: new GogoAnime(baseUrl, headers),
    zoro: new Zoro(baseUrl, headers),
  };
}

let providerMap = null;

export function initProviders(baseUrl, headers = {}) {
  providerMap = createProviders(baseUrl, headers);
  return providerMap;
}

export function getProvider(name) {
  if (!providerMap) throw new Error('Providers not initialized');
  if (!name || typeof name !== 'string') {
    throw new Error('Provider name is required');
  }
  const key = name.toLowerCase().trim();
  if (!providerMap[key]) {
    throw new Error(`Invalid provider: ${name}. Valid: ${Object.keys(providerMap).join(', ')}`);
  }
  return providerMap[key];
}

export function listProviders() {
  if (!providerMap) return [];
  return Object.keys(providerMap);
}
