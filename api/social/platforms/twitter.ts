import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { twitterConfig } from '../../config';
import { postContentSchema, analyticsRequestSchema } from '../../validation/schemas';
import { PlatformError, ValidationError } from '../../types/errors';

const twitterClient = axios.create({
  baseURL: 'https://api.twitter.com/2',
  headers: {
    'Authorization': `Bearer ${twitterConfig.accessToken}`,
  },
});

export async function handleTwitterPost(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    // Validate request data
    const validatedData = postContentSchema.parse(data);
    const { content, imageUrl } = validatedData;
    
    // First, upload media if provided
    let mediaId: string | undefined;
    if (imageUrl) {
      try {
        const mediaResponse = await axios.post('https://upload.twitter.com/1.1/media/upload.json', {
          media_data: imageUrl,
          media_category: 'tweet_image',
        }, {
          headers: {
            'Authorization': `Bearer ${twitterConfig.accessToken}`,
          },
        });
        mediaId = mediaResponse.data.media_id_string;
      } catch (error) {
        throw new PlatformError('Twitter', 'Failed to upload media', error);
      }
    }

    // Create the tweet
    try {
      const tweetResponse = await twitterClient.post('/tweets', {
        text: content,
        ...(mediaId && { media: { media_ids: [mediaId] } }),
      });

      return res.status(200).json({ postId: tweetResponse.data.data.id });
    } catch (error) {
      throw new PlatformError('Twitter', 'Failed to create tweet', error);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof PlatformError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Twitter Post Error:', error);
    return res.status(500).json({ error: 'Failed to post to Twitter' });
  }
}

export async function handleTwitterAnalytics(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    // Validate request data
    const validatedData = analyticsRequestSchema.parse(data);
    const { postId } = validatedData;

    try {
      const response = await twitterClient.get(`/tweets/${postId}`, {
        params: {
          'tweet.fields': 'public_metrics',
        },
      });

      const metrics = response.data.data.public_metrics;

      return res.status(200).json({
        likes: metrics.like_count || 0,
        retweets: metrics.retweet_count || 0,
        replies: metrics.reply_count || 0,
        views: metrics.impression_count || 0,
        engagement: calculateEngagement(metrics),
      });
    } catch (error) {
      throw new PlatformError('Twitter', 'Failed to fetch tweet analytics', error);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof PlatformError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Twitter Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to fetch Twitter analytics' });
  }
}

function calculateEngagement(metrics: any): number {
  if (!metrics) return 0;
  const totalEngagements = (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0);
  const totalImpressions = metrics.impression_count || 1;
  return (totalEngagements / totalImpressions) * 100;
} 