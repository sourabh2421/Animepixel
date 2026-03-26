// Anime API Service
// Images remain proxied (anti-hotlink), but video prefers direct playback for lower latency.
const RAW_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://animepixel.onrender.com';
const BASE_URL = String(RAW_BASE_URL).replace(/\/+$/, '').endsWith('/api')
  ? String(RAW_BASE_URL).replace(/\/+$/, '')
  : `${String(RAW_BASE_URL).replace(/\/+$/, '')}/api`;
const STABLE_PROVIDER = 'animepahe';
console.log('API BASE URL:', BASE_URL);

/** Proxify image URL so browser never hits i.animepahe.si directly (avoids 403). */
export const proxyImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (!/^https?:\/\//i.test(url)) return url;
  if (url.includes('/api/image?url=')) return url;
  return `${BASE_URL}/image?url=${encodeURIComponent(url)}`;
};

export const buildProxyMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (!/^https?:\/\//i.test(url)) return url;
  if (url.includes('/api/stream?url=')) return url;
  return `${BASE_URL}/stream?url=${encodeURIComponent(url)}`;
};

const fetchFromBackend = async (endpoint) => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log('Fetching from backend:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    }).catch((networkError) => {
      throw new Error('Unable to connect to server. Please try again later.');
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Backend API Error:', error);
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Load failed')
    ) {
      throw new Error('Unable to connect to server. Please try again later.');
    }
    throw error;
  }
};

export const PROVIDER_LABELS = {
  animepahe: 'AnimePahe',
  animeunity: 'AnimeUnity',
  hianime: 'HiAnime',
  animekai: 'AnimeKai',
  animesaturn: 'AnimeSaturn',
  kickassanime: 'KickAssAnime',
  gogoanime: 'Gogoanime',
  zoro: 'Zoro',
};

/** Get list of provider keys from backend (single source of truth). */
export const getProviders = async () => {
  return [STABLE_PROVIDER];
};

/** Provider is required by backend. Default only for backward compat on hero search. */
export const searchAnime = async (query, provider = STABLE_PROVIDER) => {
  const stableProvider = STABLE_PROVIDER;
  return fetchFromBackend(`/search?q=${encodeURIComponent(query)}&provider=${encodeURIComponent(stableProvider)}`);
};

export const getAnimeInfo = async (animeId, provider) => {
  const stableProvider = STABLE_PROVIDER;
  return fetchFromBackend(`/anime/${animeId}?provider=${encodeURIComponent(stableProvider)}`);
};

// Backend /api/watch expects: episodeId and provider (no fallback).
export const getStreamingLinks = async (episodeId, provider) => {
  try {
    const stableProvider = STABLE_PROVIDER;
    const endpoint = `/watch?episodeId=${encodeURIComponent(episodeId)}&provider=${encodeURIComponent(stableProvider)}`;
    console.log('[DEBUG] getStreamingLinks — episodeId:', episodeId);
    console.log('[DEBUG] getStreamingLinks — backend URL:', `${BASE_URL}${endpoint}`);

    const data = await fetchFromBackend(endpoint);
    if (
      data?.error === 'PROVIDER_BLOCKED' ||
      data?.error === 'PROVIDER_FAILED' ||
      data?.error === 'PROVIDER_UNAVAILABLE'
    ) {
      return {
        sources: [],
        fallback: true,
        message: 'Streaming source temporarily unavailable.',
      };
    }
    console.log(
      '[DEBUG] getStreamingLinks — response:',
      JSON.stringify({
        sourcesCount: data?.sources?.length ?? 0,
        downloadCount: data?.download?.length ?? 0,
        linksCount: data?.links?.length ?? 0,
      })
    );

    const combinedSources = [];
    // Prefer direct MP4 links first for fastest startup; fallback proxy handled by player on error.
    if (Array.isArray(data.download)) {
      combinedSources.push(
        ...data.download.map((item) => ({
          url: item.url,
          proxyUrl: buildProxyMediaUrl(item.url),
          quality: item.quality || 'download',
          type: 'download',
        }))
      );
    }
    if (Array.isArray(data.sources)) {
      combinedSources.push(...data.sources.map((item) => {
        if (typeof item === 'string') return { url: item, proxyUrl: buildProxyMediaUrl(item), quality: 'source' };
        const directUrl = item?.url || item?.file || item?.src;
        return { ...item, url: directUrl, proxyUrl: buildProxyMediaUrl(directUrl) };
      }));
    }
    if (Array.isArray(data.links)) {
      combinedSources.push(...data.links.map((item) => {
        if (typeof item === 'string') return { url: item, proxyUrl: buildProxyMediaUrl(item), quality: 'link' };
        const directUrl = item?.url || item?.file || item?.src;
        return { ...item, url: directUrl, proxyUrl: buildProxyMediaUrl(directUrl) };
      }));
    }
    if (combinedSources.length > 0) {
      return { sources: combinedSources };
    }
    if (data.url) {
      return { sources: [{ url: data.url, proxyUrl: buildProxyMediaUrl(data.url), quality: 'default' }] };
    }
    return {
      sources: [],
      fallback: true,
      message: data.message || 'Streaming temporarily unavailable.',
    };
  } catch (error) {
    console.error('Streaming links error:', error);
    const msg = error?.message || '';
    return {
      sources: [],
      fallback: true,
      message: (msg.includes('PROVIDER_BLOCKED') || msg.includes('PROVIDER_FAILED')) ? 'Streaming source temporarily unavailable.' : 'Streaming temporarily unavailable.',
    };
  }
};

export const getTrendingAnime = async () => fetchFromBackend('/trending');

// ─── Direct Consumet search (used only by AnimeSearch page)
const CONSUMET_API_BASE = String(import.meta.env.VITE_CONSUMET_API_BASE || '').replace(/\/+$/, '');
const VALID_PROVIDERS = ['animepahe', 'animeunity', 'hianime', 'animekai', 'animesaturn', 'kickassanime'];

export const searchAnimeDirect = async (animeName, provider = 'animepahe') => {
  if (!animeName?.trim()) throw new Error('Anime name is required');
  if (!CONSUMET_API_BASE) {
    throw new Error('Consumet API endpoint is not configured.');
  }
  if (!VALID_PROVIDERS.includes(provider))
    throw new Error(`Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}`);

  const url = `${CONSUMET_API_BASE}/${provider}/${encodeURIComponent(animeName.trim())}`;
  console.log('Fetching from Consumet API:', url);

  const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.results && Array.isArray(data.results)) return { results: data.results, provider };
  if (Array.isArray(data)) return { results: data, provider };
  return { results: [], provider };
};