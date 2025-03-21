import { NextApiRequest, NextApiResponse } from 'next';
import { whatsappConfig } from '../../config';

const WHATSAPP_API_BASE = `https://graph.facebook.com/v18.0/${whatsappConfig.phoneNumberId}`;

async function makeWhatsAppRequest(endpoint: string, method: string = 'GET', body?: any) {
  const response = await fetch(`${WHATSAPP_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${whatsappConfig.accessToken}`,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.statusText}`);
  }

  return response.json();
}

export async function handleWhatsAppPost(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { content, imageUrl, to } = data;
    
    if (!to) {
      return res.status(400).json({ error: 'Recipient phone number is required' });
    }

    let response;
    if (imageUrl) {
      // Send image message
      response = await makeWhatsAppRequest('/messages', 'POST', {
        messaging_product: 'whatsapp',
        to,
        type: 'image',
        image: {
          link: imageUrl,
        },
        caption: content,
      });
    } else {
      // Send text message
      response = await makeWhatsAppRequest('/messages', 'POST', {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
          body: content,
        },
      });
    }

    return res.status(200).json({ postId: response.messages[0].id });
  } catch (error) {
    console.error('WhatsApp Post Error:', error);
    return res.status(500).json({ error: 'Failed to post to WhatsApp' });
  }
}

export async function handleWhatsAppAnalytics(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { postId } = data;

    // Get message status
    const message = await makeWhatsAppRequest(`/messages/${postId}`, 'GET');

    // Note: WhatsApp Business API doesn't provide detailed analytics
    // We'll return basic delivery status
    return res.status(200).json({
      likes: 0, // Not available
      comments: 0, // Not available
      shares: 0, // Not available
      views: message.status === 'delivered' ? 1 : 0,
      engagement: 0, // Not available
    });
  } catch (error) {
    console.error('WhatsApp Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to fetch WhatsApp analytics' });
  }
}

function calculateEngagement(metrics: any): number {
  if (!metrics) return 0;
  const totalEngagements = metrics.likes + metrics.comments + metrics.shares;
  const totalImpressions = metrics.views || 1;
  return (totalEngagements / totalImpressions) * 100;
} 