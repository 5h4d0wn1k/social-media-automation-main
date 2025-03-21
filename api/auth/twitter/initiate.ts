import { NextApiRequest, NextApiResponse } from 'next';
import { twitterConfig } from '../../../config';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Generate a random state for security
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store the state in your session or database for verification in callback
    
    // Construct the Twitter OAuth URL
    const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize');
    twitterAuthUrl.searchParams.append('response_type', 'code');
    twitterAuthUrl.searchParams.append('client_id', twitterConfig.clientId || '');
    twitterAuthUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`);
    twitterAuthUrl.searchParams.append('state', state);
    twitterAuthUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access');
    twitterAuthUrl.searchParams.append('code_challenge', state); // Using state as code challenge for simplicity
    twitterAuthUrl.searchParams.append('code_challenge_method', 'plain');

    // Redirect to Twitter
    return res.redirect(twitterAuthUrl.toString());
  } catch (error) {
    console.error('Twitter OAuth Initiation Error:', error);
    return res.status(500).json({ error: 'Failed to initiate Twitter OAuth' });
  }
} 