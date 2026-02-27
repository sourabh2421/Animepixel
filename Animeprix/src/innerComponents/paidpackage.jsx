import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';

const PaidPackage = () => {
  const packages = [
    {
      name: 'Fan',
      price: '$7.99',
      period: 'per month',
      features: [
        'Ad-free streaming',
        'New episodes one week after Japan',
        'Access to entire library',
        'HD quality',
        'Stream on 1 device'
      ],
      popular: false
    },
    {
      name: 'Mega Fan',
      price: '$9.99',
      period: 'per month',
      features: [
        'Everything in Fan',
        'New episodes same day as Japan',
        'Stream on 4 devices',
        'Offline downloads',
        'Ultra HD quality'
      ],
      popular: true
    },
    {
      name: 'Ultimate Fan',
      price: '$14.99',
      period: 'per month',
      features: [
        'Everything in Mega Fan',
        'Stream on 6 devices',
        'Annual membership discount',
        'Exclusive content',
        'Priority support'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-cr-dark">
      <Navbar />
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400">
            Select the perfect package for your anime journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`bg-gray-800 rounded-lg p-8 ${
                pkg.popular
                  ? 'border-2 border-cr-orange transform scale-105'
                  : 'border border-gray-700'
              }`}
            >
              {pkg.popular && (
                <div className="bg-cr-orange text-white text-center py-2 rounded-t-lg -mt-8 -mx-8 mb-4 font-semibold">
                  MOST POPULAR
                </div>
              )}
              <h2 className="text-3xl font-bold text-white mb-2">{pkg.name}</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{pkg.price}</span>
                <span className="text-gray-400 ml-2">{pkg.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-cr-orange mr-3 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3.5 rounded-lg font-semibold text-lg transition ${
                  pkg.popular
                    ? 'bg-cr-orange text-white hover:bg-orange-600'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/"
            className="text-cr-orange hover:underline text-lg"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaidPackage;

