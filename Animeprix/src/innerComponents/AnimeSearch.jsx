import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import ShareButton from '../components/ShareButton';
import { searchAnimeDirect, proxyImageUrl } from '../services/animeApi';

const AnimeSearch = () => {
  const [animeName, setAnimeName] = useState('');
  const [provider, setProvider] = useState('animepahe');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Available providers
  const providers = [
    { value: 'animepahe', label: 'AnimePahe' },
    { value: 'animeunity', label: 'AnimeUnity' },
    { value: 'hianime', label: 'HiAnime' },
    { value: 'animekai', label: 'AnimeKai' },
    { value: 'animesaturn', label: 'AnimeSaturn' },
    { value: 'kickassanime', label: 'KickAssAnime' },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!animeName.trim()) {
      setError('Please enter an anime name');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]);

    try {
      const data = await searchAnimeDirect(animeName.trim(), provider);
      
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        setResults(data.results);
        setError(null);
      } else {
        setResults([]);
        setError(`No results found for "${animeName}" on ${provider}. Try a different provider or search term.`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(`Failed to fetch results: ${err.message}. Make sure Consumet API is running on http://localhost:3002`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="min-h-screen bg-cr-dark">
      <Navbar />
      
      <div className="container mx-auto px-6 py-20">
        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Search Anime
          </h1>
          
          <form onSubmit={handleSearch} className="bg-gray-800 rounded-lg p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Anime Name Input */}
              <div className="flex-1">
                <label htmlFor="animeName" className="block text-white mb-2 font-semibold">
                  Anime Name
                </label>
                <input
                  id="animeName"
                  type="text"
                  value={animeName}
                  onChange={(e) => setAnimeName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter anime name (e.g., Naruto, One Piece)"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange placeholder-gray-400"
                />
              </div>
              
              {/* Provider Dropdown */}
              <div className="md:w-64">
                <label htmlFor="provider" className="block text-white mb-2 font-semibold">
                  Provider
                </label>
                <select
                  id="provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange cursor-pointer"
                >
                  {providers.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cr-orange hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
              <p className="text-red-200 font-semibold">{error}</p>
              {error.includes('localhost:3002') && (
                <div className="text-red-300 text-sm mt-3">
                  <p className="font-semibold mb-2">To fix this:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Open a terminal and navigate to: <code className="bg-red-950 px-2 py-1 rounded">cd consumet-api</code></li>
                    <li>Start the Consumet API: <code className="bg-red-950 px-2 py-1 rounded">npm start</code></li>
                    <li>Wait for: "server listening on http://0.0.0.0:3002"</li>
                    <li>Refresh this page and try again</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="text-white text-xl mb-4">Searching...</div>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cr-orange"></div>
          </div>
        )}

        {/* Results Section */}
        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="max-w-4xl mx-auto text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No results found</p>
            <p className="text-gray-500">Try searching with a different provider or anime name</p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Found {results.length} result{results.length !== 1 ? 's' : ''} from {providers.find(p => p.value === provider)?.label}
              </h2>
              <p className="text-gray-400">
                Searching for: <span className="font-semibold text-white">{animeName}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {results.map((anime) => (
                <Link
                  key={anime.id}
                  to={`/watch/${anime.id}`}
                  state={{ 
                    animeData: anime,
                    provider: provider 
                  }}
                  className="group bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-2xl"
                >
                  {/* Anime Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-gray-700">
                    {anime.image ? (
                      <img
                        src={proxyImageUrl(anime.image)}
                        alt={anime.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        onError={(e) => { e.target.src = '/fallback.jpg'; }}
                        crossOrigin="anonymous"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    
                    {/* Rating Badge */}
                    {anime.rating && (
                      <div className="absolute top-2 right-2 bg-cr-orange text-white px-2 py-1 rounded text-xs font-semibold">
                        ⭐ {anime.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  
                  {/* Anime Info */}
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-cr-orange transition">
                      {anime.title}
                    </h3>
                    
                    {/* Metadata */}
                    <div className="text-xs text-gray-400 space-y-1">
                      {anime.releaseDate && (
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{anime.releaseDate}</span>
                        </div>
                      )}
                      {anime.type && (
                        <div className="flex items-center gap-1">
                          <span>🎬</span>
                          <span>{anime.type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
      <ShareButton />
    </div>
  );
};

export default AnimeSearch;

