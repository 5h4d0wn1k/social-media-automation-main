import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '../middleware';

// Import platform handlers
import { handleTwitterPost, handleTwitterAnalytics } from './platforms/twitter';
import { handleLinkedInPost, handleLinkedInAnalytics } from './platforms/linkedin';
import { handleFacebookPost, handleFacebookAnalytics } from './platforms/facebook';
import { handleInstagramPost, handleInstagramAnalytics } from './platforms/instagram';
import { handleYouTubePost, handleYouTubeAnalytics } from './platforms/youtube';
import { handleTelegramPost, handleTelegramAnalytics } from './platforms/telegram';
import { handleWhatsAppPost, handleWhatsAppAnalytics } from './platforms/whatsapp';
import { handleGitHubPost, handleGitHubAnalytics } from './platforms/github';

// Platform-specific handlers
const platformHandlers = {
  twitter: {
    post: handleTwitterPost,
    analytics: handleTwitterAnalytics,
  },
  linkedin: {
    post: handleLinkedInPost,
    analytics: handleLinkedInAnalytics,
  },
  facebook: {
    post: handleFacebookPost,
    analytics: handleFacebookAnalytics,
  },
  instagram: {
    post: handleInstagramPost,
    analytics: handleInstagramAnalytics,
  },
  youtube: {
    post: handleYouTubePost,
    analytics: handleYouTubeAnalytics,
  },
  telegram: {
    post: handleTelegramPost,
    analytics: handleTelegramAnalytics,
  },
  whatsapp: {
    post: handleWhatsAppPost,
    analytics: handleWhatsAppAnalytics,
  },
  github: {
    post: handleGitHubPost,
    analytics: handleGitHubAnalytics,
  },
};

// Main handler
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { platform, action, data } = req.body;
    
    if (!platform || !platformHandlers[platform]) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    if (!action || !platformHandlers[platform][action]) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    return platformHandlers[platform][action](req, res, data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export the handler with middleware
export default withMiddleware(handler); 