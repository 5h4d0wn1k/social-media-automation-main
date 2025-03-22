import { NextApiRequest, NextApiResponse } from 'next';
// Remove googleapis dependency for now
import { youtubeConfig } from '../../config';

// Mock YouTube handlers to avoid dependency issues
export async function handleYouTubePost(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { content, videoUrl, title, description } = data;
    
    if (!videoUrl && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ error: 'YouTube posts require a video' });
    }

    // For development, return mock data
    console.log('Mock YouTube post:', { content, videoUrl, title, description });
    return res.status(200).json({ 
      postId: `mock-${Date.now()}-youtube`,
      message: 'Mock YouTube post - not actually posted'
    });
  } catch (error) {
    console.error('YouTube Post Error:', error);
    return res.status(500).json({ error: 'Failed to post to YouTube' });
  }
}

export async function handleYouTubeAnalytics(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { postId } = data;

    // For development, return mock data
    console.log('Mock YouTube analytics for postId:', postId);
    return res.status(200).json({
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 30),
      views: Math.floor(Math.random() * 1000),
      engagement: Math.random() * 20
    });
  } catch (error) {
    console.error('YouTube Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to fetch YouTube analytics' });
  }
}

function calculateEngagement(metrics: any): number {
  if (!metrics) return 0;
  const totalEngagements = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
  const totalViews = metrics.views || 1;
  return parseFloat(((totalEngagements / totalViews) * 100).toFixed(1));
} 