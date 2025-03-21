// Browser-compatible scheduling
export function setupAutomatedPosts() {
  const schedulePost = async () => {
    const now = new Date();
    const hours = now.getHours();
    
    // Only run at 9 AM, 2 PM, and 7 PM
    if (hours === 9 || hours === 14 || hours === 19) {
      try {
        const { generateContent } = await import('./ai');
        const { fetchRssFeed } = await import('./rss');
        const { postToSocialMedia } = await import('./api');
        const { useSocialStore } = await import('./store');
        
        const store = useSocialStore.getState();
        const enabledPlatforms = Object.entries(store.platforms)
          .filter(([_, data]) => data.enabled)
          .map(([platform]) => platform);

        const RSS_FEEDS = [
          'https://techcrunch.com/feed/',
          'https://www.theverge.com/rss/index.xml',
          'https://www.wired.com/feed/rss',
        ];

        // Fetch content from RSS feeds
        const feedItems = [];
        for (const feedUrl of RSS_FEEDS) {
          const items = await fetchRssFeed(feedUrl);
          feedItems.push(...items);
        }

        // Generate and post content for each platform
        for (const platform of enabledPlatforms) {
          try {
            const randomItem = feedItems[Math.floor(Math.random() * feedItems.length)];
            
            const content = await generateContent({
              topic: randomItem.title || '',
              platform,
              tone: 'professional',
              length: 'medium',
            });

            const postId = await postToSocialMedia(platform, content, randomItem.imageUrl);

            store.addPost({
              content,
              platform,
              scheduledTime: new Date().toISOString(),
              status: 'posted',
              imageUrl: randomItem.imageUrl,
              sourceUrl: randomItem.link,
              aiGenerated: true,
            });

            console.log(`Successfully posted to ${platform}`);
          } catch (error) {
            console.error(`Error posting to ${platform}:`, error);
          }
        }
      } catch (error) {
        console.error('Error in automated posting:', error);
      }
    }
  };

  // Check every minute
  setInterval(schedulePost, 60000);
  
  // Run immediately if it's posting time
  schedulePost();
}