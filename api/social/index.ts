import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '../middleware';
import platformHandlers from './platforms';

/**
 * Main API handler for all social media interactions
 * This consolidated handler reduces the number of serverless functions needed
 * for Vercel deployment on the Hobby plan.
 */
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
      return res.status(400).json({ 
        error: `Unsupported platform: ${platform}`,
        supportedPlatforms: Object.keys(platformHandlers)
      });
    }

    // Log request in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`Processing ${platform} request for action: ${action}`);
    }

    // Handle the platform-specific request
    return platformHandlers[platform](req, res);
  } catch (error) {
    console.error('Social API Error:', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withMiddleware(handler); 