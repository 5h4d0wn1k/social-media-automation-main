import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { twitterConfig } from '../../../config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing required OAuth parameters' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.twitter.com/2/oauth2/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: twitterConfig.clientId || '',
        client_secret: twitterConfig.clientSecret || '',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
        code_verifier: state, // Using state as code verifier for simplicity
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    // Store the access token and user data in your database
    // You should implement this part based on your database setup
    
    // Redirect to success page
    return res.redirect('/auth/success?platform=twitter');
  } catch (error) {
    console.error('Twitter OAuth Callback Error:', error);
    return res.redirect('/auth/error?platform=twitter');
  }
} 