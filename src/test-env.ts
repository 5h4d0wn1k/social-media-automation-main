// Test environment configuration that doesn't rely on Vite's import.meta.env
// This is only for testing purposes
export const env = {
  // API URLs
  API_URL: 'http://localhost:3000',
  
  // DeepSeek API Configuration
  DEEPSEEK: {
    API_KEY: 'sk-90e48d82820a44ecad06ef4e0a1b01b1',
    API_URL: 'https://api.deepseek.com/v1',
    MODEL: 'deepseek-chat'
  },
  
  // Other configurations
  NODE_ENV: 'development',
  IS_DEVELOPMENT: true,
  IS_PRODUCTION: false,
}; 