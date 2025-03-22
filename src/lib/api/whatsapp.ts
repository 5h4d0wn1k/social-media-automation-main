import axios from 'axios';
import { Platform } from '../store';
import { env } from '@/config/env';

const whatsappClient = axios.create({
  baseURL: `https://graph.facebook.com/v18.0/${env.WHATSAPP.PHONE_NUMBER_ID}`,
  headers: {
    'Authorization': `Bearer ${env.WHATSAPP.ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Client for WhatsApp Business API account registration
const whatsappBusinessClient = axios.create({
  baseURL: 'https://api.whatsapp.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Register a WhatsApp Business API account
 * @param countryCode Country code (without +)
 * @param phoneNumber Phone number (without country code)
 * @param method Verification method (sms or voice)
 * @param certificate Base64-encoded certificate
 * @param pin Optional 6-digit PIN for two-step verification
 * @returns Registration response
 */
export async function registerWhatsAppAccount(
  countryCode: string,
  phoneNumber: string, 
  method: 'sms' | 'voice',
  certificate: string,
  pin?: string
): Promise<{ 
  success: boolean; 
  message: string; 
  vname?: string; 
  status?: 'created' | 'accepted' | 'error';
}> {
  try {
    // In a real implementation, this would call the WhatsApp Business API
    // This is a mock implementation for demonstration purposes

    // Mock the API call for demonstration
    console.log(`Registering WhatsApp account with:`, {
      cc: countryCode,
      phone_number: phoneNumber,
      method,
      cert: certificate.substring(0, 20) + '...',
      pin: pin ? '******' : undefined
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate different responses
    if (Math.random() > 0.8) {
      // Simulate account already exists
      return {
        success: true,
        message: 'Account already exists and is registered.',
        status: 'created'
      };
    } else {
      // Simulate successful code sending
      return {
        success: true,
        message: `Verification code sent via ${method}. Please check your ${method === 'sms' ? 'messages' : 'phone'}.`,
        vname: 'Shadownik', // This would be decoded from the certificate
        status: 'accepted'
      };
    }
  } catch (error) {
    console.error('Error registering WhatsApp account:', error);
    return {
      success: false,
      message: 'Failed to register WhatsApp account. Please check your information and try again.',
      status: 'error'
    };
  }
}

/**
 * Verify a WhatsApp Business API account with a verification code
 * @param countryCode Country code
 * @param phoneNumber Phone number
 * @param code Verification code received
 * @returns Verification response
 */
export async function verifyWhatsAppAccount(
  countryCode: string,
  phoneNumber: string,
  code: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // In a real implementation, this would call the WhatsApp Business API
    // POST /v1/account/verify
    console.log(`Verifying WhatsApp account with code: ${code}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful verification
    return {
      success: true,
      message: 'Phone number successfully verified. Your WhatsApp Business API client is now registered.'
    };
  } catch (error) {
    console.error('Error verifying WhatsApp account:', error);
    return {
      success: false,
      message: 'Failed to verify phone number. Please check your verification code and try again.'
    };
  }
}

export async function postToWhatsApp(content: string, imageUrl?: string): Promise<string> {
  try {
    // WhatsApp requires a recipient phone number
    const recipient = env.WHATSAPP.RECIPIENT_PHONE_NUMBER;

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

/**
 * Verify WhatsApp business phone number
 * @param certificate The WhatsApp verification certificate
 * @param displayName The business display name
 * @returns success flag and message
 */
export async function verifyWhatsAppNumber(certificate: string, displayName: string): Promise<{success: boolean, message: string}> {
  try {
    // In a real implementation, this would call the WhatsApp Business Management API
    // to verify the phone number with the certificate
    console.log(`Verifying number with certificate: ${certificate.substring(0, 20)}...`);
    console.log(`Setting display name to: ${displayName}`);
    
    // Simulated API call
    // In production, you would use the appropriate endpoint for verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: 'Phone number successfully verified. You can now send WhatsApp messages.'
    };
  } catch (error) {
    console.error('Error verifying WhatsApp number:', error);
    return {
      success: false,
      message: 'Failed to verify phone number. Please check your certificate and try again.'
    };
  }
}

/**
 * Check if a WhatsApp Business API client is registered
 * @returns Registration status
 */
export async function checkWhatsAppRegistration(): Promise<{
  isRegistered: boolean;
  phoneNumber?: string;
  displayName?: string;
}> {
  try {
    // In a real implementation, this would call the WhatsApp Business API
    // This is a mock implementation for demonstration purposes
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demonstration, we'll use environment values
    if (env.WHATSAPP.PHONE_NUMBER_ID && env.WHATSAPP.ACCESS_TOKEN) {
      return {
        isRegistered: true,
        phoneNumber: env.WHATSAPP.RECIPIENT_PHONE_NUMBER,
        displayName: 'Shadownik'
      };
    }
    
    return {
      isRegistered: false
    };
  } catch (error) {
    console.error('Error checking WhatsApp registration:', error);
    return {
      isRegistered: false
    };
  }
}

function calculateEngagement(stats: any): number {
  // WhatsApp's free API doesn't provide engagement metrics
  return 0;
} 