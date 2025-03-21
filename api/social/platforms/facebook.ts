import { NextApiRequest, NextApiResponse } from 'next';
import { facebookConfig } from '../../config';

const FACEBOOK_API_BASE = 'https://graph.facebook.com/v18.0';

async function makeFacebookRequest(endpoint: string, method: string = 'GET', body?: any) {
  const response = await fetch(`${FACEBOOK_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${facebookConfig.accessToken}`,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`Facebook API error: ${response.statusText}`);
  }

  return response.json();
}

export async function handleFacebookPost(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { content, imageUrl } = data;
    
    // First, upload the image if provided
    let imageId: string | undefined;
    if (imageUrl) {
      const imageResponse = await makeFacebookRequest('/me/photos', 'POST', {
        url: imageUrl,
        published: false,
      });
      imageId = imageResponse.id;
    }

    // Create the post
    const postResponse = await makeFacebookRequest('/me/feed', 'POST', {
      message: content,
      ...(imageId && { attached_media: [{ media_fbid: imageId }] }),
    });

    return res.status(200).json({ postId: postResponse.id });
  } catch (error) {
    console.error('Facebook Post Error:', error);
    return res.status(500).json({ error: 'Failed to post to Facebook' });
  }
}

export async function handleFacebookAnalytics(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { postId } = data;

    const analytics = await makeFacebookRequest(`/${postId}/insights`, 'GET', {
      metric: ['post_impressions', 'post_reactions_by_type_total', 'post_comments', 'post_shares'],
    });

    const metrics = analytics.data.reduce((acc: any, metric: any) => {
      acc[metric.name] = metric.values[0].value;
      return acc;
    }, {});

    const reactions = metrics.post_reactions_by_type_total || {};
    const totalReactions = Object.values(reactions).reduce((sum: number, count: any) => sum + count, 0);

    return res.status(200).json({
      likes: totalReactions,
      comments: metrics.post_comments || 0,
      shares: metrics.post_shares || 0,
      views: metrics.post_impressions || 0,
      engagement: calculateEngagement({
        likes: totalReactions,
        comments: metrics.post_comments || 0,
        shares: metrics.post_shares || 0,
        views: metrics.post_impressions || 0,
      }),
    });
  } catch (error) {
    console.error('Facebook Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to fetch Facebook analytics' });
  }
}

function calculateEngagement(metrics: any): number {
  if (!metrics) return 0;
  const totalEngagements = metrics.likes + metrics.comments + metrics.shares;
  const totalImpressions = metrics.views || 1;
  return (totalEngagements / totalImpressions) * 100;
} 