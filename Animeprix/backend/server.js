import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import {
  initProviders,
  getProvider,
  getAvailableProviders,
  getDefaultProvider,
  listProviders,
} from './providers/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || '';
const API_BASE_URL =
  process.env.CONSUMET_URL ||
  process.env.API_BASE_URL ||
  process.env.CONSUMET_API_URL ||
  'https://animepahe.ru';
const API_KEY = process.env.API_KEY || '';
const API_KEY_REQUIRED = process.env.API_KEY_REQUIRED === 'true';

if (!API_BASE_URL) {
  throw new Error('Missing API_BASE_URL (or CONSUMET_API_URL) in environment.');
}
if (API_KEY_REQUIRED && !API_KEY) {
  throw new Error('Missing API_KEY in environment. Set API_KEY or disable API_KEY_REQUIRED.');
}

console.log('Allowed frontend:', FRONTEND_ORIGIN || '*');
if (!FRONTEND_ORIGIN) {
  app.use(cors({ origin: '*' }));
} else {
  app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  }));
}
app.use(express.json());

const consumerAxiosHeaders = {
  Accept: 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  ...(API_KEY ? { Authorization: `Bearer ${API_KEY}`, 'x-api-key': API_KEY } : {}),
};

initProviders(API_BASE_URL, consumerAxiosHeaders);
const DEFAULT_PROVIDER = getDefaultProvider();
const ACTIVE_PROVIDERS = getAvailableProviders();

const providerHealthCache = {
  expiresAt: 0,
  providers: [],
};

const SEARCH_TTL_MS = Number(process.env.SEARCH_CACHE_TTL_MS || 10 * 60 * 1000);
const ANIME_TTL_MS = Number(process.env.ANIME_CACHE_TTL_MS || 10 * 60 * 1000);
const searchCache = new Map();
const animeCache = new Map();

async function getHealthyProviders() {
  const now = Date.now();
  if (providerHealthCache.expiresAt > now && providerHealthCache.providers.length) return providerHealthCache.providers;
  providerHealthCache.providers = [...ACTIVE_PROVIDERS];
  providerHealthCache.expiresAt = now + 2 * 60 * 1000;
  return providerHealthCache.providers;
}

const resolveProviderName = (requestedProvider) => {
  const requested = (typeof requestedProvider === 'string' ? requestedProvider : '').toLowerCase().trim();
  const resolved = DEFAULT_PROVIDER;
  const usedFallback = !requested || requested !== resolved;
  if (usedFallback) {
    console.warn(`[provider-fallback] requested="${requested || 'none'}" -> using "${resolved}"`);
  }
  return { requested, resolved, usedFallback };
};

const getCacheEntry = (cache, key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.value;
};

const setCacheEntry = (cache, key, value, ttlMs) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

const isPlayableMediaUrl = (value) =>
  typeof value === 'string' &&
  /^https?:\/\//i.test(value) &&
  (/\.m3u8($|\?)/i.test(value) || /\.(mp4|webm|mkv|mov)($|\?)/i.test(value));

function filterPlayableSources(sources) {
  return (sources || [])
    .map((item) => ({
      url: typeof item === 'string' ? item : item?.url || item?.file || item?.src,
      quality: typeof item === 'object' && item ? (item.quality || item.label || item.resolution || 'default') : 'default',
    }))
    .filter((item) => item.url && isPlayableMediaUrl(item.url));
}

// ══════════════════════════════════════════════
// Routes
// ══════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Animeprix Backend is running' });
});

// ─── List providers (AnimePahe-only active set)
app.get('/api/providers', async (req, res) => {
  const providers = await getHealthyProviders();
  res.json({
    providers,
    defaultProvider: DEFAULT_PROVIDER,
    inactiveProviders: ['animeunity', 'hianime', 'animekai', 'animesaturn', 'kickassanime', 'gogoanime', 'zoro'],
  });
});

