import axios from 'axios';
import { Platform } from '../store';

const linkedinClient = axios.create({
  baseURL: 'https://api.linkedin.com/v2',
  headers: {
    'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
    'X-Restli-Protocol-Version': '2.0.0',
  },
});

export async function postToLinkedIn(content: string, imageUrl?: string): Promise<string> {
  try {
    // First, register the image if provided
    let imageAsset: string | undefined;
    if (imageUrl) {
      const imageResponse = await linkedinClient.post('/assets', {
        media: imageUrl,
        mediaType: 'image/jpeg',
      });
      imageAsset = imageResponse.data.value;
    }

    // Create the post
    const postResponse = await linkedinClient.post('/ugcPosts', {
      author: `urn:li:person:${process.env.LINKEDIN_USER_ID}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          ...(imageAsset && {
            shareMediaCategory: 'IMAGE',
            media: [{
              status: 'READY',
              originalUrl: imageAsset,
            }],
          }),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    });

    return postResponse.data.id;
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    throw new Error('Failed to post to LinkedIn');
  }
}

export async function getLinkedInAnalytics(postId: string) {
  try {
    const response = await linkedinClient.get(`/socialActions/${postId}/statistics`);
    const stats = response.data;

    return {
      likes: stats.likeCount || 0,
      comments: stats.commentCount || 0,
      shares: stats.shareCount || 0,
      views: stats.impressionCount || 0,
      engagement: calculateEngagement(stats),
    };
  } catch (error) {
    console.error('Error fetching LinkedIn analytics:', error);
    throw new Error('Failed to fetch LinkedIn analytics');
  }
}

function calculateEngagement(stats: any): number {
  if (!stats) return 0;
  const totalEngagements = (stats.likeCount || 0) + (stats.commentCount || 0) + (stats.shareCount || 0);
  const totalImpressions = stats.impressionCount || 1;
  return (totalEngagements / totalImpressions) * 100;
} 