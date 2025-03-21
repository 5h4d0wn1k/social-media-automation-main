// Twitter API Configuration
export const twitterConfig = {
  apiKey: process.env.TWITTER_API_KEY,
  apiSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
};

// LinkedIn API Configuration
export const linkedinConfig = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
  userId: process.env.LINKEDIN_USER_ID,
};

// Facebook API Configuration
export const facebookConfig = {
  appId: process.env.FACEBOOK_APP_ID,
  appSecret: process.env.FACEBOOK_APP_SECRET,
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
};

// Instagram API Configuration
export const instagramConfig = {
  accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
};

// YouTube API Configuration
export const youtubeConfig = {
  apiKey: process.env.YOUTUBE_API_KEY,
  clientId: process.env.YOUTUBE_CLIENT_ID,
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
};

// Telegram API Configuration
export const telegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  channelId: process.env.TELEGRAM_CHANNEL_ID,
  channelUsername: 'shadownikofficial',
};

// WhatsApp API Configuration
export const whatsappConfig = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
};

// GitHub API Configuration
export const githubConfig = {
  accessToken: process.env.GITHUB_ACCESS_TOKEN,
};

// Validate required environment variables
export function validateConfig() {
  const requiredVars = {
    twitter: ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET'],
    linkedin: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
    telegram: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHANNEL_ID'],
  };

  const missingVars: string[] = [];

  Object.entries(requiredVars).forEach(([platform, vars]) => {
    vars.forEach((varName) => {
      if (!process.env[varName]) {
        missingVars.push(`${varName} (${platform})`);
      }
    });
  });

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Validate LinkedIn configuration
export function validateLinkedInConfig() {
  const requiredVars = ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required LinkedIn environment variables: ${missingVars.join(', ')}`);
  }
} 