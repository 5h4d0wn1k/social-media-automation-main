import OpenAI from 'openai';
import { Platform } from './store';

const openai = new OpenAI({
  apiKey: 'your-api-key', // Replace with environment variable
  dangerouslyAllowBrowser: true,
});

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
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 250,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content');
  }
}

export async function generateImagePrompt(topic: string): Promise<string> {
  const prompt = `Create a detailed image prompt for ${topic} that would work well for social media.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating image prompt:', error);
    throw new Error('Failed to generate image prompt');
  }
}