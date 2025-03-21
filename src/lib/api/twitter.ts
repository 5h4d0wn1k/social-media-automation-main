import { env } from '@/config/env';

export async function postToTwitter(content: string, imageUrl?: string): Promise<string> {
  try {
    const response = await fetch(`${env.API_URL}/api/social/platforms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: 'twitter',
        action: 'post',
        data: {
          content,
          imageUrl,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to post to Twitter');
    }

    const data = await response.json();
    return data.postId;
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    throw new Error('Failed to post to Twitter');
  }
}

export async function getTwitterAnalytics(tweetId: string) {
  try {
    const response = await fetch(`${env.API_URL}/api/social/platforms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: 'twitter',
        action: 'analytics',
        data: {
          postId: tweetId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Twitter analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Twitter analytics:', error);
    throw new Error('Failed to fetch Twitter analytics');
  }
} 