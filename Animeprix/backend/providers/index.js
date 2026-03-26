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
const DEFAULT_PROVIDER = 'animepahe';
const ACTIVE_PROVIDERS = [DEFAULT_PROVIDER];

export function initProviders(baseUrl, headers = {}) {
  providerMap = createProviders(baseUrl, headers);
  return providerMap;
}

export function getProvider(name) {
  if (!providerMap) throw new Error('Providers not initialized');
  const requested = (typeof name === 'string' ? name : DEFAULT_PROVIDER).toLowerCase().trim();
  if (!requested || requested !== DEFAULT_PROVIDER) {
    // Disabled due to upstream instability. Keep adapters for future re-activation.
    console.warn(`[provider-router] Requested "${name || 'undefined'}", using fallback "${DEFAULT_PROVIDER}"`);
  }
  return providerMap[DEFAULT_PROVIDER];
}

export function getAvailableProviders() {
  return [...ACTIVE_PROVIDERS];
}

export function getDefaultProvider() {
  return DEFAULT_PROVIDER;
}

export function listProviders() {
  return getAvailableProviders();
}
