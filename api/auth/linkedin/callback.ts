import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { linkedinConfig } from '../../../config';
import { ValidationError } from '../../../types/errors';
import { oauthCallbackSchema } from '../../../validation/schemas';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate parameters
    const { code, state } = oauthCallbackSchema.parse(req.query);

    // Exchange code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: linkedinConfig.clientId || '',
        client_secret: linkedinConfig.clientSecret || '',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = tokenResponse.data;

    // Get user profile including ID
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const userId = profileResponse.data.id;

    // Update .env file with new credentials
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update or add LinkedIn credentials
    const updates = {
      'LINKEDIN_ACCESS_TOKEN': access_token,
      'LINKEDIN_USER_ID': userId,
    };

    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });

    // Write back to .env file
    fs.writeFileSync(envPath, envContent);

    // Log success (without sensitive data)
    console.log('LinkedIn Auth Success: Credentials updated in .env file');
    
    // Redirect to success page
    return res.redirect('/auth/success?platform=linkedin');
  } catch (error) {
    console.error('LinkedIn OAuth Callback Error:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.redirect('/auth/error?platform=linkedin');
  }
} 