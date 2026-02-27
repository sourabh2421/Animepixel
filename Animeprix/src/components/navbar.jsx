import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-cr-dark w-full py-8 px-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-white">
            <span className="text-cr-orange">Anime</span><span className="text-red-600">prix</span>
          </span>
        </Link>

        {/* Right side - Buttons */}
        <div className="flex items-center">
          <Link
            to="/signup"
            className="bg-black text-white px-10 py-4 rounded-lg font-semibold text-xl md:text-2xl hover:bg-gray-900 transition"
          >
            LOG IN
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
