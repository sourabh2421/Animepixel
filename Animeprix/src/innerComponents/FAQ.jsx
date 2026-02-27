import { useState } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is Animeprix?',
      answer: 'Animeprix is the world\'s largest dedicated anime streaming platform, offering over 1,000+ anime titles including the latest releases and classic favorites.'
    },
    {
      question: 'How much does it cost?',
      answer: 'We offer flexible pricing plans starting from $7.99/month. Check our pricing page for detailed information about all available plans and features.'
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! We offer a free trial for new users. You can start watching immediately and cancel anytime during the trial period.'
    },
    {
      question: 'Can I watch on multiple devices?',
      answer: 'Yes, depending on your plan. You can stream on 1-6 devices simultaneously. Check your subscription plan for the exact number of concurrent streams allowed.'
    },
    {
      question: 'Are there ads?',
      answer: 'No! All our subscription plans are completely ad-free. Enjoy uninterrupted anime streaming without any commercial interruptions.'
    },
    {
      question: 'What languages are available?',
      answer: 'Most anime are available with both Japanese audio with subtitles and English dubs. You can switch between audio tracks and subtitle languages in the player settings.'
    },
    {
      question: 'How do I change my subscription plan?',
      answer: 'You can upgrade or downgrade your plan at any time from your account settings. Changes will take effect at the start of your next billing cycle.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Absolutely! We use industry-standard encryption to protect your payment information. We never store your full credit card details on our servers.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-cr-dark">
      <Navbar />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4 text-center">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-center mb-12 text-lg">
            Everything you need to know about Animeprix
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-700 transition"
                >
                  <h3 className="text-xl font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-6 h-6 text-cr-orange transition-transform flex-shrink-0 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;

