import { jest, describe, beforeAll, afterAll, beforeEach, test, expect } from '@jest/globals';
import request from 'supertest';
import { Readable } from 'node:stream';
import axios from 'axios';
import { app } from '../server.js';
import { listProviders, getProvider } from '../providers/index.js';

const providerNames = listProviders();
const originalProviderMethods = new Map();

function snapshotProviderMethods() {
  for (const name of providerNames) {
    const provider = getProvider(name);
    originalProviderMethods.set(name, {
      search: provider.search,
      getAnime: provider.getAnime,
      getStream: provider.getStream,
    });
  }
}

function restoreProviderMethods() {
  for (const name of providerNames) {
    const provider = getProvider(name);
    const original = originalProviderMethods.get(name);
    provider.search = original.search;
    provider.getAnime = original.getAnime;
    provider.getStream = original.getStream;
  }
}

function mockAllProvidersHealthy() {
  for (const name of providerNames) {
    const provider = getProvider(name);
    provider.search = jest.fn(async (q) => ({
      results: [
        {
          id: `${name}-anime-1`,
          title: `Mock ${name} ${q}`,
          poster: 'https://cdn.example.com/poster.jpg',
          episodeCount: 12,
          provider: name,
          providerId: `${name}-anime-1`,
        },
      ],
    }));
    provider.getAnime = jest.fn(async (id) => ({
      id,
      title: `Mock ${name} Anime`,
      poster: 'https://cdn.example.com/poster.jpg',
      description: 'mock description',
      episodeCount: 2,
      provider: name,
      providerId: id,
      episodes: [
        { id: `${id}/ep1`, episodeId: `${id}/ep1`, number: 1, title: 'Episode 1' },
        { id: `${id}/ep2`, episodeId: `${id}/ep2`, number: 2, title: 'Episode 2' },
      ],
    }));
    provider.getStream = jest.fn(async () => ({
      headers: {},
      sources: [
        { url: 'https://cdn.example.com/video.mp4', quality: '720p' },
        { url: 'https://cdn.example.com/playlist.m3u8', quality: 'auto' },
      ],
    }));
  }
}

