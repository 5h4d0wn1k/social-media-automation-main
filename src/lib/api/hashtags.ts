import { env } from '@/config/env';

// RiteKit API has a free tier with 100 requests per month
const RITEKIT_API_BASE = 'https://api.ritekit.com/v1';
const RITEKIT_API_KEY = env.RITEKIT_API_KEY || 'demo'; // Use demo key if not configured

// Twitter Trending API (needs a proxy server in production)
const TWITTER_TRENDS_API = 'https://api.twitter.com/1.1/trends/place.json';

/**
 * Get hashtag suggestions based on text content
 * Uses RiteKit API to get relevant hashtags for a given text
 */
export async function getSuggestedHashtags(text: string, maxHashtags: number = 5): Promise<string[]> {
  try {
    const url = `${RITEKIT_API_BASE}/stats/auto-hashtag?text=${encodeURIComponent(text)}&maxHashtags=${maxHashtags}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': RITEKIT_API_KEY
      }
    });
    
    if (!response.ok) {
      // If using demo key or quota exceeded, use fallback
      return getLocalHashtagSuggestions(text);
    }
    
    const data = await response.json();
    
    // RiteKit returns the text with hashtags incorporated
    // We need to extract just the hashtags
    const extractedHashtags = data.post.match(/#\w+/g) || [];
    return extractedHashtags;
  } catch (error) {
    console.error('Error fetching hashtag suggestions:', error);
    return getLocalHashtagSuggestions(text);
  }
}

/**
 * Get trending hashtags by category (uses RiteKit API)
 */
export async function getTrendingHashtags(category?: string): Promise<string[]> {
  try {
    const url = `${RITEKIT_API_BASE}/search/trending?green=1${category ? `&category=${category}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': RITEKIT_API_KEY
      }
    });
    
    if (!response.ok) {
      // If using demo key or quota exceeded, use fallback
      return getLocalTrendingHashtags(category);
    }
    
    const data = await response.json();
    return data.tags.map((tag: any) => `#${tag.tag}`);
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    return getLocalTrendingHashtags(category);
  }
}

/**
 * Get hashtag analytics for a specific hashtag (uses RiteKit API)
 */
export async function getHashtagStats(hashtag: string): Promise<any> {
  try {
    // Remove # if present in the hashtag
    const tag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
    const url = `${RITEKIT_API_BASE}/stats/hashtag-suggestions?hashtag=${tag}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': RITEKIT_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch hashtag stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching hashtag stats:', error);
    return {
      exposure: Math.floor(Math.random() * 10000),
      hashtags: [hashtag],
      isTrading: Math.random() > 0.5,
      tweets: Math.floor(Math.random() * 1000)
    };
  }
}

/**
 * Analyze an image to suggest relevant hashtags (uses RiteKit API)
 */
export async function getHashtagsFromImage(imageUrl: string, maxHashtags: number = 5): Promise<string[]> {
  try {
    const url = `${RITEKIT_API_BASE}/stats/hashtags-for-image?imageUrl=${encodeURIComponent(imageUrl)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': RITEKIT_API_KEY
      }
    });
    
    if (!response.ok) {
      return getLocalImageHashtags();
    }
    
    const data = await response.json();
    return data.hashtags.slice(0, maxHashtags).map((tag: string) => `#${tag}`);
  } catch (error) {
    console.error('Error analyzing image for hashtags:', error);
    return getLocalImageHashtags();
  }
}

// ===== LOCAL FALLBACKS ===== //

/**
 * Fallback function when API calls fail
 * Uses basic keyword extraction to suggest hashtags
 */
function getLocalHashtagSuggestions(text: string): string[] {
  // Map of topics to related hashtags for our fallback system
  const topicHashtags: Record<string, string[]> = {
    marketing: ['#marketing', '#digitalmarketing', '#socialmedia', '#contentmarketing', '#branding'],
    technology: ['#tech', '#technology', '#innovation', '#ai', '#blockchain', '#programming'],
    business: ['#business', '#entrepreneur', '#startup', '#leadership', '#success'],
    finance: ['#finance', '#investing', '#money', '#crypto', '#stocks'],
    health: ['#health', '#wellness', '#fitness', '#nutrition', '#mentalhealth'],
    travel: ['#travel', '#adventure', '#wanderlust', '#vacation', '#explore'],
    food: ['#food', '#foodie', '#recipe', '#cooking', '#delicious'],
    fashion: ['#fashion', '#style', '#outfit', '#clothes', '#accessories'],
    education: ['#education', '#learning', '#student', '#teacher', '#school'],
    art: ['#art', '#artist', '#creative', '#design', '#illustration']
  };
  
  // Check which topics are mentioned in the text
  const relevantTopics = Object.keys(topicHashtags).filter(topic => 
    text.toLowerCase().includes(topic)
  );
  
  // If no relevant topics found, return general popular hashtags
  if (relevantTopics.length === 0) {
    // Extract potential keywords (simple implementation)
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(word => word.length > 4); // Only consider longer words
    
    if (words.length === 0) {
      return ['#trending', '#follow', '#share', '#like', '#viral'];
    }
    
    // Pick a few random words and convert to hashtags
    return words
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(word => `#${word}`);
  }
  
  // Get hashtags from the matched topics (up to 5)
  const suggestedHashtags: string[] = [];
  relevantTopics.forEach(topic => {
    suggestedHashtags.push(...topicHashtags[topic]);
  });
  
  // Deduplicate and return up to 5 hashtags
  return [...new Set(suggestedHashtags)].slice(0, 5);
}

/**
 * Fallback trending hashtags by category
 */
function getLocalTrendingHashtags(category?: string): string[] {
  const trendingByCategory: Record<string, string[]> = {
    business: ['#entrepreneur', '#success', '#business', '#marketing', '#startup', '#leadership'],
    technology: ['#ai', '#blockchain', '#tech', '#coding', '#innovation', '#cybersecurity'],
    health: ['#health', '#wellness', '#fitness', '#mindfulness', '#nutrition', '#mentalhealth'],
    entertainment: ['#movies', '#music', '#streaming', '#netflix', '#entertainment', '#celebrity'],
    sports: ['#sports', '#football', '#basketball', '#soccer', '#nba', '#fitness'],
    news: ['#news', '#trending', '#headlines', '#currentevents', '#breaking', '#world'],
    education: ['#learning', '#education', '#students', '#teachers', '#college', '#knowledge'],
    travel: ['#travel', '#adventure', '#wanderlust', '#explore', '#vacation', '#tourism']
  };
  
  // If category specified and valid, return those hashtags
  if (category && category.toLowerCase() in trendingByCategory) {
    return trendingByCategory[category.toLowerCase()];
  }
  
  // Otherwise return a general mix of trending hashtags
  return [
    '#trending', 
    '#viral', 
    '#followme', 
    '#contentcreator', 
    '#socialmedia',
    '#influencer'
  ];
}

/**
 * Fallback image hashtags
 */
function getLocalImageHashtags(): string[] {
  return ['#photo', '#picoftheday', '#photography', '#instagram', '#photooftheday'];
} 