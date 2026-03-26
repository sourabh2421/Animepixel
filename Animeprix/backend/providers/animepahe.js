import axios from 'axios';
import { AnimeProvider } from './AnimeProvider.js';

const PROVIDER_NAME = 'animepahe';
const ANIMEPAHE_SITE = 'https://animepahe.ru';
const ANIMEPAHE_API = `${ANIMEPAHE_SITE}/api`;
const ANIMEPAHE_API_CANDIDATES = [ANIMEPAHE_API, 'https://animepahe.com/api'];

/** AnimePahe adapter — direct AnimePahe API integration (no local Consumet dependency). */
export class AnimePahe extends AnimeProvider {
  constructor(baseUrl, headers = {}) {
    super(PROVIDER_NAME);
    this.baseUrl = (baseUrl || '').replace(/\/$/, '');
    this.siteBaseUrl = ANIMEPAHE_SITE;
    this.apiBaseUrl = ANIMEPAHE_API;
    this.headers = {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...headers,
    };
  }

  async requestAnimePahe(params, timeout = 20000) {
    let lastError = null;
    for (const candidate of ANIMEPAHE_API_CANDIDATES) {
      try {
        const res = await axios.get(candidate, {
          params,
          headers: {
            ...this.headers,
            Referer: `${ANIMEPAHE_SITE}/`,
            Origin: ANIMEPAHE_SITE,
          },
          timeout,
          validateStatus: () => true,
        });
        if (res.status < 400) return res.data || {};
        lastError = new Error(`AnimePahe API failed: ${res.status}`);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('AnimePahe API request failed');
  }

  extractStreamUrls(raw) {
    const collected = [];
    const visited = new Set();
    const walk = (value) => {
      if (!value) return;
      if (typeof value === 'string') {
        if (/^https?:\/\//i.test(value)) collected.push(value);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }
      if (typeof value === 'object') {
        if (visited.has(value)) return;
        visited.add(value);
        Object.values(value).forEach(walk);
      }
    };
    walk(raw);
    const seen = new Set();
    return collected.filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }

  resolvePosterUrl(poster) {
    if (!poster || typeof poster !== 'string') return poster;
    try {
      return new URL(poster, this.siteBaseUrl).href;
    } catch {
      return poster;
    }
  }

  parseAnimeId(rawId) {
    const input = String(rawId || '').trim();
    if (!input) return '';
    if (input.includes('/')) return input.split('/')[0];
    return input.replace(/-\d+$/, '');
  }

  async fetchReleasePages(animeId) {
    const first = await this.requestAnimePahe({
      m: 'release',
      id: animeId,
      sort: 'episode_asc',
      page: 1,
    }, 30000);

    const pages = [first];
    const lastPage = Math.min(Number(first?.last_page || 1), 15);
    for (let page = 2; page <= lastPage; page += 1) {
      const next = await this.requestAnimePahe({
        m: 'release',
        id: animeId,
        sort: 'episode_asc',
        page,
      }, 30000);
      pages.push(next);
    }
    return pages;
  }

  async search(query) {
    try {
      const raw = await this.requestAnimePahe({ m: 'search', q: query }, 20000);
      const list = Array.isArray(raw?.data) ? raw.data : [];
      return {
        results: list.map((a) => ({
          id: String(a?.id || a?.session || ''),
          title: a?.title || a?.name || '',
          poster: this.resolvePosterUrl(a?.poster || a?.image || a?.snapshot),
          episodeCount: a?.episodes ?? a?.episodeCount ?? 0,
          provider: PROVIDER_NAME,
          providerId: String(a?.id || ''),
          description: a?.description || '',
          releaseDate: a?.year || a?.releaseDate,
          status: a?.status,
          genre: a?.genres || a?.genre || [],
        })).filter((item) => item.id && item.title),
      };
    } catch (error) {
      console.error('Search failed:', error.message);
      throw new Error(`AnimePahe search failed: ${error.message}`);
    }
  }

  async getAnime(id) {
    const animeId = this.parseAnimeId(id);
    if (!animeId) throw new Error('AnimePahe getAnime failed: invalid id');

    try {
      const pages = await this.fetchReleasePages(animeId);
      const rawEpisodes = pages.flatMap((page) => (Array.isArray(page?.data) ? page.data : []));
      const firstPage = pages[0] || {};
      const episodes = rawEpisodes.map((ep, idx) => {
        const episodeSession = String(ep?.session || ep?.episode_session || '').trim();
        if (!episodeSession) return null;
        const compositeEpisodeId = `${animeId}/${episodeSession}`;
        return {
          id: compositeEpisodeId,
          number: Number(ep?.episode || ep?.number || idx + 1),
          title: ep?.title || `Episode ${ep?.episode || idx + 1}`,
          episodeId: compositeEpisodeId,
          providerEpisodeId: compositeEpisodeId,
          animeId: String(ep?.anime_id || animeId),
        };
      }).filter(Boolean);

      return {
        id: animeId,
        title: firstPage?.anime_title || firstPage?.title || `Anime ${animeId}`,
        poster: this.resolvePosterUrl(firstPage?.poster || firstPage?.image || rawEpisodes[0]?.snapshot),
        description: firstPage?.description || '',
        episodeCount: Number(firstPage?.total || episodes.length || 0),
        provider: PROVIDER_NAME,
        providerId: animeId,
        releaseDate: firstPage?.year || firstPage?.releaseDate,
        status: firstPage?.status,
        genre: firstPage?.genres || [],
        episodes,
      };
    } catch (error) {
      console.error('AnimePahe getAnime failed:', error.message);
      throw new Error(`AnimePahe getAnime failed: ${error.message}`);
    }
  }

  async getEpisodes(id) {
    const anime = await this.getAnime(id);
    return anime.episodes || [];
  }

  async getStream(episodeId) {
    console.log('Episode ID Sent:', episodeId);
    const raw = String(episodeId || '').trim();
    if (!raw) throw new Error('AnimePahe getStream failed: missing episode id');

    try {
      const [animeIdFromEpisode, episodeSessionFromEpisode] = raw.includes('/') ? raw.split('/') : ['', raw];
      const animeId = this.parseAnimeId(animeIdFromEpisode);
      const episodeSession = String(episodeSessionFromEpisode || '').trim();
      const requestVariants = [
        animeId && episodeSession ? { m: 'links', id: animeId, session: episodeSession, p: 'kwik' } : null,
        animeId && episodeSession ? { m: 'links', id: animeId, session: episodeSession } : null,
        episodeSession ? { m: 'links', session: episodeSession, p: 'kwik' } : null,
      ].filter(Boolean);

      let payload = null;
      let lastError = null;
      for (const params of requestVariants) {
        try {
          payload = await this.requestAnimePahe(params, 30000);
          if (payload) break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!payload) {
        throw lastError || new Error('No stream payload from AnimePahe');
      }

      const rawUrls = this.extractStreamUrls(payload);
      const sources = rawUrls
        .filter((url) => /^https?:\/\//i.test(url))
        .map((url) => ({
          url,
          quality: /\.m3u8($|\?)/i.test(url) ? 'hls' : 'default',
        }));

      console.log('RAW STREAM RESPONSE:', JSON.stringify(payload, null, 2));
      if (!sources.length) {
        throw new Error('No stream URLs returned');
      }

      return {
        sources,
        headers: {
          Referer: this.siteBaseUrl,
          Origin: this.siteBaseUrl,
        },
      };
    } catch (error) {
      console.error('AnimePahe getStream failed:', error.message);
      throw new Error(`AnimePahe getStream failed: ${error.message}`);
    }
  }
}
