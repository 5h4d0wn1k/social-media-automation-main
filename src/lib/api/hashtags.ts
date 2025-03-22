import { env } from '@/config/env';
import { generateHashtagsWithDeepSeek, analyzeImageForHashtags } from './deepseek';

// RiteKit API has a free tier with 100 requests per month
const RITEKIT_API_BASE = 'https://api.ritekit.com/v1';

// Twitter Trending API (needs a proxy server in production)
const TWITTER_TRENDS_API = 'https://api.twitter.com/1.1/trends/place.json';

/**
 * Get suggested hashtags based on content
 * @param content The content to suggest hashtags for
 * @param count Number of hashtags to suggest
 * @returns Array of suggested hashtags
 */
export async function getSuggestedHashtags(content: string, count: number = 5): Promise<string[]> {
  // Use DeepSeek API to generate hashtags
  try {
    return await generateHashtagsWithDeepSeek(content, count);
  } catch (error) {
    console.error('Error getting suggested hashtags:', error);
    // Fallback to mock data if there's an API error
    return getMockHashtags(content, count);
  }
}

/**
 * Get trending hashtags by category
 * @param category The hashtag category
 * @returns Array of trending hashtags
 */
export async function getTrendingHashtags(category: string): Promise<string[]> {
  // This could be fetched from an API in production
  // For now returning mock trending hashtags
  switch (category.toLowerCase()) {
    case 'business':
      return ['#entrepreneur', '#marketing', '#success', '#business', '#startup', '#innovation'];
    case 'technology':
      return ['#tech', '#ai', '#machinelearning', '#coding', '#webdev', '#innovation'];
    case 'health':
      return ['#fitness', '#wellness', '#health', '#nutrition', '#mindfulness'];
    case 'entertainment':
      return ['#movies', '#music', '#streaming', '#celebrity', '#hollywood'];
    case 'sports':
      return ['#fitness', '#basketball', '#football', '#sports', '#athlete'];
    default:
      return ['#trending', '#viral', '#popular', '#follow', '#socialmedia'];
  }
}

/**
 * Analyze an image and extract relevant hashtags
 * @param imageUrl URL of the image to analyze
 * @returns Array of hashtags
 */
export async function getHashtagsFromImage(imageUrl: string): Promise<string[]> {
  // Use DeepSeek API to analyze the image
  try {
    return await analyzeImageForHashtags(imageUrl);
  } catch (error) {
    console.error('Error analyzing image for hashtags:', error);
    // Fallback if API fails
    return ['#image', '#photo', '#picture', '#photography', '#visual', '#content'];
  }
}

/**
 * Get statistics for a specific hashtag
 * @param hashtag The hashtag to analyze (without #)
 * @returns Object with hashtag statistics
 */
export async function getHashtagStats(hashtag: string): Promise<any> {
  // This would typically come from a social media analytics API
  // For now returning mock data
  // In a real implementation, you might use the Twitter API or similar
  
  // Ensure hashtag doesn't have # prefix for consistency
  const cleanHashtag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
  
  // Generate some reasonable mock data
  const exposure = Math.floor(Math.random() * 100000) + 5000; // Random between 5K and 105K
  const tweets = Math.floor(Math.random() * 100) + 10; // Random between 10 and 110
  
  // Generate related hashtags based on category
  let relatedHashtags: string[] = [];
  if (['business', 'marketing', 'entrepreneur'].includes(cleanHashtag.toLowerCase())) {
    relatedHashtags = ['#business', '#marketing', '#entrepreneur', '#success', '#startup'];
  } else if (['tech', 'technology', 'ai', 'coding'].includes(cleanHashtag.toLowerCase())) {
    relatedHashtags = ['#tech', '#technology', '#ai', '#coding', '#programming'];
  } else {
    // Generate some generic related hashtags
    relatedHashtags = ['#trending', `#${cleanHashtag}tips`, `#${cleanHashtag}ideas`, '#follow', '#socialmedia'];
  }
  
  return {
    hashtag: cleanHashtag,
    exposure: exposure,
    tweets: tweets,
    hashtags: relatedHashtags
  };
}

/**
 * Helper function to generate mock hashtags
 * @param content Content to base hashtags on
 * @param count Number of hashtags to generate
 * @returns Array of mock hashtags
 */
function getMockHashtags(content: string, count: number): string[] {
  const baseHashtags = [
    '#socialmedia', '#marketing', '#content', '#digital', 
    '#trending', '#viral', '#strategy', '#growth', 
    '#engagement', '#audience', '#reach', '#analytics',
    '#brand', '#creative', '#campaign', '#influence'
  ];
  
  // Shuffle the array and take 'count' elements
  return baseHashtags
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
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