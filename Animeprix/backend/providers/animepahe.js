import axios from 'axios';
import { AnimeProvider } from './AnimeProvider.js';

const PROVIDER_NAME = 'animepahe';

/** AnimePahe adapter — Consumet API provider path "animepahe". No shared parsing. */
export class AnimePahe extends AnimeProvider {
  constructor(baseUrl, headers = {}) {
    super(PROVIDER_NAME);
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.headers = {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...headers,
    };
  }

  buildAnimeIdCandidates(rawId) {
    const base = String(rawId || '').trim();
    const candidates = new Set();
    if (!base) return [];
    candidates.add(base);

    // If a session ID accidentally arrives (<animeId>/<episodeSession>), recover animeId.
    if (base.includes('/')) {
      candidates.add(base.split('/')[0]);
    }

    // If a placeholder ID accidentally arrives (<animeId>-<number>), recover animeId.
    const placeholderTrimmed = base.replace(/-\d+$/, '');
    if (placeholderTrimmed && placeholderTrimmed !== base) {
      candidates.add(placeholderTrimmed);
    }

    return Array.from(candidates);
  }

  async fetchAnimeInfoWithFallback(id) {
    const candidates = this.buildAnimeIdCandidates(id);
    let lastStatus = null;

    for (const candidate of candidates) {
      const encoded = encodeURIComponent(candidate);
      const endpointCandidates = [
        `${this.baseUrl}/${PROVIDER_NAME}/info/${encoded}`,
        `${this.baseUrl}/${PROVIDER_NAME}/info/${encoded}?episodePage=1`,
      ];

      for (const url of endpointCandidates) {
        const res = await axios.get(url, {
          headers: this.headers,
          timeout: 30000,
          validateStatus: () => true,
        });
        if (res.status < 400) {
          return { data: res.data, resolvedAnimeId: candidate };
        }
        lastStatus = res.status;
      }
    }

    throw new Error(`AnimePahe getAnime failed: ${lastStatus ?? 'unknown'} (id=${id})`);
  }

  resolvePosterUrl(poster) {
    if (!poster || typeof poster !== 'string') return poster;
    try {
      return new URL(poster, this.baseUrl).href;
    } catch {
      return poster;
    }
  }

  async search(query) {
    const url = `${this.baseUrl}/${PROVIDER_NAME}/${encodeURIComponent(query)}`;
    const res = await axios.get(url, { headers: this.headers, timeout: 15000, validateStatus: () => true });
    if (res.status >= 400) throw new Error(`AnimePahe search failed: ${res.status}`);
    const raw = res.data;
    if (raw?.message && typeof raw.message === 'string') throw new Error(raw.message);
    const list = Array.isArray(raw) ? raw : raw?.results || raw?.data || [];
    return {
      results: list.map((a) => ({
        id: a.id,
        title: a.title || a.name,
        poster: this.resolvePosterUrl(a.image || a.coverImage || a.thumbnail || a.poster),
        episodeCount: a.episodes ?? a.totalEpisodes ?? 0,
        provider: PROVIDER_NAME,
        providerId: a.id,
        description: a.description || a.synopsis,
        releaseDate: a.releaseDate || a.aired,
        status: a.status,
        genre: a.genres || a.genre || [],
      })),
    };
  }

