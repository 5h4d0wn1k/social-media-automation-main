import axios from 'axios';
import { env } from '../../config/env';

// Define types for DeepSeek API requests and responses
interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekCompletionRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface DeepSeekCompletionResponse {
  id: string;
  created: number;
  choices: {
    message: DeepSeekMessage;
    finish_reason: string;
    index: number;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Create a configured axios instance for DeepSeek API
export const getDeepSeekClient = () => {
  return axios.create({
    baseURL: env.DEEPSEEK.API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.DEEPSEEK.API_KEY}`
    }
  });
};

// Maintained for backward compatibility
export const deepseekClient = getDeepSeekClient();

/**
 * General purpose function to call DeepSeek API
 * @param prompt The prompt to send to DeepSeek
 * @param systemPrompt Optional system prompt to provide context
 * @param temperature How creative the response should be (0.0-1.0)
 * @param maxTokens Maximum number of tokens to generate
 * @returns The generated text response
 */
export async function callDeepSeekAPI(
  prompt: string, 
  systemPrompt: string = 'You are a helpful assistant specializing in social media and marketing.', 
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  try {
    // Debug logging
    console.log(`Making DeepSeek API call with API key: ${env.DEEPSEEK.API_KEY ? "CONFIGURED" : "MISSING"}`);
    console.log(`Using DeepSeek API URL: ${env.DEEPSEEK.API_URL}`);
    console.log(`Using model: ${env.DEEPSEEK.MODEL}`);
    
    const requestBody = {
      model: env.DEEPSEEK.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens
    };
    
    // Always get a fresh client to ensure latest API key is used
    const client = getDeepSeekClient();
    const response = await client.post<DeepSeekCompletionResponse>('/chat/completions', requestBody);

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    
    // Enhanced error information
    if (axios.isAxiosError(error)) {
      console.error('DeepSeek API response status:', error.response?.status);
      console.error('DeepSeek API response data:', error.response?.data);
      
      if (error.response?.status === 401) {
        console.error('🔑 Authentication failed. Please check your DeepSeek API key.');
      }
    }
    
    throw new Error('Failed to get response from DeepSeek API');
  }
}

/**
 * Generate hashtags using DeepSeek AI model
 * @param content The content to generate hashtags for
 * @param count Number of hashtags to generate
 * @returns Array of generated hashtags
 */
export async function generateHashtagsWithDeepSeek(content: string, count: number = 5): Promise<string[]> {
  try {
    const prompt = `Generate ${count} relevant, trending hashtags for the following content. 
    Return only the hashtags, one per line, without numbers or explanations.
    
    Content: "${content}"`;

    const client = getDeepSeekClient();
    const response = await client.post<DeepSeekCompletionResponse>('/chat/completions', {
      model: env.DEEPSEEK.MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful assistant specializing in social media hashtag creation.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    // Parse the response to extract hashtags
    const generatedText = response.data.choices[0].message.content;
    
    // Split by newlines and clean up the hashtags
    const hashtags = generatedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      .slice(0, count);
      
    return hashtags;
  } catch (error) {
    console.error('Error generating hashtags with DeepSeek:', error);
    throw new Error('Failed to generate hashtags');
  }
}

/**
 * Analyze image content and suggest hashtags using DeepSeek
 * @param imageUrl URL of the image to analyze
 * @returns Array of suggested hashtags
 */
export async function analyzeImageForHashtags(imageUrl: string): Promise<string[]> {
  try {
    const prompt = `Analyze this image and suggest 8 relevant hashtags for social media.
    Return only the hashtags without numbers or explanations.
    
    Image URL: ${imageUrl}`;

    const client = getDeepSeekClient();
    const response = await client.post<DeepSeekCompletionResponse>('/chat/completions', {
      model: env.DEEPSEEK.MODEL,
      messages: [
        { role: 'system', content: 'You are a visual content analyzer that helps create relevant hashtags.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    // Parse the response to extract hashtags
    const generatedText = response.data.choices[0].message.content;
    
    // Clean up the hashtags
    const hashtags = generatedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      .slice(0, 8);
      
    return hashtags;
  } catch (error) {
    console.error('Error analyzing image with DeepSeek:', error);
    throw new Error('Failed to analyze image for hashtags');
  }
}

/**
 * Generate caption for a social media post using DeepSeek
 * @param prompt The prompt describing what kind of caption to generate
 * @param platform The target social media platform
 * @returns Generated caption text
 */
export async function generateSocialMediaCaption(prompt: string, platform: string): Promise<string> {
  try {
    const fullPrompt = `Generate a compelling social media caption for ${platform} based on this description: "${prompt}".
    The caption should be engaging, include relevant emojis, and be optimized for ${platform}.`;

    const client = getDeepSeekClient();
    const response = await client.post<DeepSeekCompletionResponse>('/chat/completions', {
      model: env.DEEPSEEK.MODEL,
      messages: [
        { role: 'system', content: 'You are a social media content creator specialized in writing engaging captions.' },
        { role: 'user', content: fullPrompt }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating caption with DeepSeek:', error);
    throw new Error('Failed to generate social media caption');
  }
}

/**
 * Test DeepSeek API connection
 * @returns Success message if connection is working
 */
export async function testDeepSeekConnection(): Promise<string> {
  try {
    console.log('Testing DeepSeek API connection...');
    console.log('API Key:', env.DEEPSEEK.API_KEY ? `${env.DEEPSEEK.API_KEY.substring(0, 5)}...` : 'Not configured');
    console.log('API URL:', env.DEEPSEEK.API_URL);
    
    const prompt = "Say hello in one word.";
    const client = getDeepSeekClient();
    
    const response = await client.post<DeepSeekCompletionResponse>('/chat/completions', {
      model: env.DEEPSEEK.MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 10
    });
    
    console.log('DeepSeek API response:', response.data);
    
    if (response.status === 200) {
      return `Connection successful! Response: ${response.data.choices[0].message.content}`;
    } else {
      return `Unexpected status code: ${response.status}`;
    }
  } catch (error) {
    console.error('DeepSeek connection test failed:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return 'Authentication failed: Invalid API key. Please check your DeepSeek API key.';
      } else if (error.response) {
        return `API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        return 'No response received from DeepSeek API. Check network or API endpoint URL.';
      }
    }
    
    return `Error testing connection: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export default {
  callDeepSeekAPI,
  generateHashtagsWithDeepSeek,
  analyzeImageForHashtags,
  generateSocialMediaCaption,
  testDeepSeekConnection
}; 