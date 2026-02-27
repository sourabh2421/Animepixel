import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import ShareButton from '../components/ShareButton';
import { searchAnime, getProviders, proxyImageUrl, PROVIDER_LABELS } from '../services/animeApi';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const provider = searchParams.get('provider') || 'animepahe';
  const [providers, setProviders] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProviders().then((list) => setProviders(list.length ? list : Object.keys(PROVIDER_LABELS)));
  }, []);

  const setProvider = (newProvider) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('provider', newProvider);
      return next;
    });
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchAnime(query, provider);
        
        // Handle different response structures
        let animeResults = [];
        
        if (data.results && Array.isArray(data.results)) {
          animeResults = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          animeResults = data.data;
        } else if (Array.isArray(data)) {
          animeResults = data;
        } else if (data.anime && Array.isArray(data.anime)) {
          animeResults = data.anime;
        }
        
        setResults(animeResults);
        if (animeResults.length === 0) {
          setError('No results found. Try a different search term or provider.');
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Search error:', err);
        if (err?.message?.includes?.('PROVIDER_FAILED')) {
          setError(`Provider "${provider}" failed. Try another provider.`);
        } else {
          setError(`Failed to fetch search results: ${err.message}. Please check the console for details.`);
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, provider]);

  return (
    <div className="min-h-screen bg-cr-dark">
      <Navbar />
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-white">
            Search Results for "{query}"
          </h1>
          <div className="flex items-center gap-2">
            <label htmlFor="provider" className="text-gray-300 text-sm font-medium">Provider:</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cr-orange focus:outline-none"
            >
              {(providers.length ? providers : Object.keys(PROVIDER_LABELS)).map((p) => (
                <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-white text-xl">Loading...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 mb-8">
            <p className="text-red-200 font-semibold mb-2">{error}</p>
            {error.includes('backend') || error.includes('Backend') ? (
              <div className="text-red-300 text-sm mt-3 space-y-2">
                <p className="font-semibold">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open a new terminal window</li>
                  <li>Navigate to the backend folder: <code className="bg-red-950 px-2 py-1 rounded">cd backend</code></li>
                  <li>Start the backend server: <code className="bg-red-950 px-2 py-1 rounded">npm start</code></li>
                  <li>Wait for the message: "🚀 Animeprix Backend Server running on http://localhost:3001"</li>
                  <li>Refresh this page and try searching again</li>
                </ol>
              </div>
            ) : (
              <p className="text-red-300 text-sm mt-2">
                Check the browser console (F12) for detailed error messages.
              </p>
            )}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No results found for "{query}"</p>
            <p className="text-gray-500">Try searching with a different keyword</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-gray-400 mb-6">Found {results.length} result(s)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {results.map((anime, index) => (
                <Link
                  key={anime.id || anime.animeId || anime.mal_id || index}
                  to={`/watch/${anime.id || anime.animeId || anime.mal_id || index}`}
                  state={{
                    animeData: { ...anime, title: anime.title || anime.name, provider: anime.provider || provider },
                    provider: anime.provider || provider,
                  }}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-800">
                    <img
                      src={proxyImageUrl(anime.image || anime.coverImage || anime.poster || anime.images?.jpg?.image_url) || '/fallback.jpg'}
                      alt={anime.title || anime.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => { e.target.src = '/fallback.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <button className="w-full bg-cr-orange hover:bg-orange-600 text-white py-2 rounded font-semibold transition">
                          Watch Now
                        </button>
                      </div>
                    </div>
                    {(anime.episodes || anime.totalEpisodes) && (
                      <div className="absolute top-2 right-2 bg-dark/80 text-white text-xs px-2 py-1 rounded">
                        {anime.episodes || anime.totalEpisodes} Eps
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold group-hover:text-cr-orange transition line-clamp-2 text-sm">
                    {anime.title || anime.name || 'Untitled'}
                  </h3>
                  {anime.releaseDate && (
                    <p className="text-gray-400 text-xs mt-1">{anime.releaseDate}</p>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
      <ShareButton />
    </div>
  );
};

export default SearchResults;