  async getAnime(id) {
    const { data: d, resolvedAnimeId } = await this.fetchAnimeInfoWithFallback(id);
    console.log('AnimePahe resolved anime id:', resolvedAnimeId, 'from:', id);
    if (d?.message && typeof d.message === 'string') throw new Error(d.message);
    const rawEpisodes = Array.isArray(d?.episodes)
      ? d.episodes
      : Array.isArray(d?.data?.episodes)
        ? d.data.episodes
        : Array.isArray(d?.episodes?.data)
          ? d.episodes.data
          : [];
    const episodes = rawEpisodes.map((ep, idx) => {
      const providerEpisodeId =
        ep.session ||
        ep.sessionId ||
        ep.providerEpisodeId ||
        ep?.episode?.session ||
        ep?.episode?.id ||
        ep?.episodeId ||
        (typeof ep.id === 'string' && ep.id.includes('/') ? ep.id : null) ||
        ep.id;
      return {
      id: providerEpisodeId,
      number: ep.number ?? ep.episode ?? idx + 1,
      title: ep.title || `Episode ${ep.number ?? idx + 1}`,
      episodeId: providerEpisodeId,
      providerEpisodeId,
      animeId: d.id || resolvedAnimeId || id,
    };
    }).filter((ep) => typeof ep.providerEpisodeId === 'string' && ep.providerEpisodeId.length > 0);

    if (!episodes.length) {
      console.error('AnimePahe info returned no episode session IDs:', JSON.stringify(d, null, 2));
    }
    return {
      id: d.id || id,
      title: d.title,
      poster: this.resolvePosterUrl(d.image || d.poster || d.coverImage),
      description: d.description,
      episodeCount: d.totalEpisodes ?? episodes.length,
      provider: PROVIDER_NAME,
      providerId: d.id || resolvedAnimeId || id,
      releaseDate: d.releaseDate,
      status: d.status,
      genre: d.genres || d.genre || [],
      episodes,
    };
  }

  async getEpisodes(id) {
    const anime = await this.getAnime(id);
    return anime.episodes || [];
  }

  async getStream(episodeId) {
    console.log('Episode ID Sent:', episodeId);
    const encodedEpisodeId = encodeURIComponent(episodeId);
    const pathUrl = `${this.baseUrl}/${PROVIDER_NAME}/watch/${encodedEpisodeId}`;
    const queryUrl = `${this.baseUrl}/${PROVIDER_NAME}/watch?episodeId=${encodedEpisodeId}`;

    // Prefer path-style /watch/{session}; fallback to query-style for compatibility.
    let res = await axios.get(pathUrl, { headers: this.headers, timeout: 30000, validateStatus: () => true });
    if (res.status >= 400) {
      res = await axios.get(queryUrl, { headers: this.headers, timeout: 30000, validateStatus: () => true });
    }
    if (res.status >= 400) throw new Error(`AnimePahe getStream failed: ${res.status}`);

    const d = res.data || {};
    console.log('RAW STREAM RESPONSE:', JSON.stringify(d, null, 2));

    const rawSources = Array.isArray(d.sources)
      ? d.sources
      : Array.isArray(d?.data?.sources)
        ? d.data.sources
        : [];

    if (!Array.isArray(d.sources) && !Array.isArray(d?.data?.sources)) {
      console.error('Provider returned no sources:', d);
    }

    const normalizedFromSources = rawSources
      .map((s) => ({
        url: s?.url || s?.file || s?.src,
        quality: s?.quality || 'default',
      }))
      .filter((s) => s.url && /^https?:\/\//i.test(s.url));

    const normalizedFromLinks = (Array.isArray(d.links) ? d.links : [])
      .map((s) => ({
        url: s?.url || s?.file || s?.src,
        quality: s?.quality || 'default',
      }))
      .filter((s) => s.url && /^https?:\/\//i.test(s.url));

    const normalizedFromDownload = (Array.isArray(d.download) ? d.download : [])
      .map((s) => ({
        url: s?.url || s?.file || s?.src,
        quality: s?.quality || 'default',
      }))
      .filter((s) => s.url && /^https?:\/\//i.test(s.url));

    const sources = [
      // Prefer direct MP4 download links first to avoid fragile HLS codec support.
      ...normalizedFromDownload,
      ...normalizedFromSources,
      ...normalizedFromLinks,
      ...(d.url && /^https?:\/\//i.test(d.url) ? [{ url: d.url, quality: 'default' }] : []),
    ];

    // Never throw for empty sources; route-level fallback handling will decide response.
    return { sources, headers: d.headers || {} };
  }
}
