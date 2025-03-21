import { Platform } from '../store';
import { env } from '@/config/env';

export interface PostAnalytics {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagement: number;
}

// Mock data for development
const DEFAULT_ANALYTICS: PostAnalytics = {
  likes: 0,
  comments: 0,
  shares: 0,
  views: 0,
  engagement: 0
};

const MOCK_ANALYTICS: Record<Platform, PostAnalytics> = {
  twitter: {
    likes: 45,
    comments: 12,
    shares: 8,
    views: 523,
    engagement: 12.4
  },
  linkedin: {
    likes: 67,
    comments: 23,
    shares: 15,
    views: 890,
    engagement: 11.8
  },
  facebook: {
    likes: 89,
    comments: 34,
    shares: 16,
    views: 1240,
    engagement: 11.2
  },
  telegram: {
    likes: 32,
    comments: 8,
    shares: 12,
    views: 421,
    engagement: 12.4
  },
  whatsapp: {
    likes: 24,
    comments: 6,
    shares: 8,
    views: 150,
    engagement: 25.3
  },
  instagram: {
    likes: 103,
    comments: 45,
    shares: 12,
    views: 1500,
    engagement: 10.7
  }
};

// Helper function to make API requests
async function makeApiRequest<T>(action: string, data: any): Promise<T> {
  // In development mode, use mock data
  if (env.IS_DEVELOPMENT) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    // Return mock data based on action
    if (action === 'post') {
      return { postId: `mock-${Date.now()}` } as any;
    } else if (action === 'analytics') {
      // Ensure we return a valid analytics object
      const platform = data.platform as Platform;
      if (!platform || !MOCK_ANALYTICS[platform]) {
        return { ...DEFAULT_ANALYTICS } as any;
      }
      return { ...MOCK_ANALYTICS[platform] } as any;
    }
  }

  // In production, make real API calls
  try {
    const response = await fetch(`${env.API_URL}/api/social`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...data }),
    });
  
    if (!response.ok) {
      throw new Error('API request failed');
    }
  
    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

export async function postToSocialMedia(platform: Platform, content: string, imageUrl?: string): Promise<string> {
  try {
    const { postId } = await makeApiRequest<{ postId: string }>('post', {
      platform,
      content,
      imageUrl,
    });
    return postId;
  } catch (error) {
    console.error(`Error posting to ${platform}:`, error);
    return `mock-${Date.now()}`; // Fallback for development
  }
}

/**
 * Post the same content to multiple social media platforms simultaneously
 */
export async function postToMultiplePlatforms(
  platforms: Platform[], 
  content: string, 
  mediaUrls?: string[]
): Promise<Record<Platform, { success: boolean; id?: string; error?: string }>> {
  const results: Record<Platform, { success: boolean; id?: string; error?: string }> = {} as any;
  
  // For each platform, make a post request
  const imageUrl = mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : undefined;
  
  for (const platform of platforms) {
    try {
      const postId = await postToSocialMedia(platform, content, imageUrl);
      results[platform] = { success: true, id: postId };
    } catch (error) {
      console.error(`Error posting to ${platform}:`, error);
      results[platform] = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  return results;
}

export async function getPostAnalytics(platform: Platform, postId: string): Promise<PostAnalytics> {
  try {
    const data = await makeApiRequest<PostAnalytics>('analytics', {
      platform,
      postId,
    });
    
    // Ensure all values are valid numbers
    return {
      likes: typeof data.likes === 'number' ? data.likes : 0,
      comments: typeof data.comments === 'number' ? data.comments : 0,
      shares: typeof data.shares === 'number' ? data.shares : 0,
      views: typeof data.views === 'number' ? data.views : 0,
      engagement: typeof data.engagement === 'number' ? data.engagement : 0
    };
  } catch (error) {
    console.error(`Error fetching analytics for ${platform}:`, error);
    return { ...DEFAULT_ANALYTICS };
  }
}

export async function downloadImage(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to download image');
    }
    return response.arrayBuffer();
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}