import { describe, test, expect } from '@jest/globals';
import fs from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { app } from '../server.js';
import { listProviders, getProvider } from '../providers/index.js';

const REPORT_PATH = path.resolve(process.cwd(), 'test-results', 'reliability-report.json');

const resultLog = [];
const providerStats = new Map();
const apiStats = new Map();
const streamingStats = new Map();

function markResult({ testName, endpointOrProvider, area, status, reason = '' }) {
  resultLog.push({
    testName,
    endpointOrProvider,
    area,
    status,
    reason,
    at: new Date().toISOString(),
  });
}

function addStat(map, key, ok, note = '') {
  if (!map.has(key)) map.set(key, { success: 0, fail: 0, notes: [] });
  const item = map.get(key);
  if (ok) item.success += 1;
  else item.fail += 1;
  if (note) item.notes.push(note);
}

async function runWithTimeout(promise, ms, label) {
  return await Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timeout`)), ms)),
  ]);
}

async function gatherProviderReliability() {
  const providers = listProviders();
  for (const providerName of providers) {
    const provider = getProvider(providerName);
    if (!providerStats.has(providerName)) providerStats.set(providerName, { success: 0, fail: 0, notes: [] });
    let firstId = null;
    let firstEpisodeId = null;

    try {
      const search = await runWithTimeout(provider.search('demon slayer'), 15000, `${providerName} search`);
      const result = Array.isArray(search?.results) ? search.results[0] : null;
      firstId = result?.id || null;
      addStat(providerStats, providerName, true, 'search ok');
      markResult({ testName: 'provider search', endpointOrProvider: providerName, area: 'provider', status: 'PASS' });
    } catch (err) {
      addStat(providerStats, providerName, false, `search failed: ${err.message}`);
      markResult({
        testName: 'provider search',
        endpointOrProvider: providerName,
        area: 'provider',
        status: 'FAIL',
        reason: err.message,
      });
    }

    if (!firstId) {
      addStat(providerStats, providerName, false, 'anime details skipped (no search id)');
      markResult({
        testName: 'provider anime details',
        endpointOrProvider: providerName,
        area: 'provider',
        status: 'FAIL',
        reason: 'Not testable from code/runtime: no search result id',
      });
      addStat(providerStats, providerName, false, 'stream skipped (no episode id)');
      markResult({
        testName: 'provider stream',
        endpointOrProvider: providerName,
        area: 'provider',
        status: 'FAIL',
        reason: 'Not testable from code/runtime: no episode id',
      });
      continue;
    }

    try {
      const anime = await runWithTimeout(provider.getAnime(firstId), 20000, `${providerName} getAnime`);
      firstEpisodeId = anime?.episodes?.[0]?.id || anime?.episodes?.[0]?.episodeId || null;
      addStat(providerStats, providerName, true, 'anime details ok');
      markResult({ testName: 'provider anime details', endpointOrProvider: providerName, area: 'provider', status: 'PASS' });
    } catch (err) {
      addStat(providerStats, providerName, false, `anime details failed: ${err.message}`);
      markResult({
        testName: 'provider anime details',
        endpointOrProvider: providerName,
        area: 'provider',
        status: 'FAIL',
        reason: err.message,
      });
    }

    if (!firstEpisodeId) {
      addStat(providerStats, providerName, false, 'stream skipped (no episode id)');
      markResult({
        testName: 'provider stream',
        endpointOrProvider: providerName,
        area: 'provider',
        status: 'FAIL',
        reason: 'Not testable from code/runtime: no episode id from getAnime',
      });
      continue;
    }

    try {
      const stream = await runWithTimeout(provider.getStream(firstEpisodeId), 25000, `${providerName} getStream`);
      const hasSources = Array.isArray(stream?.sources) && stream.sources.length > 0;
      addStat(providerStats, providerName, hasSources, hasSources ? 'stream ok' : 'stream empty sources');
      markResult({
        testName: 'provider stream',
        endpointOrProvider: providerName,
        area: 'provider',
        status: hasSources ? 'PASS' : 'FAIL',
        reason: hasSources ? '' : 'Empty sources',
      });
    } catch (err) {
      addStat(providerStats, providerName, false, `stream failed: ${err.message}`);
      markResult({
        testName: 'provider stream',
        endpointOrProvider: providerName,
        area: 'provider',
        status: 'FAIL',
        reason: err.message,
      });
    }
  }
}

async function gatherApiReliability() {
  // /api/providers
  try {
    const res = await request(app).get('/api/providers');
    const ok = res.status === 200 && Array.isArray(res.body.providers);
    addStat(apiStats, '/api/providers', ok, `status ${res.status}`);
    markResult({ testName: 'api providers', endpointOrProvider: '/api/providers', area: 'api', status: ok ? 'PASS' : 'FAIL', reason: ok ? '' : res.text });
  } catch (err) {
    addStat(apiStats, '/api/providers', false, err.message);
    markResult({ testName: 'api providers', endpointOrProvider: '/api/providers', area: 'api', status: 'FAIL', reason: err.message });
  }

  // search -> anime -> watch flow for API reliability (uses best provider runtime can support)
  let pickedProvider = 'animepahe';
  let animeId = null;
  let episodeId = null;
  let firstSource = null;
  let hlsSource = null;
  let animeImage = null;

  try {
    const providersRes = await request(app).get('/api/providers');
    const list = providersRes.body?.providers || [];
    if (Array.isArray(list) && list.length) pickedProvider = list[0];
  } catch {
    // keep animepahe
  }

  try {
    const res = await request(app).get('/api/search').query({ q: 'demon slayer', provider: pickedProvider });
    const ok = res.status === 200 && Array.isArray(res.body.results);
    animeId = res.body?.results?.[0]?.id || null;
    addStat(apiStats, '/api/search', ok, `provider=${pickedProvider} status=${res.status}`);
    markResult({
      testName: 'api search',
      endpointOrProvider: '/api/search',
      area: 'api',
      status: ok ? 'PASS' : 'FAIL',
      reason: ok ? '' : res.text,
    });
  } catch (err) {
    addStat(apiStats, '/api/search', false, err.message);
    markResult({ testName: 'api search', endpointOrProvider: '/api/search', area: 'api', status: 'FAIL', reason: err.message });
  }

  if (!animeId) {
    addStat(apiStats, '/api/anime/:id', false, 'Not testable from code/runtime: no anime id from search');
    addStat(apiStats, '/api/watch', false, 'Not testable from code/runtime: no anime id from search');
    addStat(apiStats, '/api/image', false, 'Not testable from code/runtime: no anime info image');
    addStat(streamingStats, 'HLS', false, 'Not testable from code/runtime');
    addStat(streamingStats, 'MP4', false, 'Not testable from code/runtime');
    addStat(streamingStats, 'Broken stream handling', false, 'Not testable from code/runtime');
    return;
  }

  try {
    const res = await request(app).get(`/api/anime/${encodeURIComponent(animeId)}`).query({ provider: pickedProvider });
    const ok = res.status === 200;
    episodeId = res.body?.episodes?.[0]?.id || res.body?.episodes?.[0]?.episodeId || null;
    animeImage = res.body?.image || null;
    addStat(apiStats, '/api/anime/:id', ok, `provider=${pickedProvider} status=${res.status}`);
    markResult({
      testName: 'api anime details',
      endpointOrProvider: '/api/anime/:id',
      area: 'api',
      status: ok ? 'PASS' : 'FAIL',
      reason: ok ? '' : res.text,
    });
  } catch (err) {
    addStat(apiStats, '/api/anime/:id', false, err.message);
    markResult({ testName: 'api anime details', endpointOrProvider: '/api/anime/:id', area: 'api', status: 'FAIL', reason: err.message });
  }

  if (episodeId) {
    try {
      const res = await request(app).get('/api/watch').query({ provider: pickedProvider, episodeId });
      const ok = res.status === 200 && Array.isArray(res.body.sources);
      firstSource = res.body?.sources?.[0]?.url || null;
      addStat(apiStats, '/api/watch', ok, `provider=${pickedProvider} status=${res.status}`);
      markResult({
        testName: 'api watch',
        endpointOrProvider: '/api/watch',
        area: 'api',
        status: ok ? 'PASS' : 'FAIL',
        reason: ok ? '' : res.text,
      });

      const sources = res.body?.sources || [];
      const hls = sources.find((s) => String(s?.url || '').includes('.m3u8'));
      const mp4 = sources.find((s) => String(s?.url || '').includes('.mp4'));
      hlsSource = hls?.url || null;
      addStat(streamingStats, 'HLS', Boolean(hls), hls ? 'hls source present' : 'hls source missing');
      addStat(streamingStats, 'MP4', Boolean(mp4), mp4 ? 'mp4 source present' : 'mp4 source missing');
      addStat(streamingStats, 'Broken stream handling', !ok, ok ? 'watch endpoint healthy' : 'watch failed');
    } catch (err) {
      addStat(apiStats, '/api/watch', false, err.message);
      markResult({ testName: 'api watch', endpointOrProvider: '/api/watch', area: 'api', status: 'FAIL', reason: err.message });
      addStat(streamingStats, 'HLS', false, `watch failed: ${err.message}`);
      addStat(streamingStats, 'MP4', false, `watch failed: ${err.message}`);
      addStat(streamingStats, 'Broken stream handling', true, 'watch failed path covered');
    }
  } else {
    addStat(apiStats, '/api/watch', false, 'Not testable from code/runtime: no episode id');
    addStat(streamingStats, 'HLS', false, 'Not testable from code/runtime: no episode id');
    addStat(streamingStats, 'MP4', false, 'Not testable from code/runtime: no episode id');
    addStat(streamingStats, 'Broken stream handling', false, 'Not testable from code/runtime: no episode id');
  }

  if (animeImage) {
    try {
      const res = await request(app).get('/api/image').query({ url: animeImage });
      const ok = res.status === 200;
      addStat(apiStats, '/api/image', ok, `status=${res.status}`);
      markResult({ testName: 'api image', endpointOrProvider: '/api/image', area: 'api', status: ok ? 'PASS' : 'FAIL', reason: ok ? '' : res.text });
    } catch (err) {
      addStat(apiStats, '/api/image', false, err.message);
      markResult({ testName: 'api image', endpointOrProvider: '/api/image', area: 'api', status: 'FAIL', reason: err.message });
    }
  } else {
    addStat(apiStats, '/api/image', false, 'Not testable from code/runtime: no anime image');
  }

  const streamTarget = hlsSource || firstSource;
  if (streamTarget && String(streamTarget).includes('.m3u8')) {
    try {
      const res = await request(app).get('/api/stream').query({ url: streamTarget });
      const ok = res.status === 200 && String(res.headers['content-type']).includes('mpegurl');
      addStat(apiStats, '/api/stream', ok, `status=${res.status}`);
      markResult({ testName: 'api stream', endpointOrProvider: '/api/stream', area: 'api', status: ok ? 'PASS' : 'FAIL', reason: ok ? '' : res.text });

      const lines = String(res.text || '').split('\n');
      const firstSegmentProxy = lines.find((l) => l && !l.startsWith('#') && l.includes('/api/hls?url='));
      if (firstSegmentProxy) {
        const hlsPath = (() => {
          try {
            const parsed = new URL(firstSegmentProxy);
            return `${parsed.pathname}${parsed.search}`;
          } catch {
            return firstSegmentProxy;
          }
        })();
        const hlsRes = await request(app).get(hlsPath);
        const hlsOk = hlsRes.status === 200 || hlsRes.status === 206;
        addStat(apiStats, '/api/hls', hlsOk, `status=${hlsRes.status}`);
        markResult({ testName: 'api hls', endpointOrProvider: '/api/hls', area: 'api', status: hlsOk ? 'PASS' : 'FAIL', reason: hlsOk ? '' : hlsRes.text });
      } else {
        addStat(apiStats, '/api/hls', false, 'Not testable from code/runtime: no segment URL in manifest');
      }
    } catch (err) {
      addStat(apiStats, '/api/stream', false, err.message);
      markResult({ testName: 'api stream', endpointOrProvider: '/api/stream', area: 'api', status: 'FAIL', reason: err.message });
      addStat(apiStats, '/api/hls', false, `Not testable after stream failure: ${err.message}`);
    }
  } else {
    addStat(apiStats, '/api/stream', false, 'Not testable from code/runtime: no m3u8 source');
    addStat(apiStats, '/api/hls', false, 'Not testable from code/runtime: no m3u8 source');
  }
}

async function gatherFrontendFlowSimulation() {
  let flowOk = true;
  let reason = '';
  try {
    const providersRes = await request(app).get('/api/providers');
    const provider = providersRes.body?.providers?.[0] || 'animepahe';
    const search = await request(app).get('/api/search').query({ q: 'naruto', provider });
    const animeId = search.body?.results?.[0]?.id;
    if (!animeId) throw new Error('no anime id from search');
    const anime = await request(app).get(`/api/anime/${encodeURIComponent(animeId)}`).query({ provider });
    const episodeId = anime.body?.episodes?.[0]?.id || anime.body?.episodes?.[0]?.episodeId;
    if (!episodeId) throw new Error('no episode id from anime details');
    const watch = await request(app).get('/api/watch').query({ provider, episodeId });
    if (watch.status !== 200 || !Array.isArray(watch.body?.sources) || !watch.body.sources.length) {
      throw new Error(`watch failed status=${watch.status}`);
    }
  } catch (err) {
    flowOk = false;
    reason = err.message;
  }
  markResult({
    testName: 'frontend flow simulation (search->watch)',
    endpointOrProvider: 'frontend-simulated-via-api',
    area: 'frontend',
    status: flowOk ? 'PASS' : 'FAIL',
    reason,
  });
}

function computeSummary() {
  const total = resultLog.length;
  const failed = resultLog.filter((r) => r.status === 'FAIL').length;
  const passed = total - failed;
  const failurePct = total ? Number(((failed / total) * 100).toFixed(2)) : 0;

  const providerTable = Array.from(providerStats.entries()).map(([provider, v]) => {
    const totalProvider = v.success + v.fail;
    return {
      provider,
      success: v.success,
      fail: v.fail,
      successPct: totalProvider ? Number(((v.success / totalProvider) * 100).toFixed(2)) : 0,
      notes: v.notes,
    };
  });

  const apiTable = Array.from(apiStats.entries()).map(([endpoint, v]) => ({
    endpoint,
    success: v.success,
    fail: v.fail,
    notes: v.notes,
  }));

  const streamingTable = Array.from(streamingStats.entries()).map(([type, v]) => ({
    type,
    success: v.success,
    fail: v.fail,
    notes: v.notes,
  }));

  return {
    summary: {
      totalTests: total,
      passed,
      failed,
      failurePct,
    },
    providerReliability: providerTable,
    apiReliability: apiTable,
    streamingReliability: streamingTable,
    detailedResults: resultLog,
  };
}

describe('Reliability analysis report', () => {
  test('generates provider/api/streaming reliability report', async () => {
    await gatherProviderReliability();
    await gatherApiReliability();
    await gatherFrontendFlowSimulation();

    const report = computeSummary();
    await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
    await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

    expect(report.summary.totalTests).toBeGreaterThan(0);
  }, 180000);
});
