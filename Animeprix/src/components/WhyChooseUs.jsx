const WhyChooseUs = () => {
  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Largest Anime Library',
      description: 'Access to over 1,000+ anime titles including the latest releases and classic favorites from around the world.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Simulcast Episodes',
      description: 'Watch new episodes the same day they air in Japan. Never miss out on the latest anime releases.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      title: 'HD & 4K Quality',
      description: 'Enjoy crystal-clear streaming in HD and 4K quality. Experience anime the way it was meant to be seen.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Watch Anywhere',
      description: 'Stream on any device - phone, tablet, TV, or computer. Your anime library follows you everywhere.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Ad-Free Experience',
      description: 'No interruptions, no ads. Enjoy uninterrupted anime streaming with our premium ad-free experience.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Curated Collections',
      description: 'Discover handpicked anime collections and recommendations tailored to your preferences and mood.'
    }
  ];

  return (
    <section className="py-20 bg-cr-dark">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Why Choose <span className="text-cr-orange">Animeprix</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the best anime streaming platform with features designed for true anime fans
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 border border-gray-700 hover:border-cr-orange"
            >
              <div className="text-cr-orange mb-4">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

