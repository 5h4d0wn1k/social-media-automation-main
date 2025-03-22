# Social Media Automation App

A powerful tool for managing and automating posts across multiple social media platforms.

## Features

- Cross-platform posting (Twitter, LinkedIn, Facebook, Instagram, YouTube, Telegram, WhatsApp, GitHub)
- Post scheduling
- Hashtag management
- Content analytics
- AI-powered caption generation using DeepSeek

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your environment variables in `.env`
4. Start the development server:
   ```
   npm run dev
   ```

## Deploying to Vercel

This application is fully compatible with Vercel's serverless functions and can be deployed with a few simple steps:

1. **Create a Vercel Account**: Sign up at https://vercel.com if you don't have an account.

2. **Install Vercel CLI**: (Optional)
   ```bash
   npm install -g vercel
   ```

3. **Configure Environment Variables**:
   - In the Vercel dashboard, go to your project settings.
   - Add all the environment variables from your `.env` file, including:
     - All social media API credentials
     - `API_KEY` for securing your API endpoints
     - `DEEPSEEK_API_KEY` and related variables

4. **Deploy**:
   - Option 1: Connect your GitHub repo to Vercel for automatic deployments
   - Option 2: Use the Vercel CLI:
     ```bash
     vercel --prod
     ```
   - Option 3: Drag and drop your project folder to the Vercel dashboard

5. **After Deployment**:
   - Vercel will automatically use the `vercel.json` configuration
   - API endpoints will be available at `https://your-domain.vercel.app/api/social`
   - The frontend will automatically connect to the correct API URL

## Environment Variables

The application requires several environment variables for connecting to various social media platforms:

- `VITE_API_KEY`: Secret key for securing API endpoints
- `VITE_API_URL`: Base URL for the API (automatically set in Vercel)
- Twitter credentials: `VITE_TWITTER_API_KEY`, `VITE_TWITTER_API_SECRET`, etc.
- LinkedIn credentials: `VITE_LINKEDIN_ACCESS_TOKEN`, `VITE_LINKEDIN_CLIENT_ID`, etc.
- Other platform credentials as defined in `.env`

## Troubleshooting Vercel Deployment

- **404 Errors**: Make sure your API routes are correctly configured in `vercel.json`
- **Authentication Errors**: Verify that `API_KEY` is set in your Vercel environment variables
- **Environment Variables**: Ensure all necessary environment variables are properly set in Vercel
- **API Limits**: Be aware of rate limits on various social media APIs

## Development vs Production Mode

- In development mode, the app uses mock data
- In production, it makes real API calls to social media platforms
- You can test actual API calls by setting `VITE_IS_DEVELOPMENT=false` in your environment variables 