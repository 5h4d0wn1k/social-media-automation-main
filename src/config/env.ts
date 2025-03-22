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
  
  WHATSAPP: {
    ACCESS_TOKEN: import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN,
    PHONE_NUMBER_ID: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID,
    BUSINESS_ACCOUNT_ID: import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID,
    RECIPIENT_PHONE_NUMBER: import.meta.env.VITE_WHATSAPP_RECIPIENT_PHONE_NUMBER,
  },
  
  // DeepSeek API Configuration
  DEEPSEEK: {
    // Try to get the API key with VITE_ prefix first, then without
    API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY,
    API_URL: import.meta.env.VITE_DEEPSEEK_API_URL || import.meta.env.DEEPSEEK_API_URL || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
    MODEL: import.meta.env.VITE_DEEPSEEK_MODEL || import.meta.env.DEEPSEEK_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-chat'
  },
  
  // Other configurations
  NODE_ENV: import.meta.env.MODE,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
}; 