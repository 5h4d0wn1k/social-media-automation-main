// Environment variables configuration
export const env = {
  // API URLs
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  // Social Media Credentials
  TWITTER: {
    API_KEY: import.meta.env.VITE_TWITTER_API_KEY,
    API_SECRET: import.meta.env.VITE_TWITTER_API_SECRET,
    ACCESS_TOKEN: import.meta.env.VITE_TWITTER_ACCESS_TOKEN,
    ACCESS_SECRET: import.meta.env.VITE_TWITTER_ACCESS_SECRET,
    CLIENT_ID: import.meta.env.VITE_TWITTER_CLIENT_ID,
    CLIENT_SECRET: import.meta.env.VITE_TWITTER_CLIENT_SECRET,
  },
  
  LINKEDIN: {
    CLIENT_ID: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
    CLIENT_SECRET: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET,
    ACCESS_TOKEN: import.meta.env.VITE_LINKEDIN_ACCESS_TOKEN,
    USER_ID: import.meta.env.VITE_LINKEDIN_USER_ID,
  },
  
  TELEGRAM: {
    BOT_TOKEN: import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
    CHANNEL_ID: import.meta.env.VITE_TELEGRAM_CHANNEL_ID,
  },
  
  // Other configurations
  NODE_ENV: import.meta.env.MODE,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
}; 