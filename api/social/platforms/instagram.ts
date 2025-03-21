import { NextApiRequest, NextApiResponse } from 'next';
import { instagramConfig } from '../../config';

const INSTAGRAM_API_BASE = 'https://graph.instagram.com/v18.0';

async function makeInstagramRequest(endpoint: string, method: string = 'GET', body?: any) {
  const response = await fetch(`${INSTAGRAM_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${instagramConfig.accessToken}`,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`Instagram API error: ${response.statusText}`);
  }

  return response.json();
}

export async function handleInstagramPost(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { content, imageUrl } = data;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Instagram posts require an image' });
    }

    // First, create a container for the media
    const containerResponse = await makeInstagramRequest('/me/media', 'POST', {
      image_url: imageUrl,
      caption: content,
    });

    // Then publish the container
    const publishResponse = await makeInstagramRequest('/me/media_publish', 'POST', {
      creation_id: containerResponse.id,
    });

    return res.status(200).json({ postId: publishResponse.id });
  } catch (error) {
    console.error('Instagram Post Error:', error);
    return res.status(500).json({ error: 'Failed to post to Instagram' });
  }
}

export async function handleInstagramAnalytics(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { postId } = data;

    const analytics = await makeInstagramRequest(`/${postId}/insights`, 'GET', {
      metric: ['engagement', 'impressions', 'reach', 'saved'],
    });

    const metrics = analytics.data.reduce((acc: any, metric: any) => {
      acc[metric.name] = metric.values[0].value;
      return acc;
    }, {});

    return res.status(200).json({
      likes: metrics.engagement?.like_count || 0,
      comments: metrics.engagement?.comment_count || 0,
      shares: metrics.engagement?.share_count || 0,
      views: metrics.impressions || 0,
      engagement: calculateEngagement({
        likes: metrics.engagement?.like_count || 0,
        comments: metrics.engagement?.comment_count || 0,
        shares: metrics.engagement?.share_count || 0,
        views: metrics.impressions || 0,
      }),
    });
  } catch (error) {
    console.error('Instagram Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to fetch Instagram analytics' });
  }
}

function calculateEngagement(metrics: any): number {
  if (!metrics) return 0;
  const totalEngagements = metrics.likes + metrics.comments + metrics.shares;
  const totalImpressions = metrics.views || 1;
  return (totalEngagements / totalImpressions) * 100;
} 