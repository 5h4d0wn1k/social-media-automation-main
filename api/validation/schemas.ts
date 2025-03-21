import { z } from 'zod';

export const postContentSchema = z.object({
  content: z.string().min(1).max(280),
  imageUrl: z.string().url().optional(),
  scheduledTime: z.string().datetime().optional(),
});

export const analyticsRequestSchema = z.object({
  postId: z.string(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const oauthCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export type PostContent = z.infer<typeof postContentSchema>;
export type AnalyticsRequest = z.infer<typeof analyticsRequestSchema>;
export type OAuthCallback = z.infer<typeof oauthCallbackSchema>; 