// ─── Image proxy: bypass AnimePahe CDN anti-hotlinking (i.animepahe.si returns 403 without Referer).
// WHY: AnimePahe uses anti-leech CDN protection — they block requests that lack a whitelisted Referer/Origin
// so that only their own site can display images; direct browser requests from our frontend get 403.
// Consumer API only provides metadata; ALL third-party asset URLs must be proxied server-side.
app.get('/api/image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url query param is required' });
    }
    let target;
    try {
      target = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid url parameter' });
    }
    if (!['http:', 'https:'].includes(target.protocol)) {
      return res.status(400).json({ error: 'Only http/https URLs are allowed' });
    }

    const imageHeaderCandidates = [
      {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://animepahe.si/',
        Origin: 'https://animepahe.si',
        Accept: 'image/webp,image/*,*/*',
      },
      {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://animepahe.ru/',
        Origin: 'https://animepahe.ru',
        Accept: 'image/webp,image/*,*/*',
      },
    ];

    let response = null;
    for (const headers of imageHeaderCandidates) {
      const attempted = await axios.get(target.toString(), {
        headers,
        responseType: 'arraybuffer',
        timeout: 15000,
        validateStatus: () => true,
      });
      response = attempted;
      if (attempted.status < 400) break;
    }

    if (response.status === 403) {
      console.log('[IMAGE PROXY] 403 from upstream:', target.toString());
      return res.status(502).json({ error: 'PROVIDER_BLOCKED' });
    }
    if (response.status >= 400) {
      return res.status(response.status).json({ error: 'PROVIDER_BLOCKED' });
    }

    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(Buffer.from(response.data));
  } catch (err) {
    console.error('[IMAGE PROXY]', err.message);
    res.status(502).json({ error: 'PROVIDER_BLOCKED' });
  }
});

// ─── Search (always resolves to AnimePahe)
app.get('/api/search', async (req, res) => {
  const searchQuery = req.query.q || req.query.query;
  const providerResolution = resolveProviderName(req.query.provider);

  if (!searchQuery) return res.status(400).json({ error: 'Search query is required' });

  try {
    const provider = getProvider(providerResolution.resolved);
    console.log('Using provider:', providerResolution.resolved);

    const cacheKey = `${providerResolution.resolved}:${String(searchQuery).toLowerCase().trim()}`;
    const cached = getCacheEntry(searchCache, cacheKey);
    if (cached) return res.json(cached);

    const data = await provider.search(searchQuery);
    const results = (data.results || []).map((a) => ({
      id: a.id,
      title: a.title,
      name: a.title,
      image: a.poster,
      coverImage: a.poster,
      description: a.description,
      episodes: a.episodeCount,
      releaseDate: a.releaseDate,
      status: a.status,
      genre: a.genre || [],
      provider: providerResolution.resolved,
      providerId: a.providerId,
    }));
    const payload = {
      results,
      provider: providerResolution.resolved,
      usedFallbackProvider: providerResolution.usedFallback,
    };
    setCacheEntry(searchCache, cacheKey, payload, SEARCH_TTL_MS);
    return res.json(payload);
  } catch (err) {
    console.error('Search error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'SEARCH_FAILED',
      message: 'Search failed',
      provider: providerResolution.resolved,
      details: err.message,
      results: [],
    });
  }
});

// ─── Anime info (always resolves to AnimePahe)
app.get('/api/anime/:id', async (req, res) => {
  const { id } = req.params;
  const providerResolution = resolveProviderName(req.query.provider);

  try {
    const provider = getProvider(providerResolution.resolved);
    console.log('Using provider:', providerResolution.resolved);

    const cacheKey = `${providerResolution.resolved}:${id}`;
    const cached = getCacheEntry(animeCache, cacheKey);
    if (cached) return res.json(cached);

    const data = await provider.getAnime(id);
    const payload = {
      id: data.id,
      title: data.title,
      image: data.poster,
      description: data.description,
      episodes: data.episodes || [],
      episodeCount: data.episodeCount,
      provider: providerResolution.resolved,
      providerId: data.providerId,
      releaseDate: data.releaseDate,
      status: data.status,
      genre: data.genre || [],
      usedFallbackProvider: providerResolution.usedFallback,
    };
    setCacheEntry(animeCache, cacheKey, payload, ANIME_TTL_MS);
    res.json(payload);
  } catch (err) {
    console.error('Anime route error:', err.message);
    return res.status(502).json({
      success: false,
      error: 'PROVIDER_UNAVAILABLE',
      message: 'Currently using fallback provider (AnimePahe)',
      provider: providerResolution.resolved,
      details: err.message,
    });
  }
});

