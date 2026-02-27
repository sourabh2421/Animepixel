import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import animeBackground from '../assets/animebackground.jpg';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&provider=animepahe`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-cr-dark overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${animeBackground})`
        }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-cr-dark/95 via-cr-dark/85 to-cr-dark/95"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cr-dark/80 via-transparent to-cr-dark/80"></div>
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 max-w-6xl leading-tight px-4 drop-shadow-2xl">
          The world's largest dedicated Anime collection on demand
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-white mb-10 max-w-2xl px-4 drop-shadow-lg">
          Join Animeprix and discover the world of Anime
        </p>

        {/* Big Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full max-w-3xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for your favorite anime..."
            className="w-full bg-white/95 text-gray-900 px-8 py-6 pl-16 pr-8 rounded-2xl text-xl md:text-2xl focus:outline-none focus:ring-4 focus:ring-cr-orange focus:bg-white shadow-2xl placeholder-gray-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cr-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
          >
            Search
          </button>
          <svg
            className="absolute left-6 top-1/2 transform -translate-y-1/2 w-8 h-8 text-gray-500 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>
    </div>
  );
};

export default Hero;
