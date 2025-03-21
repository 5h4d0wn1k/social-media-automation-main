import axios from 'axios';
import { Platform } from '../store';

const instagramClient = axios.create({
  baseURL: 'https://graph.facebook.com/v18.0',
  headers: {
    'Authorization': `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`,
  },
});

export async function postToInstagram(content: string, imageUrl?: string): Promise<string> {
  try {
    if (!imageUrl) {
      throw new Error('Instagram requires an image for posting');
    }

    // First, create a container for the media
    const containerResponse = await instagramClient.post(`/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`, {
      image_url: imageUrl,
      caption: content,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
    });

    // Then publish the container
    const publishResponse = await instagramClient.post(`/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`, {
      creation_id: containerResponse.data.id,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
    });

    return publishResponse.data.id;
  } catch (error) {
    console.error('Error posting to Instagram:', error);
    throw new Error('Failed to post to Instagram');
  }
}

export async function getInstagramAnalytics(postId: string) {
  try {
    const response = await instagramClient.get(`/${postId}/insights`, {
      params: {
        metric: ['engagement', 'impressions', 'reach', 'saved'],
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      },
    });

    const metrics = response.data.data.reduce((acc: any, metric: any) => {
      acc[metric.name] = metric.values[0].value;
      return acc;
    }, {});

    return {
      likes: metrics.engagement?.like_count || 0,
      comments: metrics.engagement?.comment_count || 0,
      shares: metrics.engagement?.share_count || 0,
      views: metrics.impressions || 0,
      engagement: calculateEngagement(metrics),
    };
  } catch (error) {
    console.error('Error fetching Instagram analytics:', error);
    throw new Error('Failed to fetch Instagram analytics');
  }
}

function calculateEngagement(metrics: any): number {
  if (!metrics) return 0;
  const totalEngagements = (metrics.engagement?.like_count || 0) + 
                          (metrics.engagement?.comment_count || 0) + 
                          (metrics.engagement?.share_count || 0);
  const totalImpressions = metrics.impressions || 1;
  return (totalEngagements / totalImpressions) * 100;
} 