// ─── Watch / stream links (always resolves to AnimePahe)
app.get('/api/watch', async (req, res) => {
  const { episodeId } = req.query;
  const providerResolution = resolveProviderName(req.query.provider);

  if (!episodeId) return res.status(400).json({ error: 'episodeId required' });

  try {
    const provider = getProvider(providerResolution.resolved);
    console.log('Using provider:', providerResolution.resolved);
    const data = await provider.getStream(episodeId);
    const playableSources = filterPlayableSources(data.sources);
    if (!playableSources.length) {
      return res.status(502).json({
        success: false,
        error: 'PROVIDER_UNAVAILABLE',
        provider: providerResolution.resolved,
        message: 'No playable stream URLs returned',
      });
    }
    const mp4Sources = playableSources.filter((s) => /\.mp4($|\?)/i.test(s.url));
    const hlsSources = playableSources.filter((s) => /\.m3u8($|\?)/i.test(s.url));
    const orderedSources = [...mp4Sources, ...hlsSources, ...playableSources.filter((s) => !mp4Sources.includes(s) && !hlsSources.includes(s))];
    const sourcesWithFallback = orderedSources.map((source) => ({
      ...source,
      // Direct URL first for low-latency startup; proxy remains available as fallback.
      proxyUrl: `${req.protocol}://${req.get('host')}/api/stream?url=${encodeURIComponent(source.url)}`,
    }));
    res.json({
      headers: data.headers || {},
      sources: sourcesWithFallback,
      provider: providerResolution.resolved,
      usedFallbackProvider: providerResolution.usedFallback,
      playbackMode: 'direct-preferred',
    });
  } catch (err) {
    console.error('Watch error:', err.message);
    return res.status(502).json({
      success: false,
      error: 'PROVIDER_UNAVAILABLE',
      message: 'Currently using fallback provider (AnimePahe)',
      provider: providerResolution.resolved,
      details: err.message,
    });
  }
});

// ─── Media stream proxy (handles CORS/referer-protected media)
const buildProxyUrl = (req, targetUrl) =>
  `${req.protocol}://${req.get('host')}/api/stream?url=${encodeURIComponent(targetUrl)}`;

// HLS segment/key proxy URL — segments must go through /api/hls so Content-Type is video/mp2t (fixes bufferAppendError).
const buildHlsProxyUrl = (req, targetUrl) =>
  `${req.protocol}://${req.get('host')}/api/hls?url=${encodeURIComponent(targetUrl)}`;

const rewriteM3u8Manifest = (manifestText, baseUrl, req) => {
  // Rewrite key URIs in tags: #EXT-X-KEY:...URI="..." — key fetches go through HLS proxy too.
  const withRewrittenUris = manifestText.replace(/URI="([^"]+)"/g, (_, rawUri) => {
    const absolute = new URL(rawUri, baseUrl).toString();
    return `URI="${buildHlsProxyUrl(req, absolute)}"`;
  });

  // Rewrite segment and nested playlist lines to /api/hls so browser gets correct Content-Type and no 403.
  return withRewrittenUris
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      const absolute = new URL(trimmed, baseUrl).toString();
      return buildHlsProxyUrl(req, absolute);
    })
    .join('\n');
};

// ─── HLS segment/key proxy: fetch with provider headers, stream back with correct Content-Type (fixes HLS bufferAppendError/mediaError).
app.get('/api/hls', async (req, res) => {
  try {
    // Proxy routes may be fetched directly by media players.
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url query param is required' });
    }
    let target;
    try {
      target = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid url parameter' });
    }
    if (!['http:', 'https:'].includes(target.protocol)) {
      return res.status(400).json({ error: 'Only http/https URLs are allowed' });
    }

    const upstreamHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Referer: 'https://kwik.cx/',
      Origin: 'https://kwik.cx',
      Accept: '*/*',
    };
    if (req.headers.range) upstreamHeaders.Range = req.headers.range;

    const targetUrl = target.toString();
    const response = await axios.get(targetUrl, {
      headers: upstreamHeaders,
      responseType: 'stream',
      timeout: 30000,
      validateStatus: () => true,
    });

    if (response.status === 403) {
      console.log('[HLS PROXY] 403 from upstream:', targetUrl);
      return res.status(502).json({ error: 'PROVIDER_BLOCKED' });
    }
    if (response.status >= 400) {
      return res.status(502).json({ error: 'PROVIDER_BLOCKED' });
    }

    const path = target.pathname.toLowerCase();
    const isKey = path.endsWith('.key') || path.includes('.key?') || path.includes('/key');
    const isManifest = path.endsWith('.m3u8') || path.includes('.m3u8?');

    // Some upstreams return wrong segment MIME (e.g. image/jpeg for TS-like chunks).
    // For HLS proxy, force stable MIME so browser/Hls.js can append segments.
    if (isKey) {
      res.setHeader('Content-Type', 'application/octet-stream');
    } else if (isManifest) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    } else {
      res.setHeader('Content-Type', 'video/mp2t');
    }

    const passHeaders = ['content-length', 'accept-ranges', 'content-range', 'cache-control'];
    passHeaders.forEach((header) => {
      const value = response.headers[header];
      if (value) res.setHeader(header, value);
    });
    if (!res.getHeader('Cache-Control')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }

    res.status(response.status);
    response.data.pipe(res);
  } catch (err) {
    console.error('[HLS PROXY]', err.message);
    res.status(502).json({ error: 'PROVIDER_BLOCKED' });
  }
});

