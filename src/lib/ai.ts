import { Platform } from './store';
import { callDeepSeekAPI, deepseekClient } from './api/deepseek';
import { env } from '../config/env';

interface GenerateContentParams {
  topic: string;
  platform: Platform;
  tone?: 'professional' | 'casual' | 'friendly';
  length?: 'short' | 'medium' | 'long';
}

const PLATFORM_PROMPTS: Record<Platform, string> = {
  twitter: "Write a concise, engaging tweet about",
  linkedin: "Create a professional LinkedIn post about",
  facebook: "Write an engaging Facebook post about",
  instagram: "Create an Instagram caption about",
  youtube: "Write an engaging YouTube video description about",
  telegram: "Create a Telegram channel post about",
  whatsapp: "Write a WhatsApp status update about",
  github: "Write a technical GitHub repository description about",
};

export async function generateContent({
  topic,
  platform,
  tone = 'professional',
  length = 'medium',
}: GenerateContentParams): Promise<string> {
  const basePrompt = PLATFORM_PROMPTS[platform];
  const prompt = `${basePrompt} ${topic}. 
    Tone: ${tone}. 
    Length: ${length}. 
    Include relevant hashtags if appropriate.
    Format it properly for the platform.`;

  try {
    const systemPrompt = 'You are a professional social media content creator who specializes in creating engaging content for different platforms.';
    
    // Use callDeepSeekAPI function from deepseek.ts
    const content = await callDeepSeekAPI(prompt, systemPrompt, 0.7, 250);
    return content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content');
  }
}

export async function generateImagePrompt(topic: string): Promise<string> {
  const prompt = `Create a detailed image prompt for ${topic} that would work well for social media.`;

  try {
    const systemPrompt = 'You are a visual content specialist who creates engaging image descriptions.';
    
    // Use callDeepSeekAPI function from deepseek.ts
    const content = await callDeepSeekAPI(prompt, systemPrompt, 0.7, 100);
    return content;
  } catch (error) {
    console.error('Error generating image prompt:', error);
    throw new Error('Failed to generate image prompt');
  }
}