describe('API endpoint coverage', () => {
  beforeAll(() => {
    snapshotProviderMethods();
  });

  beforeEach(() => {
    restoreProviderMethods();
    mockAllProvidersHealthy();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    restoreProviderMethods();
  });

  test('GET /api/providers returns available providers', async () => {
    const res = await request(app).get('/api/providers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.providers)).toBe(true);
    expect(res.body.providers.length).toBeGreaterThan(0);
  });

  test('GET /api/search valid request', async () => {
    const res = await request(app).get('/api/search').query({ q: 'naruto', provider: 'animepahe' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results[0]).toHaveProperty('id');
  });

  test('GET /api/search missing query', async () => {
    const res = await request(app).get('/api/search').query({ provider: 'animepahe' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Search query');
  });

  test('GET /api/search missing provider falls back to animepahe', async () => {
    const res = await request(app).get('/api/search').query({ q: 'naruto' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.provider).toBe('animepahe');
  });

  test('GET /api/search external failure simulation', async () => {
    const p = getProvider('animepahe');
    p.search = jest.fn(async () => {
      throw new Error('upstream 500');
    });
    const res = await request(app).get('/api/search').query({ q: 'naruto-failure-case', provider: 'animepahe' });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe('PROVIDER_UNAVAILABLE');
  });

  test('GET /api/search timeout simulation', async () => {
    const p = getProvider('animepahe');
    p.search = jest.fn(async () => {
      throw new Error('timeout of 15000ms exceeded');
    });
    const res = await request(app).get('/api/search').query({ q: 'naruto-timeout-case', provider: 'animepahe' });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe('PROVIDER_UNAVAILABLE');
  });

  test('GET /api/watch valid request', async () => {
    const res = await request(app)
      .get('/api/watch')
      .query({ provider: 'animepahe', episodeId: 'animepahe-anime-1/ep1' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.sources)).toBe(true);
  });

  test('GET /api/watch missing episodeId', async () => {
    const res = await request(app).get('/api/watch').query({ provider: 'animepahe' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('episodeId');
  });

  test('GET /api/watch missing provider falls back to animepahe', async () => {
    const res = await request(app).get('/api/watch').query({ episodeId: 'a/b' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.sources)).toBe(true);
  });

  test('GET /api/watch empty sources returns provider failed', async () => {
    const p = getProvider('animepahe');
    p.getStream = jest.fn(async () => ({ headers: {}, sources: [] }));
    const res = await request(app).get('/api/watch').query({ provider: 'animepahe', episodeId: 'a/b' });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe('PROVIDER_UNAVAILABLE');
  });

  test('GET /api/watch timeout simulation', async () => {
    const p = getProvider('animepahe');
    p.getStream = jest.fn(async () => {
      throw new Error('timeout of 15000ms exceeded');
    });
    const res = await request(app).get('/api/watch').query({ provider: 'animepahe', episodeId: 'a/b' });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe('PROVIDER_UNAVAILABLE');
  });

  test('GET /api/image valid request', async () => {
    const data = Buffer.from('image-data');
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 200,
      headers: { 'content-type': 'image/jpeg' },
      data,
    });
    const res = await request(app).get('/api/image').query({ url: 'https://cdn.example.com/a.jpg' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/jpeg');
  });

  test('GET /api/image invalid params', async () => {
    const missing = await request(app).get('/api/image');
    expect(missing.status).toBe(400);
    const invalid = await request(app).get('/api/image').query({ url: 'not-a-url' });
    expect(invalid.status).toBe(400);
    const badProtocol = await request(app).get('/api/image').query({ url: 'ftp://bad' });
    expect(badProtocol.status).toBe(400);
  });

  test('GET /api/image external failure and timeout simulation', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 403,
      headers: {},
      data: Buffer.from(''),
    });
    const blocked = await request(app).get('/api/image').query({ url: 'https://cdn.example.com/a.jpg' });
    expect(blocked.status).toBe(502);

    jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('timeout of 15000ms exceeded'));
    const timeout = await request(app).get('/api/image').query({ url: 'https://cdn.example.com/a.jpg' });
    expect(timeout.status).toBe(502);
  });

  test('GET /api/hls valid request', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 200,
      headers: {
        'content-length': '6',
        'accept-ranges': 'bytes',
      },
      data: Readable.from(['abcdef']),
    });
    const res = await request(app).get('/api/hls').query({ url: 'https://cdn.example.com/segment-1.jpg' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('video/mp2t');
  });

  test('GET /api/hls invalid params', async () => {
    const missing = await request(app).get('/api/hls');
    expect(missing.status).toBe(400);
    const invalid = await request(app).get('/api/hls').query({ url: 'not-a-url' });
    expect(invalid.status).toBe(400);
    const badProtocol = await request(app).get('/api/hls').query({ url: 'ftp://bad' });
    expect(badProtocol.status).toBe(400);
  });

  test('GET /api/hls external failure and timeout simulation', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 403,
      headers: {},
      data: Readable.from(['']),
    });
    const blocked = await request(app).get('/api/hls').query({ url: 'https://cdn.example.com/seg.ts' });
    expect(blocked.status).toBe(502);

    jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('timeout of 30000ms exceeded'));
    const timeout = await request(app).get('/api/hls').query({ url: 'https://cdn.example.com/seg.ts' });
    expect(timeout.status).toBe(502);
  });

  test('GET /api/stream valid m3u8 rewrite', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 200,
      headers: { 'content-type': 'application/vnd.apple.mpegurl' },
      data: '#EXTM3U\n#EXTINF:5,\nsegment-1.ts\n',
    });
    const res = await request(app).get('/api/stream').query({ url: 'https://cdn.example.com/playlist.m3u8' });
    expect(res.status).toBe(200);
    expect(res.text).toContain('/api/hls?url=');
  });

  test('GET /api/stream valid binary stream', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 206,
      headers: { 'content-type': 'application/octet-stream', 'content-range': 'bytes 0-10/100' },
      data: Readable.from(['video-bytes']),
    });
    const res = await request(app)
      .get('/api/stream')
      .set('Range', 'bytes=0-10')
      .query({ url: 'https://cdn.example.com/video.mp4?file=demo.mp4' });
    expect(res.status).toBe(206);
    expect(res.headers['content-type']).toContain('video/mp4');
  });

  test('GET /api/stream invalid params', async () => {
    const missing = await request(app).get('/api/stream');
    expect(missing.status).toBe(400);
    const invalid = await request(app).get('/api/stream').query({ url: 'not-a-url' });
    expect(invalid.status).toBe(400);
    const badProtocol = await request(app).get('/api/stream').query({ url: 'ftp://bad' });
    expect(badProtocol.status).toBe(400);
  });

  test('GET /api/stream external failure and timeout simulation', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 403,
      headers: {},
      data: Readable.from(['']),
    });
    const blocked = await request(app).get('/api/stream').query({ url: 'https://cdn.example.com/video.mp4' });
    expect(blocked.status).toBe(502);

    jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('timeout of 90000ms exceeded'));
    const timeout = await request(app).get('/api/stream').query({ url: 'https://cdn.example.com/video.mp4' });
    expect(timeout.status).toBe(500);
  });
});
