/**
 * Environment configuration for the application
 */
export const env = {
  // RiteKit API key for hashtag suggestions and analytics
  RITEKIT_API_KEY: process.env.REACT_APP_RITEKIT_API_KEY || 'demo',
  
  // API base URL for social media services
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://api.example.com',
  
  // Feature flags
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUGGING: process.env.REACT_APP_ENABLE_DEBUGGING === 'true',
  
  // Default post settings
  DEFAULT_SCHEDULER_INTERVAL: parseInt(process.env.REACT_APP_DEFAULT_SCHEDULER_INTERVAL || '15', 10),
}; 