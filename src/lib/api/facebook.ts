import axios from 'axios';
import { Platform } from '../store';

const facebookClient = axios.create({
  baseURL: 'https://graph.facebook.com/v18.0',
  headers: {
    'Authorization': `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}`,
  },
});

export async function postToFacebook(content: string, imageUrl?: string): Promise<string> {
  try {
    // First, upload the image if provided
    let imageId: string | undefined;
    if (imageUrl) {
      const imageResponse = await facebookClient.post(`/${process.env.FACEBOOK_PAGE_ID}/photos`, {
        url: imageUrl,
        published: false,
      });
      imageId = imageResponse.data.id;
    }

    // Create the post
    const postResponse = await facebookClient.post(`/${process.env.FACEBOOK_PAGE_ID}/feed`, {
      message: content,
      ...(imageId && { attached_media: [{ media_fbid: imageId }] }),
    });

    return postResponse.data.id;
  } catch (error) {
    console.error('Error posting to Facebook:', error);
    throw new Error('Failed to post to Facebook');
  }
}

export async function getFacebookAnalytics(postId: string) {
  try {
    const response = await facebookClient.get(`/${postId}/insights`, {
      params: {
        metric: ['post_reactions_by_type_total', 'post_comments', 'post_shares', 'post_impressions'],
      },
    });

    const metrics = response.data.data.reduce((acc: any, metric: any) => {
      acc[metric.name] = metric.values[0].value;
      return acc;
    }, {});

    return {
      likes: metrics.post_reactions_by_type_total?.like || 0,
      comments: metrics.post_comments || 0,
      shares: metrics.post_shares || 0,
      views: metrics.post_impressions || 0,
      engagement: calculateEngagement(metrics),
    };
  } catch (error) {
    console.error('Error fetching Facebook analytics:', error);
    throw new Error('Failed to fetch Facebook analytics');
  }
}

function calculateEngagement(metrics: any): number {
  if (!metrics) return 0;
  const totalEngagements = (metrics.post_reactions_by_type_total?.like || 0) + 
                          (metrics.post_comments || 0) + 
                          (metrics.post_shares || 0);
  const totalImpressions = metrics.post_impressions || 1;
  return (totalEngagements / totalImpressions) * 100;
} 