import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '../../middleware';
import { validateConfig } from '../../config';

// Import handlers from other files
// For Twitter
import { handleTwitterPost, handleTwitterAnalytics } from './twitter';

// Import YouTube handlers
import { handleYouTubePost, handleYouTubeAnalytics } from './youtube';

// Mock handlers for platforms that aren't fully implemented
// These will return mock responses to avoid TypeScript errors
const createMockHandlers = (platform: string) => {
  const mockPost = async (req: NextApiRequest, res: NextApiResponse, data: any) => {
    console.log(`Mock ${platform} post:`, data);
    return res.status(200).json({ 
      postId: `mock-${Date.now()}-${platform}`,
      message: `Mock post to ${platform} - not actually posted in development`
    });
  };

  const mockAnalytics = async (req: NextApiRequest, res: NextApiResponse, data: any) => {
    console.log(`Mock ${platform} analytics:`, data);
    return res.status(200).json({
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 30),
      views: Math.floor(Math.random() * 1000),
      engagement: Math.random() * 20
    });
  };

  return { post: mockPost, analytics: mockAnalytics };
};

// Get handler functions (real or mock)
const linkedInHandlers = createMockHandlers('linkedin');
const facebookHandlers = createMockHandlers('facebook');
const instagramHandlers = createMockHandlers('instagram');
const telegramHandlers = createMockHandlers('telegram');
const whatsappHandlers = createMockHandlers('whatsapp');
const githubHandlers = createMockHandlers('github');

// Create handler function references
const handleLinkedInPost = linkedInHandlers.post;
const handleLinkedInAnalytics = linkedInHandlers.analytics;
const handleFacebookPost = facebookHandlers.post;
const handleFacebookAnalytics = facebookHandlers.analytics;
const handleInstagramPost = instagramHandlers.post;
const handleInstagramAnalytics = instagramHandlers.analytics;
const handleTelegramPost = telegramHandlers.post;
const handleTelegramAnalytics = telegramHandlers.analytics;
const handleWhatsAppPost = whatsappHandlers.post;
const handleWhatsAppAnalytics = whatsappHandlers.analytics;
const handleGitHubPost = githubHandlers.post;
const handleGitHubAnalytics = githubHandlers.analytics;

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
  },
};

// Main handler function
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for valid HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { platform, action, data } = req.body;

    // Check for required fields
    if (!platform || !action || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if platform is supported
    if (!platformHandlers[platform]) {
      return res.status(400).json({ error: `Unsupported platform: ${platform}` });
    }

    // Handle the platform-specific request
    return platformHandlers[platform](req, res);
  } catch (error) {
    console.error('Social API Error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

export default withMiddleware(handler); 