import { useState } from 'react';

const ShareButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  const shareUrl = window.location.href;
  const shareText = 'Check out Animeprix - The world\'s largest dedicated Anime collection on demand!';

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Reddit',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-2.597a1.25 1.25 0 0 1 0-1.768l2.597-2.598a1.25 1.25 0 0 1 1.768 0l2.598 2.598a1.25 1.25 0 0 1 0 1.768l-2.598 2.597a1.25 1.25 0 0 1-.519.249z"/>
        </svg>
      ),
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      name: 'Copy Link',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-gray-600 hover:bg-gray-700',
      action: 'copy'
    }
  ];

  const handleShare = (platform) => {
    if (platform.action === 'copy') {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      });
    } else {
      window.open(platform.url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Share Options - Appear on hover */}
      {isHovered && (
        <div className="mb-4 space-y-3 animate-fade-in">
          {socialPlatforms.map((platform, index) => (
            <a
              key={index}
              href={platform.action === 'copy' ? '#' : platform.url}
              onClick={(e) => {
                if (platform.action === 'copy') {
                  e.preventDefault();
                  handleShare(platform);
                }
              }}
              target="_blank"
              rel="noopener noreferrer"
              className={`${platform.color} text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center group relative`}
              title={platform.name}
            >
              {platform.icon}
              <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {platform.name}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Main Share Button */}
      <button
        className="bg-cr-orange text-white p-4 rounded-full shadow-2xl hover:bg-orange-600 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        aria-label="Share"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342c-.400 0-.784.126-1.105.352a1.99 1.99 0 01-1.579-.176 1.99 1.99 0 01-.176-1.579 1.99 1.99 0 01.352-1.105L5.5 9.5a3.99 3.99 0 012.828-1.172c1.105 0 2.105.447 2.828 1.172l1.105-1.105a1.99 1.99 0 011.579-.176c.4.126.784.352 1.105.352.4 0 .784-.126 1.105-.352a1.99 1.99 0 011.579.176c.4.126.784.352 1.105.352.4 0 .784-.126 1.105-.352a1.99 1.99 0 011.579.176c.4.126.784.352 1.105.352l-1.105 1.105a3.99 3.99 0 01-1.172 2.828c-.723.723-1.723 1.172-2.828 1.172a3.99 3.99 0 01-2.828-1.172L8.684 13.342z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default ShareButton;

