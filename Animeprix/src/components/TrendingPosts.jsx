const TrendingPosts = () => {
  const posts = [
    {
      platform: 'Twitter',
      username: '@AnimeLover99',
      handle: '@AnimeLover99',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnimeLover',
      content: 'Just discovered Animeprix and I\'m blown away! The library is massive and the quality is incredible. Finally found my anime home! 🎌✨',
      time: '2h ago',
      likes: '1.2K',
      retweets: '456',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      color: 'text-sky-500'
    },
    {
      platform: 'Facebook',
      username: 'Sarah Chen',
      handle: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      content: 'Animeprix has the best anime collection I\'ve ever seen! Been binge-watching all weekend. The HD quality is amazing and no ads! Highly recommend! 👏',
      time: '5h ago',
      likes: '892',
      comments: '134',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'text-blue-600'
    },
    {
      platform: 'Instagram',
      username: 'anime_fanatic',
      handle: '@anime_fanatic',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=animefan',
      content: 'The simulcast feature on Animeprix is a game changer! Watching new episodes the same day they air in Japan is incredible. This is the future of anime streaming! 📺✨',
      time: '8h ago',
      likes: '2.4K',
      comments: '89',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
        </svg>
      ),
      color: 'text-pink-500'
    },
    {
      platform: 'Reddit',
      username: 'u/WeebMaster',
      handle: 'u/WeebMaster',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WeebMaster',
      content: 'r/anime - Just tried Animeprix and holy moly, the library is INSANE! Over 1000+ titles and the UI is so clean. Best streaming service I\'ve used. 10/10 would recommend.',
      time: '12h ago',
      upvotes: '3.5K',
      comments: '234',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-2.597a1.25 1.25 0 0 1 0-1.768l2.597-2.598a1.25 1.25 0 0 1 1.768 0l2.598 2.598a1.25 1.25 0 0 1 0 1.768l-2.598 2.597a1.25 1.25 0 0 1-.519.249z"/>
        </svg>
      ),
      color: 'text-orange-500'
    },
    {
      platform: 'Twitter',
      username: '@OtakuLife',
      handle: '@OtakuLife',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Otaku',
      content: 'Animeprix\'s curated collections feature is brilliant! Found so many hidden gems I never would have discovered. The recommendations are spot on! 🎯',
      time: '1d ago',
      likes: '856',
      retweets: '189',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      color: 'text-sky-500'
    },
    {
      platform: 'LinkedIn',
      username: 'Michael Rodriguez',
      handle: 'Michael Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      content: 'As someone who works in tech, I\'m impressed by Animeprix\'s platform. The streaming quality is excellent, and the multi-device support makes it perfect for busy professionals who love anime.',
      time: '2d ago',
      likes: '423',
      comments: '67',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: 'text-blue-700'
    },
    {
      platform: 'Facebook',
      username: 'James Park',
      handle: 'James Park',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      content: 'No ads on Animeprix = best decision ever! I can finally watch my favorite shows without interruptions. The subscription is totally worth it! 💯',
      time: '3d ago',
      likes: '1.5K',
      comments: '298',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'text-blue-600'
    },
    {
      platform: 'Twitter',
      username: '@AnimeStreamer',
      handle: '@AnimeStreamer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Streamer',
      content: 'The 4K quality on Animeprix is mind-blowing! Watching Attack on Titan in ultra HD is a completely different experience. This is how anime should be watched! 🎬',
      time: '4d ago',
      likes: '2.1K',
      retweets: '567',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      color: 'text-sky-500'
    }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            What People Are <span className="text-cr-orange">Saying</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See what our community is sharing about Animeprix across social media
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {posts.map((post, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cr-orange transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 ${post.color}`}>
                  {post.icon}
                  <span className="text-sm font-semibold">{post.platform}</span>
                </div>
                <span className="text-xs text-gray-500">{post.time}</span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={post.avatar}
                  alt={post.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-white font-semibold text-sm">{post.username}</p>
                  <p className="text-gray-400 text-xs">{post.handle}</p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                {post.content}
              </p>

              {/* Engagement Stats */}
              <div className="flex items-center gap-4 text-gray-500 text-xs">
                {post.likes && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {post.likes}
                  </span>
                )}
                {post.retweets && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.54 2.54v-5.46c0-3.308-2.691-6-6-6h-1.46c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h1.46c4.136 0 7.5 3.364 7.5 7.5v5.46l-2.54-2.54c-.293-.293-.768-.293-1.06 0s-.293.768 0 1.06l3.77 3.77c.146.147.338.22.53.22s.384-.073.53-.22l3.77-3.77c.293-.292.293-.767 0-1.06zm-10.66 3.28H7.26c-4.136 0-7.5-3.364-7.5-7.5v-5.46l2.54 2.54c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.77-3.77c-.293-.294-.768-.294-1.06 0l-3.77 3.77c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.54-2.54v5.46c0 3.308 2.691 6 6 6h5.46l-2.54-2.54c-.293-.293-.768-.293-1.06 0s-.293.768 0 1.06l3.77 3.77c.146.147.338.22.53.22s.384-.073.53-.22l3.77-3.77c.293-.292.293-.768 0-1.06s-.767-.293-1.06 0z"/>
                    </svg>
                    {post.retweets}
                  </span>
                )}
                {post.comments && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                    </svg>
                    {post.comments}
                  </span>
                )}
                {post.upvotes && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                    </svg>
                    {post.upvotes}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingPosts;

