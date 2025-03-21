import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '../../middleware';
import { validateConfig } from '../../config';

// Platform-specific handlers
const platformHandlers = {
  twitter: async (req: NextApiRequest, res: NextApiResponse) => {
    const { action, data } = req.body;
    
    switch (action) {
      case 'post':
        return handleTwitterPost(req, res, data);
      case 'analytics':
        return handleTwitterAnalytics(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  },
  
  linkedin: async (req: NextApiRequest, res: NextApiResponse) => {
    const { action, data } = req.body;
    
    switch (action) {
      case 'post':
        return handleLinkedInPost(req, res, data);
      case 'analytics':
        return handleLinkedInAnalytics(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  },
  
  facebook: async (req: NextApiRequest, res: NextApiResponse) => {
    const { action, data } = req.body;
    
    switch (action) {
      case 'post':
        return handleFacebookPost(req, res, data);
      case 'analytics':
        return handleFacebookAnalytics(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  },
  
  instagram: async (req: NextApiRequest, res: NextApiResponse) => {
    const { action, data } = req.body;
    
    switch (action) {
      case 'post':
        return handleInstagramPost(req, res, data);
      case 'analytics':
        return handleInstagramAnalytics(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  },
  
  youtube: async (req: NextApiRequest, res: NextApiResponse) => {
    const { action, data } = req.body;
    
    switch (action) {
      case 'post':
        return handleYouTubePost(req, res, data);
      case 'analytics':
        return handleYouTubeAnalytics(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  },
  
  telegram: async (req: NextApiRequest, res: NextApiResponse) => {
    const { action, data } = req.body;
    
    switch (action) {
      case 'post':
        return handleTelegramPost(req, res, data);
      case 'analytics':
        return handleTelegramAnalytics(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  },
  
  whatsapp: async (req: NextApiRequest, res: NextApiResponse) => {
    const { action, data } = req.body;
    
    switch (action) {
      case 'post':
        return handleWhatsAppPost(req, res, data);
      case 'analytics':
        return handleWhatsAppAnalytics(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  },
  
  github: async (req: NextApiRequest, res: NextApiResponse) => {
    const { action, data } = req.body;
    
    switch (action) {
      case 'post':
        return handleGitHubPost(req, res, data);
      case 'analytics':
        return handleGitHubAnalytics(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  }
};

// Main handler
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { platform } = req.body;
    
    if (!platform || !platformHandlers[platform]) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    return platformHandlers[platform](req, res);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export the handler with middleware
export default withMiddleware(handler); 