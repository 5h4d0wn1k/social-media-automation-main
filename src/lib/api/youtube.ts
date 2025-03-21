import { google } from 'googleapis';
import { Platform } from '../store';

const youtube = google.youtube('v3');
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

export async function postToYouTube(content: string, imageUrl?: string): Promise<string> {
  try {
    // Create a video description
    const description = `${content}\n\n${imageUrl ? `Thumbnail: ${imageUrl}` : ''}`;

    // Create a video resource
    const videoResource = {
      snippet: {
        title: content.substring(0, 100), // YouTube titles are limited to 100 characters
        description,
        tags: ['social', 'automation'],
      },
      status: {
        privacyStatus: 'public',
      },
    };

    // Note: This is a placeholder. Actual video upload would require handling file uploads
    // and using the resumable upload protocol
    console.log('YouTube video upload would be implemented here:', videoResource);

    return 'video-id-placeholder';
  } catch (error) {
    console.error('Error posting to YouTube:', error);
    throw new Error('Failed to post to YouTube');
  }
}

export async function getYouTubeAnalytics(videoId: string) {
  try {
    const response = await youtube.videos.list({
      auth: oauth2Client,
      part: ['statistics'],
      id: [videoId],
    });

    const stats = response.data.items?.[0]?.statistics || {};

    return {
      likes: parseInt(stats.likeCount || '0'),
      comments: parseInt(stats.commentCount || '0'),
      shares: 0, // YouTube API doesn't provide share count
      views: parseInt(stats.viewCount || '0'),
      engagement: calculateEngagement(stats),
    };
  } catch (error) {
    console.error('Error fetching YouTube analytics:', error);
    throw new Error('Failed to fetch YouTube analytics');
  }
}

function calculateEngagement(stats: any): number {
  if (!stats) return 0;
  const totalEngagements = parseInt(stats.likeCount || '0') + 
                          parseInt(stats.commentCount || '0');
  const totalViews = parseInt(stats.viewCount || '1');
  return (totalEngagements / totalViews) * 100;
} 