app.get('/api/stream', async (req, res) => {
  try {
    // Proxy routes may be fetched directly by media players.
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url query param is required' });
    }

    let target;
    try {
      target = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid url parameter' });
    }

    if (!['http:', 'https:'].includes(target.protocol)) {
      return res.status(400).json({ error: 'Only http/https URLs are allowed' });
    }

    const upstreamHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Referer: 'https://kwik.cx/',
      Origin: 'https://kwik.cx',
      Accept: '*/*',
    };

    if (req.headers.range) {
      upstreamHeaders.Range = req.headers.range;
    }

    const targetUrl = target.toString();
    const isM3u8 = target.pathname.endsWith('.m3u8');

    if (isM3u8) {
      const upstream = await axios.get(targetUrl, {
        headers: upstreamHeaders,
        responseType: 'text',
        timeout: 45000,
        validateStatus: () => true,
      });

      if (upstream.status === 403) {
        console.log('[STREAM PROXY] 403 from upstream (manifest):', targetUrl);
        return res.status(502).json({ error: 'PROVIDER_BLOCKED' });
      }
      if (upstream.status >= 400) {
        return res.status(502).json({ error: 'PROVIDER_BLOCKED' });
      }

      const rewritten = rewriteM3u8Manifest(upstream.data, targetUrl, req);
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(rewritten);
    }

    const upstream = await axios.get(targetUrl, {
      headers: upstreamHeaders,
      responseType: 'stream',
      timeout: 90000,
      validateStatus: () => true,
    });

    if (upstream.status === 403) {
      console.log('[STREAM PROXY] 403 from upstream (binary):', targetUrl);
      return res.status(502).json({ error: 'PROVIDER_BLOCKED' });
    }
    if (upstream.status >= 400) {
      let body = '';
      upstream.data.on('data', (chunk) => {
        if (body.length < 500) body += chunk.toString();
      });
      upstream.data.on('end', () => {
        if (!res.headersSent) {
          res.status(502).json({ error: 'PROVIDER_BLOCKED' });
        }
      });
      return;
    }

    const passHeaders = [
      'content-type',
      'content-length',
      'accept-ranges',
      'content-range',
      'cache-control',
      'last-modified',
      'etag',
    ];

    passHeaders.forEach((header) => {
      const value = upstream.headers[header];
      if (value) res.setHeader(header, value);
    });

    // Some CDNs return generic octet-stream for MP4/WebM; browsers (especially Safari)
    // are more reliable when media MIME is explicit.
    const guessedFile = (target.searchParams.get('file') || target.pathname || '').toLowerCase();
    const currentType = String(res.getHeader('content-type') || '').toLowerCase();
    const isGenericType = !currentType || currentType.includes('application/octet-stream');
    if (isGenericType) {
      if (guessedFile.includes('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (guessedFile.includes('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
      } else if (guessedFile.includes('.mkv')) {
        res.setHeader('Content-Type', 'video/x-matroska');
      }
    }

    if (!res.getHeader('Accept-Ranges')) {
      res.setHeader('Accept-Ranges', 'bytes');
    }

    res.status(upstream.status);
    upstream.data.pipe(res);
  } catch (err) {
    console.error('STREAM PROXY ERROR:', err.message);
    res.status(500).json({ error: 'PROVIDER_BLOCKED' });
  }
});

// ─── Trending
app.get('/api/trending', async (req, res) => {
  try {
    const r = await axios.get('https://api.jikan.moe/v4/top/anime?limit=20', { timeout: 30000 });
    res.json({
      results: r.data.data.map(a => ({
        id: a.mal_id, title: a.title, name: a.title,
        image: a.images?.jpg?.image_url, coverImage: a.images?.jpg?.image_url,
        description: a.synopsis, episodes: a.episodes,
        releaseDate: a.aired?.from?.split('T')[0], status: a.status,
      }))
    });
  } catch (err) {
    console.error('Trending error:', err);
    res.status(500).json({ error: 'Failed to fetch trending', message: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

export { app, getHealthyProviders };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Animeprix Backend running on http://localhost:${PORT}`);
    console.log(`❤️  Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend origin: ${FRONTEND_ORIGIN}`);
    console.log(`🎬 Consumer API: ${API_BASE_URL}`);
    console.log(`📝 Providers (no fallback): ${listProviders().join(', ')}`);
  });
}