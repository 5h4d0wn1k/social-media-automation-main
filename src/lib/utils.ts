import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Twitter, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';

/**
 * Combines multiple class names or class name objects, including tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mapping of platform names to their respective icon components
 */
export const platformIcons: Record<string, any> = {
  'twitter': Twitter,
  'x': Twitter, // For the rebranded Twitter
  'instagram': Instagram,
  'facebook': Facebook,
  'linkedin': Linkedin,
  'youtube': Youtube,
};

/**
 * Format a number for display (e.g. 1000 -> 1K)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format a date for display
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Truncate text to a specific length and add ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Check if a URL is an image URL
 */
export const isImageUrl = (url: string): boolean => {
  return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
};

/**
 * Check if a URL is a video URL
 */
export const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Calculates engagement percentage based on interactions and views
 */
export function calculateEngagement(likes: number, comments: number, shares: number, views: number): number {
  if (views === 0) return 0;
  return parseFloat(((likes + comments + shares) / views * 100).toFixed(2));
}

/**
 * Copies text to clipboard
 * @param text - The text to copy
 * @returns Promise that resolves when copying is complete
 */
export async function copy(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error);
    return Promise.reject(error);
  }
}