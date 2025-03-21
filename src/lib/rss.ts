import Parser from 'rss-parser/dist/rss-parser.min.js';
import { Platform } from './store';

// Create a new parser instance with browser-specific configuration
const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure'],
  },
});

export async function fetchRssFeed(url: string) {
  try {
    // Use a CORS proxy for browser requests
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const feed = await parser.parseURL(proxyUrl);
    
    return feed.items.map((item) => ({
      title: item.title,
      content: item.contentSnippet || item.content,
      link: item.link,
      pubDate: item.pubDate,
      imageUrl: extractImageFromContent(item.content) || 
                extractImageFromMediaContent(item['media:content']) ||
                extractImageFromEnclosure(item.enclosure),
    }));
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return [];
  }
}

function extractImageFromContent(content?: string): string | undefined {
  if (!content) return undefined;
  
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch?.[1];
}

function extractImageFromMediaContent(mediaContent: any): string | undefined {
  if (!mediaContent) return undefined;
  
  if (Array.isArray(mediaContent)) {
    const media = mediaContent.find(m => m.$ && m.$.url);
    return media?.$.url;
  }
  
  return mediaContent.$ && mediaContent.$.url;
}

function extractImageFromEnclosure(enclosure: any): string | undefined {
  if (!enclosure) return undefined;
  
  if (Array.isArray(enclosure)) {
    const image = enclosure.find(e => e.type && e.type.startsWith('image/'));
    return image?.url;
  }
  
  return enclosure.type && enclosure.type.startsWith('image/') ? enclosure.url : undefined;
}

export function generatePlatformContent(
  item: { title?: string; content?: string; link?: string },
  platform: Platform
): string {
  switch (platform) {
    case 'twitter':
      return `${item.title}\n\n${item.link}`;
    case 'linkedin':
      return `${item.title}\n\n${item.content?.slice(0, 200)}...\n\nRead more: ${item.link}`;
    case 'facebook':
      return `${item.title}\n\n${item.content}\n\nRead more: ${item.link}`;
    case 'instagram':
      return `${item.title}\n\n${item.content?.slice(0, 150)}...\n\n#tech #innovation #shadownik`;
    default:
      return `${item.title}\n\n${item.content}\n\n${item.link}`;
  }
}