import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';

const Signup = () => {
  return (
    <div className="min-h-screen bg-cr-dark">
      <Navbar />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            Sign Up
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Create your Animeprix account
          </p>

          <form className="space-y-6">
            <div>
              <label className="block text-white mb-2 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange"
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange"
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange"
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cr-orange text-white py-3.5 rounded-lg font-semibold text-lg hover:bg-orange-600 transition"
            >
              Create Account
            </button>
          </form>

          <p className="text-gray-400 text-center mt-6">
            Already have an account?{' '}
            <Link to="/" className="text-cr-orange hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

