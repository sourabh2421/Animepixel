import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';

const HelpCenter = () => {
  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click on the "LOG IN" button in the navbar, then select "Sign Up" to create your Animeprix account. Fill in your details and you\'ll be ready to start watching!'
    },
    {
      question: 'What devices can I watch on?',
      answer: 'You can watch Animeprix on any device - smartphones, tablets, computers, smart TVs, and gaming consoles. Your account works across all platforms!'
    },
    {
      question: 'Can I download episodes for offline viewing?',
      answer: 'Yes! Premium subscribers can download episodes to watch offline. This feature is available on our mobile apps and web platform.'
    },
    {
      question: 'How often is new content added?',
      answer: 'We add new episodes daily, with simulcast episodes available the same day they air in Japan. New series are added weekly to our library.'
    },
    {
      question: 'What video quality is available?',
      answer: 'We offer multiple quality options including HD (720p), Full HD (1080p), and Ultra HD (4K) depending on your subscription plan.'
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.'
    }
  ];

  return (
    <div className="min-h-screen bg-cr-dark">
      <Navbar />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4 text-center">
            Help Center
          </h1>
          <p className="text-gray-400 text-center mb-12 text-lg">
            Find answers to common questions about Animeprix
          </p>

          <div className="space-y-6 mb-12">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Still need help?
            </h2>
            <p className="text-gray-400 mb-6">
              Can't find what you're looking for? Contact our support team.
            </p>
            <Link
              to="/contact"
              className="bg-cr-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition inline-block"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;

