import axios from 'axios';
import { Platform } from '../store';

const whatsappClient = axios.create({
  baseURL: `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`,
  headers: {
    'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export async function postToWhatsApp(content: string, imageUrl?: string): Promise<string> {
  try {
    // WhatsApp requires a recipient phone number
    const recipient = process.env.WHATSAPP_RECIPIENT_PHONE_NUMBER;

    if (imageUrl) {
      // Send message with image
      const response = await whatsappClient.post('/messages', {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'image',
        image: {
          link: imageUrl,
        },
        caption: content,
      });
      return response.data.messages[0].id;
    } else {
      // Send text message
      const response = await whatsappClient.post('/messages', {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: {
          body: content,
        },
      });
      return response.data.messages[0].id;
    }
  } catch (error) {
    console.error('Error posting to WhatsApp:', error);
    throw new Error('Failed to post to WhatsApp');
  }
}

export async function getWhatsAppAnalytics(messageId: string) {
  try {
    // Note: WhatsApp's free API doesn't provide detailed analytics
    // This is a simplified version that returns basic message status
    const response = await whatsappClient.get(`/messages/${messageId}`);
    const status = response.data.messages[0].status;

    return {
      likes: 0, // WhatsApp doesn't provide like counts in free API
      comments: 0, // Comments are not available in free API
      shares: 0, // Share counts are not available in free API
      views: status === 'sent' ? 1 : 0,
      engagement: 0, // Engagement metrics are not available in free API
    };
  } catch (error) {
    console.error('Error fetching WhatsApp analytics:', error);
    throw new Error('Failed to fetch WhatsApp analytics');
  }
}

function calculateEngagement(stats: any): number {
  // WhatsApp's free API doesn't provide engagement metrics
  return 0;
} 