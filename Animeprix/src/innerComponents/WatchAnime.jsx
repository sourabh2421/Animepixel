import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Hls from 'hls.js';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import ShareButton from '../components/ShareButton';
import { getAnimeInfo, getStreamingLinks, getProviders, searchAnime, proxyImageUrl, PROVIDER_LABELS } from '../services/animeApi';
import { checkBackendHealth } from '../utils/backendHealth';

const WatchAnime = () => {
  const { id } = useParams();
  const location = useLocation();
  const [animeInfo, setAnimeInfo] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [streamingLinks, setStreamingLinks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loadingEpisode, setLoadingEpisode] = useState(false);
  const [useExternalPlayer, setUseExternalPlayer] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [providerList, setProviderList] = useState([]);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const streamingLinksRef = useRef([]);
  const BACKEND_API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';
  const proxyMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (!/^https?:\/\//i.test(url)) return url;
    if (url.includes('/api/stream?url=')) return url;
    return `${BACKEND_API}/stream?url=${encodeURIComponent(url)}`;
  };
  const canUseNativeHls = () => {
    if (typeof document === 'undefined') return false;
    const video = document.createElement('video');
    return Boolean(video.canPlayType('application/vnd.apple.mpegurl'));
  };
  const isHlsUrl = (url) => typeof url === 'string' && url.includes('.m3u8');
  const pickPreferredSource = (items = []) => {
    if (!Array.isArray(items) || !items.length) return null;
    const nonHls = items.find((item) => {
      const url = item?.url || item?.file || item?.src || (typeof item === 'string' ? item : null);
      return url && !isHlsUrl(url);
    });
    return nonHls || items[0];
  };
  const normalizeTitle = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const resolveAnimeIdForProvider = async (provider, titleHint) => {
    if (!provider) throw new Error('Provider is required');
    const query = String(titleHint || animeInfo?.title || animeInfo?.name || '').trim();
    if (!query) throw new Error('Cannot switch provider: missing anime title');
    const search = await searchAnime(query, provider);
    const results = Array.isArray(search?.results) ? search.results : [];
    if (!results.length) {
      throw new Error(`No matches found on ${provider} for "${query}"`);
    }

    const target = normalizeTitle(query);
    const best = results.find((item) => normalizeTitle(item?.title || item?.name) === target) || results[0];
    return best?.id || best?.providerId;
  };
  // ─── FIXED: initialise provider from location state immediately
  const [selectedProvider, setSelectedProvider] = useState(location.state?.provider || null);

  useEffect(() => {
    checkBackendHealth().then(setBackendAvailable);
  }, []);

  useEffect(() => {
    getProviders().then((list) => setProviderList(list.length ? list : Object.keys(PROVIDER_LABELS)));
  }, []);

  useEffect(() => {
    streamingLinksRef.current = Array.isArray(streamingLinks) ? streamingLinks : [];
  }, [streamingLinks]);

  // ─── Fetch anime info ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAnimeData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Seed from search result data while we fetch full info
        if (location.state?.animeData) {
          const data = location.state.animeData;
          setAnimeInfo(data);

          const rawEps = data.episodes;
          if (Array.isArray(rawEps) && rawEps.length > 0) {
            setEpisodes(rawEps);
            setSelectedEpisode(rawEps[0]);
          } else if (typeof rawEps === 'number' || data.totalEpisodes) {
            const count = typeof rawEps === 'number' ? rawEps : data.totalEpisodes;
            const list = buildPlaceholderEpisodes(data.id || id, count);
            setEpisodes(list);
            setSelectedEpisode(list[0]);
          }
        }

        if (!id || id === 'undefined' || id === 'null') {
          setError('Anime ID not found');
          return;
        }

        const provider = location.state?.provider || selectedProvider;
        if (!provider) {
          if (!location.state?.animeData) setAnimeInfo(prev => ({ ...prev, id }));
          setLoading(false);
          return;
        }

        const info = await getAnimeInfo(id, provider);

        if (!info) { setLoading(false); return; }

        // ─── FIXED: capture provider returned by backend (set during info fetch)
        if (info.provider && !selectedProvider) {
          setSelectedProvider(info.provider);
        }

        setAnimeInfo(prev => ({ ...(prev || {}), ...info }));

        if (Array.isArray(info.episodes) && info.episodes.length > 0) {
          setEpisodes(info.episodes);
          setSelectedEpisode(info.episodes[0]);
        } else if (typeof info.episodes === 'number' || info.totalEpisodes) {
          const count = typeof info.episodes === 'number' ? info.episodes : info.totalEpisodes;
          const list = buildPlaceholderEpisodes(id, count);
          setEpisodes(list);
          setSelectedEpisode(list[0]);
        }
      } catch (err) {
        console.error('Error fetching anime:', err);
        if (!animeInfo) setError(`Failed to load anime: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── Fetch streaming links ─────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedEpisode || !animeInfo) return;

    const provider = selectedProvider || animeInfo?.provider;
    if (!provider) {
      setError('No provider selected. Open this anime from search and choose a provider.');
      setUseExternalPlayer(true);
      return;
    }

    const fetchStreamingLinks = async () => {
      setLoadingEpisode(true);
      setError(null);
      setStreamingLinks(null);
      setSelectedSource(null);
      setVideoUrl(null);
      setUseExternalPlayer(false);

      const isHealthy = await checkBackendHealth();
      setBackendAvailable(isHealthy);
      if (!isHealthy) {
        setError('Backend server is not available. Please start it on port 3001.');
        setUseExternalPlayer(true);
        setLoadingEpisode(false);
        return;
      }

      // Use episode.id (Consumet episode ID, e.g. 4a0724df-.../31e115f8...)
      const episodeId = selectedEpisode.id || selectedEpisode.episodeId;
      console.log('[DEBUG] Episode click — episodeId:', episodeId, 'provider:', provider);
      // Placeholder IDs like "<animeId>-1" are UI-only and will 500 on AnimePahe watch.
      const isAnimePahePlaceholderId =
        provider === 'animepahe' &&
        typeof episodeId === 'string' &&
        !episodeId.includes('/');
      if (isAnimePahePlaceholderId) {
        console.log('[DEBUG] Skipping stream fetch for placeholder AnimePahe episode ID:', episodeId);
        setLoadingEpisode(false);
        return;
      }

      let links;
      try {
        links = await getStreamingLinks(episodeId, provider);
      } catch (err) {
        console.error('[DEBUG] getStreamingLinks error:', err);
        setError(err?.message || 'Failed to fetch streaming links.');
        setUseExternalPlayer(true);
        setLoadingEpisode(false);
        return;
      }

      if (!links || links.fallback) {
        setError(links?.message || 'Streaming links not available. Try searching on external platforms.');
        setUseExternalPlayer(true);
        setLoadingEpisode(false);
        return;
      }

      const sources = links.sources || [];
      if (sources.length > 0) {
        setStreamingLinks(sources);
        const preferred = pickPreferredSource(sources);
        setSelectedSource(preferred);
        const url = preferred?.url || preferred?.file || preferred?.src || (typeof preferred === 'string' ? preferred : null);
        if (url) setVideoUrl(url);
        setError(null);
      } else {
        setError(links.message || 'No streaming sources available for this episode.');
        setUseExternalPlayer(true);
      }

      setLoadingEpisode(false);
    };

    fetchStreamingLinks();
  }, [selectedEpisode, animeInfo, selectedProvider]);

  // Attach HLS for .m3u8 streams when needed
  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    const playbackUrl = proxyMediaUrl(videoUrl);
    const isHlsStream = playbackUrl.includes('.m3u8');
    if (!isHlsStream) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playbackUrl;
      return;
    }

    if (Hls.isSupported()) {
      // Let Hls.js fully control MSE attachment for m3u8 streams.
      // Keeping a native src simultaneously can cause fatal SourceBuffer errors.
      video.removeAttribute('src');
      video.load();

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(playbackUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data?.fatal) {
          console.error('[HLS] Fatal playback error:', data);
          const fallback = pickPreferredSource((streamingLinksRef.current || []).filter((s) => {
            const url = s?.url || s?.file || s?.src || (typeof s === 'string' ? s : null);
            return url && !isHlsUrl(url);
          }));
          if (fallback) {
            const nextUrl = fallback?.url || fallback?.file || fallback?.src || (typeof fallback === 'string' ? fallback : null);
            if (nextUrl) {
              console.log('[HLS] Falling back to non-HLS source:', nextUrl);
              setSelectedSource(fallback);
              setVideoUrl(nextUrl);
              setError('Current HLS source failed. Switched to MP4 source.');
              return;
            }
          }
          setError('HLS playback failed for this source. Try another quality/source.');
        }
      });
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    setError('HLS not supported in this browser for this source.');
  }, [videoUrl]);

  // ─── Provider change handler ───────────────────────────────────────────────
  const handleProviderChange = async (newProvider) => {
    if (!newProvider) return;
    if (newProvider === selectedProvider) return;

    setSelectedProvider(newProvider);
    setError(null);
    setEpisodes([]);
    setSelectedEpisode(null);
    setStreamingLinks(null);
    setSelectedSource(null);
    setVideoUrl(null);
    setUseExternalPlayer(false);

    try {
      const resolvedId = await resolveAnimeIdForProvider(
        newProvider,
        animeInfo?.title || animeInfo?.name || location.state?.animeData?.title
      );
      const info = await getAnimeInfo(resolvedId, newProvider);
      if (info) {
        setAnimeInfo(prev => ({ ...(prev || {}), ...info, provider: newProvider }));
        if (Array.isArray(info.episodes) && info.episodes.length > 0) {
          setEpisodes(info.episodes);
          setSelectedEpisode(info.episodes[0]);
        }
      }
    } catch (err) {
      setUseExternalPlayer(true);
      setError(`Failed with provider ${newProvider}: ${err.message}`);
    }
  };

  const buildPlaceholderEpisodes = (animeId, count) =>
    Array.from({ length: Math.max(1, count) }, (_, i) => ({
      id: `${animeId}-${i + 1}`,
      number: i + 1,
      episode: i + 1,
      title: `Episode ${i + 1}`,
      episodeId: `${animeId}-episode-${i + 1}`,
      animeId,
    }));

  const isSafeToEmbed = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const getExternalSearchUrl = (platform) => {
    const title = animeInfo?.title || animeInfo?.name || '';
    const ep = selectedEpisode?.number || selectedEpisode?.episode || 1;
    const queries = {
      youtube: `${title} episode ${ep} english sub`,
      google:  `${title} watch episode ${ep} online`,
    };
    return queries[platform] || queries.google;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cr-dark">
        <Navbar />
        <div className="container mx-auto px-6 py-20 flex justify-center items-center">
          <div className="text-white text-xl">Loading anime...</div>
        </div>
        <Footer /><ShareButton />
      </div>
    );
  }

  if (error && !animeInfo) {
    return (
      <div className="min-h-screen bg-cr-dark">
        <Navbar />
        <div className="container mx-auto px-6 py-20">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
            <p className="text-red-200">{error}</p>
            <Link to="/" className="text-cr-orange hover:underline mt-4 inline-block">← Back to Home</Link>
          </div>
        </div>
        <Footer /><ShareButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cr-dark">
      <Navbar />
      <div className="container mx-auto px-6 py-20">

        {animeInfo && (
          <div className="mb-8">
            {/* Provider selector — show when no provider yet */}
            {!selectedProvider && (
              <div className="mb-6 bg-gray-800 rounded-lg p-4">
                <label className="block text-white mb-2 font-semibold">
                  Select Provider (required to fetch episodes):
                </label>
                <select
                  value=""
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange w-full md:w-64"
                >
                  <option value="">Select a provider...</option>
                  {providerList.map((p) => (
                    <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>
                  ))}
                </select>
                <p className="text-gray-400 text-sm mt-2">Please select a provider to load episodes</p>
              </div>
            )}

            {selectedProvider && (
              <div className="mb-4 flex items-center gap-3">
                <span className="bg-cr-orange/20 text-cr-orange px-3 py-1 rounded-lg text-sm font-semibold">
                  Provider: {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
                </span>
                {/* Allow switching provider */}
                <select
                  value={selectedProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm focus:outline-none"
                >
                  {providerList.map((p) => (
                    <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="relative w-full md:w-64 h-96 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                {(animeInfo.image || animeInfo.coverImage) ? (
                  <img
                    src={proxyImageUrl(animeInfo.image || animeInfo.coverImage)}
                    alt={animeInfo.title || animeInfo.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/fallback.jpg'; }}
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-center">
                    <div><div className="text-4xl mb-2">🖼️</div><div className="text-sm">No Image</div></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-4">
                  {animeInfo.title || animeInfo.name || 'Untitled'}
                </h1>
                {(animeInfo.description || animeInfo.synopsis) && (
                  <p className="text-gray-400 mb-4 leading-relaxed line-clamp-4">
                    {animeInfo.description || animeInfo.synopsis}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  {animeInfo.genre && (
                    <span>Genre: {Array.isArray(animeInfo.genre) ? animeInfo.genre.join(', ') : animeInfo.genre}</span>
                  )}
                  {animeInfo.releaseDate && <span>Released: {animeInfo.releaseDate}</span>}
                  {animeInfo.status      && <span>Status: {animeInfo.status}</span>}
                </div>
                <Link to="/" className="text-cr-orange hover:underline inline-block">← Back to Search</Link>
              </div>
            </div>
          </div>
        )}

        {/* Video Player */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            {selectedEpisode
              ? `Episode ${selectedEpisode.number || selectedEpisode.episode || 1}`
              : 'Select an Episode'}
          </h2>

          {loadingEpisode && (
            <div className="bg-gray-800 rounded-lg p-8 mb-4 text-center">
              <div className="text-white mb-2">Loading episode...</div>
              <div className="text-gray-400 text-sm">Fetching streaming links</div>
            </div>
          )}

          {!loadingEpisode && videoUrl && isSafeToEmbed(videoUrl) ? (
            <div className="mb-4">
              <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4">
                {videoUrl.endsWith('.m3u8') ||
                videoUrl.includes('.m3u8') ||
                videoUrl.endsWith('.mp4') ||
                videoUrl.includes('.mp4') ||
                videoUrl.endsWith('.webm') ||
                videoUrl.includes('.webm') ||
                videoUrl.endsWith('.mkv') ||
                videoUrl.includes('.mkv') ? (
                  <video
                    ref={videoRef}
                    controls
                    src={(videoUrl.includes('.m3u8') && !canUseNativeHls()) ? undefined : proxyMediaUrl(videoUrl)}
                    className="w-full h-full"
                    autoPlay
                    crossOrigin="anonymous"
                    playsInline
                    onError={() => setError('Video playback failed. Try another source/quality.')}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <iframe src={proxyMediaUrl(videoUrl)} title="Anime Player" className="w-full h-full" allowFullScreen />
                )}
              </div>

              {streamingLinks?.length > 1 && (
                <div className="mb-4">
                  <label className="text-white mb-2 block">Select Quality:</label>
                  <select
                    value={streamingLinks.indexOf(selectedSource)}
                    onChange={(e) => {
                      const src = streamingLinks[+e.target.value];
                      setSelectedSource(src);
                      const url = src?.url || src?.file || src?.src || src;
                      if (url) setVideoUrl(url);
                    }}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                  >
                    {streamingLinks.map((s, i) => (
                      <option key={i} value={i}>
                        {s?.quality || s?.label || `Source ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : !loadingEpisode && useExternalPlayer ? (
            <div className="bg-gray-800 rounded-lg p-8 mb-4">
              {error && <p className="text-gray-400 mb-4 text-center">{error}</p>}
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(getExternalSearchUrl('youtube'))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >Search on YouTube</a>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(getExternalSearchUrl('google'))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >Search on Google</a>
              </div>
              {!backendAvailable && (
                <p className="text-yellow-500 text-sm text-center mt-4">
                  ⚠️ Backend not responding. Start it on port 3001.
                </p>
              )}
            </div>
          ) : !loadingEpisode && (
            <div className="bg-gray-800 rounded-lg p-8 mb-4 text-center">
              <p className="text-gray-400">
                {error || 'Video player will appear here once streaming links are loaded.'}
              </p>
            </div>
          )}
        </div>

        {/* Episodes grid */}
        {episodes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Episodes</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
              {episodes.map((ep, idx) => {
                if (!ep) return null;
                const isActive = selectedEpisode &&
                  (selectedEpisode.id === ep.id || selectedEpisode.episodeId === ep.episodeId);
                return (
                  <button
                    key={ep.id || ep.episodeId || `ep-${idx}`}
                    onClick={() => setSelectedEpisode(ep)}
                    disabled={loadingEpisode}
                    className={`p-3 rounded-lg font-semibold transition ${
                      isActive
                        ? 'bg-cr-orange text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } ${loadingEpisode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {String(ep.number || ep.episode || idx + 1)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {episodes.length === 0 && animeInfo && !loading && (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">
              {selectedProvider
                ? `No episodes found for provider "${selectedProvider}". Try switching providers above.`
                : 'Episode list is not available. Please select a provider above.'}
            </p>
          </div>
        )}
      </div>
      <Footer /><ShareButton />
    </div>
  );
};

export default WatchAnime;