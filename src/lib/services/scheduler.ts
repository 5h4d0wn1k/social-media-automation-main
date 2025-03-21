import { generateContent } from '@/lib/ai';
import { postToTwitter } from '@/lib/api/twitter';
import { postToLinkedIn } from '@/lib/api/linkedin';
import { postToFacebook } from '@/lib/api/facebook';
import { postToTelegram } from '@/lib/api/telegram';
import { postToWhatsApp } from '@/lib/api/whatsapp';
import { Platform, useSocialStore } from '@/lib/store';
import { env } from '@/config/env';

// Topics to randomly choose from when generating content
const DEFAULT_TOPICS = [
  'Digital marketing trends',
  'Social media growth strategies',
  'Content creation tips',
  'Audience engagement tactics',
  'Latest industry news',
  'Marketing automation',
  'Brand storytelling',
  'Community building',
  'Data analytics insights',
  'Growth hacking techniques'
];

interface PlatformConfig {
  postFunction: (content: string, mediaUrls?: string[]) => Promise<any>;
  tones: ('professional' | 'casual' | 'friendly')[];
  lengths: ('short' | 'medium' | 'long')[];
}

// Map of platforms with their posting functions and content preferences
const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  twitter: {
    postFunction: postToTwitter,
    tones: ['casual', 'friendly'],
    lengths: ['short']
  },
  linkedin: {
    postFunction: postToLinkedIn,
    tones: ['professional'],
    lengths: ['medium']
  },
  facebook: {
    postFunction: postToFacebook,
    tones: ['casual', 'friendly'],
    lengths: ['medium']
  },
  telegram: {
    postFunction: postToTelegram,
    tones: ['casual', 'friendly'],
    lengths: ['medium']
  },
  whatsapp: {
    postFunction: postToWhatsApp,
    tones: ['friendly'],
    lengths: ['short']
  }
};

/**
 * Gets the peak posting times for a platform from the store
 */
function getPeakTimes(platform: Platform): string[] {
  const store = useSocialStore.getState();
  return store.platforms[platform]?.bestTimes || ['09:00', '12:00', '17:00'];
}

/**
 * Selects a random item from an array
 */
function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Schedules posts for all enabled platforms at their peak times
 */
export async function schedulePostsForToday(): Promise<void> {
  const store = useSocialStore.getState();
  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];
  
  // Check if we've already scheduled posts for today
  if (store.lastScheduledDate === todayDate) {
    console.log('Posts already scheduled for today');
    return;
  }
  
  for (const [platformName, config] of Object.entries(PLATFORM_CONFIGS)) {
    const platform = platformName as Platform;
    const peakTimes = getPeakTimes(platform);
    
    // Generate and schedule 3 posts (or fewer if fewer peak times)
    const postsToSchedule = Math.min(3, peakTimes.length);
    
    for (let i = 0; i < postsToSchedule; i++) {
      const topic = getRandomItem(DEFAULT_TOPICS);
      const tone = getRandomItem(config.tones);
      const length = getRandomItem(config.lengths);
      
      try {
        // Generate content using AI
        const content = await generateContent({
          topic,
          platform,
          tone,
          length
        });
        
        // Create scheduled time for today at peak hour
        const [hours, minutes] = peakTimes[i].split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // Skip if scheduled time is in the past
        if (scheduledTime < now) continue;
        
        // Add to store for tracking
        store.addPost({
          content,
          platform,
          scheduledTime: scheduledTime.toISOString(),
          status: 'scheduled',
          aiGenerated: true
        });
        
        console.log(`Scheduled post for ${platform} at ${peakTimes[i]}`);
      } catch (error) {
        console.error(`Error scheduling post for ${platform}:`, error);
      }
    }
  }
  
  // Update last scheduled date
  store.setLastScheduledDate(todayDate);
}

/**
 * Checks for and publishes scheduled posts that are due
 */
export async function publishDuePosts(): Promise<void> {
  const store = useSocialStore.getState();
  const now = new Date();
  
  const scheduledPosts = store.posts.filter(post => 
    post.status === 'scheduled' && new Date(post.scheduledTime) <= now
  );
  
  for (const post of scheduledPosts) {
    try {
      const platformConfig = PLATFORM_CONFIGS[post.platform];
      
      if (platformConfig) {
        await platformConfig.postFunction(post.content, post.mediaUrls);
        
        // Update post status to published
        store.updatePostStatus(post.id, 'published');
        console.log(`Published post to ${post.platform}: ${post.content.substring(0, 30)}...`);
      }
    } catch (error) {
      console.error(`Error publishing post to ${post.platform}:`, error);
      store.updatePostStatus(post.id, 'failed');
    }
  }
}

/**
 * Initialize scheduler to run at regular intervals
 */
export function initializeScheduler(): { stop: () => void } {
  console.log('Initializing social media post scheduler');
  
  // Schedule posts for today immediately when the app starts
  schedulePostsForToday().catch(console.error);
  
  // Check for posts to publish every minute
  const publishInterval = setInterval(() => {
    publishDuePosts().catch(console.error);
  }, 60 * 1000);
  
  // Schedule posts for the next day at midnight
  const scheduleForNextDay = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 5, 0, 0); // 12:05 AM to avoid exactly midnight
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      schedulePostsForToday().catch(console.error);
      scheduleForNextDay(); // Set up next day's scheduler
    }, timeUntilMidnight);
  };
  
  // Set up initial scheduling for next day
  scheduleForNextDay();
  
  // Return function to stop the scheduler
  return {
    stop: () => {
      clearInterval(publishInterval);
    }
  };
} 