import axios from 'axios';
import { Platform } from '../store';

const telegramClient = axios.create({
  baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`,
});

export async function postToTelegram(content: string, imageUrl?: string): Promise<string> {
  try {
    if (imageUrl) {
      // Post with photo
      const response = await telegramClient.post('/sendPhoto', {
        chat_id: process.env.TELEGRAM_CHANNEL_ID,
        photo: imageUrl,
        caption: content,
        parse_mode: 'HTML',
      });
      return response.data.result.message_id.toString();
    } else {
      // Post text only
      const response = await telegramClient.post('/sendMessage', {
        chat_id: process.env.TELEGRAM_CHANNEL_ID,
        text: content,
        parse_mode: 'HTML',
      });
      return response.data.result.message_id.toString();
    }
  } catch (error) {
    console.error('Error posting to Telegram:', error);
    throw new Error('Failed to post to Telegram');
  }
}

export async function getTelegramAnalytics(messageId: string) {
  try {
    // Get message statistics
    const response = await telegramClient.get('/getChat', {
      params: {
        chat_id: process.env.TELEGRAM_CHANNEL_ID,
      },
    });

    // Note: Telegram's free API doesn't provide detailed analytics
    // This is a simplified version that returns basic channel stats
    const stats = response.data.result;

    return {
      likes: 0, // Telegram doesn't provide like counts in free API
      comments: 0, // Comments are not available in free API
      shares: 0, // Share counts are not available in free API
      views: stats.members_count || 0,
      engagement: 0, // Engagement metrics are not available in free API
    };
  } catch (error) {
    console.error('Error fetching Telegram analytics:', error);
    throw new Error('Failed to fetch Telegram analytics');
  }
}

function calculateEngagement(stats: any): number {
  // Telegram's free API doesn't provide engagement metrics
  return 0;
} 