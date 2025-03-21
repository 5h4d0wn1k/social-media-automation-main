import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { telegramConfig } from '../../config';
import { postContentSchema } from '../../validation/schemas';
import { PlatformError, ValidationError } from '../../types/errors';

const TELEGRAM_BOT_API = 'https://api.telegram.org/bot';
const CHANNEL_USERNAME = 'shadownikofficial';

const telegramClient = axios.create({
  baseURL: `${TELEGRAM_BOT_API}${telegramConfig.botToken}`,
});

/**
 * Handle posting content to Telegram channel
 */
export async function handleTelegramPost(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    // Validate request data
    const validatedData = postContentSchema.parse(data);
    const { content, imageUrl } = validatedData;

    try {
      // If image is provided, send as photo with caption
      if (imageUrl) {
        const response = await telegramClient.post('/sendPhoto', {
          chat_id: `@${CHANNEL_USERNAME}`,
          photo: imageUrl,
          caption: content,
          parse_mode: 'HTML',
        });
        return res.status(200).json({ postId: response.data.result.message_id });
      }

      // Otherwise, send as text message
      const response = await telegramClient.post('/sendMessage', {
        chat_id: `@${CHANNEL_USERNAME}`,
        text: content,
        parse_mode: 'HTML',
      });
      return res.status(200).json({ postId: response.data.result.message_id });
    } catch (error) {
      throw new PlatformError('Telegram', 'Failed to send message', error);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof PlatformError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Telegram Post Error:', error);
    return res.status(500).json({ error: 'Failed to post to Telegram' });
  }
}

/**
 * Handle retrieving analytics for a Telegram post
 */
export async function handleTelegramAnalytics(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { postId } = data;

    try {
      // Get message statistics
      const response = await telegramClient.get('/getChat', {
        params: {
          chat_id: `@${CHANNEL_USERNAME}`,
        },
      });

      const stats = response.data.result;
      
      // Note: Telegram's free API doesn't provide detailed analytics
      // We can only get basic channel stats
      return res.status(200).json({
        subscribers: stats.members_count || 0,
        views: stats.views || 0,
        engagement: 0, // Not available in free API
      });
    } catch (error) {
      throw new PlatformError('Telegram', 'Failed to fetch channel analytics', error);
    }
  } catch (error) {
    if (error instanceof PlatformError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Telegram Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to fetch Telegram analytics' });
  }
}

function calculateEngagement(metrics: any): number {
  if (!metrics) return 0;
  const totalEngagements = metrics.likes + metrics.comments + metrics.shares;
  const totalImpressions = metrics.views || 1;
  return (totalEngagements / totalImpressions) * 100;
} 