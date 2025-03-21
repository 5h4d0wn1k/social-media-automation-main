import { NextApiRequest, NextApiResponse } from 'next';
import { linkedinConfig } from '../../../config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Generate a random state for security
    const state = Math.random().toString(36).substring(7);
    
    // Store the state in your session or database for verification in callback
    
    // Construct the LinkedIn OAuth URL
    const linkedinAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    linkedinAuthUrl.searchParams.append('response_type', 'code');
    linkedinAuthUrl.searchParams.append('client_id', linkedinConfig.clientId || '');
    linkedinAuthUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`);
    linkedinAuthUrl.searchParams.append('state', state);
    linkedinAuthUrl.searchParams.append('scope', 'openid profile w_member_social');

    // Redirect to LinkedIn
    return res.redirect(linkedinAuthUrl.toString());
  } catch (error) {
    console.error('LinkedIn OAuth Initiation Error:', error);
    return res.status(500).json({ error: 'Failed to initiate LinkedIn OAuth' });
  }
} 