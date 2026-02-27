import axios from 'axios';
import { AnimeProvider } from './AnimeProvider.js';

const PROVIDER_NAME = 'animeunity';

/** AnimeUnity adapter — Consumet API provider path "animeunity". No shared parsing. */
export class AnimeUnity extends AnimeProvider {
  constructor(baseUrl, headers = {}) {
    super(PROVIDER_NAME);
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.headers = {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...headers,
    };
  }

  async search(query) {
    const url = `${this.baseUrl}/${PROVIDER_NAME}/${encodeURIComponent(query)}`;
    const res = await axios.get(url, { headers: this.headers, timeout: 15000, validateStatus: () => true });
    if (res.status >= 400) throw new Error(`AnimeUnity search failed: ${res.status}`);
    const raw = res.data;
    const list = Array.isArray(raw) ? raw : raw?.results || raw?.data || [];
    return {
      results: list.map((a) => ({
        id: a.id,
        title: a.title || a.name,
        poster: a.image || a.coverImage || a.thumbnail,
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
    const url = `${this.baseUrl}/${PROVIDER_NAME}/info/${id}`;
    const res = await axios.get(url, { headers: this.headers, timeout: 30000, validateStatus: () => true });
    if (res.status >= 400) throw new Error(`AnimeUnity getAnime failed: ${res.status}`);
    const d = res.data;
    const episodes = (d.episodes || []).map((ep, idx) => ({
      id: ep.id || ep.episodeId,
      number: ep.number ?? ep.episode ?? idx + 1,
      title: ep.title || `Episode ${ep.number ?? idx + 1}`,
      episodeId: ep.id || ep.episodeId,
      animeId: d.id || id,
    }));
    return {
      id: d.id || id,
      title: d.title,
      poster: d.image,
      description: d.description,
      episodeCount: episodes.length,
      provider: PROVIDER_NAME,
      providerId: d.id || id,
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
    const url = `${this.baseUrl}/${PROVIDER_NAME}/watch?episodeId=${encodeURIComponent(episodeId)}`;
    const res = await axios.get(url, { headers: this.headers, timeout: 30000, validateStatus: () => true });
    if (res.status >= 400) throw new Error(`AnimeUnity getStream failed: ${res.status}`);
    const d = res.data;
    const sources = [
      ...(Array.isArray(d.sources) ? d.sources : []),
      ...(Array.isArray(d.links) ? d.links : []),
      ...(Array.isArray(d.download) ? d.download.map((x) => ({ url: x.url, quality: x.quality })) : []),
      ...(d.url ? [{ url: d.url, quality: 'default' }] : []),
    ].filter((s) => s?.url && /^https?:\/\//i.test(s.url));
    return { sources, headers: d.headers || {} };
  }
}
