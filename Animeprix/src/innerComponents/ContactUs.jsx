import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-cr-dark">
      <Navbar />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4 text-center">
            Contact Us
          </h1>
          <p className="text-gray-400 text-center mb-12 text-lg">
            Have a question or feedback? We'd love to hear from you!
          </p>

          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <form className="space-y-6">
              <div>
                <label className="block text-white mb-2 font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="What is this regarding?"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">
                  Message
                </label>
                <textarea
                  rows="6"
                  placeholder="Tell us how we can help..."
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cr-orange resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-cr-orange text-white py-3.5 rounded-lg font-semibold text-lg hover:bg-orange-600 transition"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <h3 className="text-white font-semibold mb-2">Email</h3>
              <p className="text-gray-400 text-sm">support@animeprix.com</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <h3 className="text-white font-semibold mb-2">Response Time</h3>
              <p className="text-gray-400 text-sm">Within 24 hours</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <h3 className="text-white font-semibold mb-2">Support Hours</h3>
              <p className="text-gray-400 text-sm">24/7 Available</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;

