import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { youtubeConfig } from '../../config';

const youtube = google.youtube('v3');
const oauth2Client = new google.auth.OAuth2(
  youtubeConfig.clientId,
  youtubeConfig.clientSecret,
  'http://localhost:3000/api/auth/youtube/callback'
);

oauth2Client.setCredentials({
  access_token: youtubeConfig.accessToken,
});

export async function handleYouTubePost(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { content, videoUrl, title, description } = data;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'YouTube posts require a video' });
    }

    // Upload the video
    const videoResponse = await youtube.videos.insert({
      auth: oauth2Client,
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description: `${description}\n\n${content}`,
        },
        status: {
          privacyStatus: 'public',
        },
      },
      media: {
        body: await fetch(videoUrl).then(res => res.blob()),
      },
    });

    return res.status(200).json({ postId: videoResponse.data.id });
  } catch (error) {
    console.error('YouTube Post Error:', error);
    return res.status(500).json({ error: 'Failed to post to YouTube' });
  }
}

export async function handleYouTubeAnalytics(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { postId } = data;

    // Get video statistics
    const videoResponse = await youtube.videos.list({
      auth: oauth2Client,
      part: ['statistics'],
      id: [postId],
    });

    const statistics = videoResponse.data.items?.[0]?.statistics || {};

    return res.status(200).json({
      likes: parseInt(statistics.likeCount || '0'),
      comments: parseInt(statistics.commentCount || '0'),
      shares: 0, // YouTube API doesn't provide share count
      views: parseInt(statistics.viewCount || '0'),
      engagement: calculateEngagement({
        likes: parseInt(statistics.likeCount || '0'),
        comments: parseInt(statistics.commentCount || '0'),
        views: parseInt(statistics.viewCount || '0'),
      }),
    });
  } catch (error) {
    console.error('YouTube Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to fetch YouTube analytics' });
  }
}

function calculateEngagement(metrics: any): number {
  if (!metrics) return 0;
  const totalEngagements = metrics.likes + metrics.comments;
  const totalImpressions = metrics.views || 1;
  return (totalEngagements / totalImpressions) * 100;
} 