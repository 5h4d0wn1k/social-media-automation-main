import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { linkedinConfig } from '../../config';
import { postContentSchema, analyticsRequestSchema } from '../../validation/schemas';
import { PlatformError, ValidationError } from '../../types/errors';

const linkedinClient = axios.create({
  baseURL: 'https://api.linkedin.com/v2',
  headers: {
    'Authorization': `Bearer ${linkedinConfig.accessToken}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0',
  },
});

/**
 * Initialize image upload process on LinkedIn
 */
async function initializeImageUpload() {
  try {
    const response = await linkedinClient.post('/rest/images?action=initializeUpload', {
      initializeUploadRequest: {
        owner: `urn:li:person:${linkedinConfig.userId}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new PlatformError('LinkedIn', 'Failed to initialize image upload', error);
  }
}

/**
 * Upload image to LinkedIn using the upload URL
 */
async function uploadImageToLinkedIn(uploadUrl: string, imageData: string) {
  try {
    await axios.put(uploadUrl, imageData, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (error) {
    throw new PlatformError('LinkedIn', 'Failed to upload image data', error);
  }
}

/**
 * Register uploaded image with LinkedIn
 */
async function registerImage(imageId: string) {
  try {
    await linkedinClient.post(`/rest/images/${imageId}`, {
      description: {
        text: 'Image uploaded via API',
      },
    });
    return `urn:li:image:${imageId}`;
  } catch (error) {
    throw new PlatformError('LinkedIn', 'Failed to register uploaded image', error);
  }
}

/**
 * Handle posting content to LinkedIn
 */
export async function handleLinkedInPost(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    // Validate request data
    const validatedData = postContentSchema.parse(data);
    const { content, imageUrl } = validatedData;
    
    // Process image if provided
    let mediaUrn: string | undefined;
    if (imageUrl) {
      try {
        // Initialize image upload
        const uploadInitResponse = await initializeImageUpload();
        const { value: { uploadUrl, image }} = uploadInitResponse;
        
        // Fetch the image data
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary').toString('base64');
        
        // Upload image to LinkedIn
        await uploadImageToLinkedIn(uploadUrl, imageBuffer);
        
        // Register the image
        mediaUrn = await registerImage(image);
      } catch (error) {
        throw new PlatformError('LinkedIn', 'Failed to process image', error);
      }
    }

    // Create the post
    try {
      const postData = {
        author: `urn:li:person:${linkedinConfig.userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: mediaUrn ? 'IMAGE' : 'NONE',
            media: mediaUrn ? [
              {
                status: 'READY',
                description: {
                  text: 'Image'
                },
                media: mediaUrn
              }
            ] : undefined
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };
      
      const response = await linkedinClient.post('/rest/posts', postData);
      const postId = response.data.id;
      
      return res.status(200).json({ postId });
    } catch (error) {
      throw new PlatformError('LinkedIn', 'Failed to create post', error);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof PlatformError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('LinkedIn Post Error:', error);
    return res.status(500).json({ error: 'Failed to post to LinkedIn' });
  }
}

/**
 * Handle retrieving analytics for a LinkedIn post
 */
export async function handleLinkedInAnalytics(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    // Validate request data
    const validatedData = analyticsRequestSchema.parse(data);
    const { postId } = validatedData;
    
    // Get post statistics
    try {
      // Get social actions (likes, comments)
      const socialActionsResponse = await linkedinClient.get(`/socialActions/${postId}`);
      const socialActions = socialActionsResponse.data;
      
      // Get view counts
      const viewsResponse = await linkedinClient.get(`/socialMetadata/${postId}`);
      const views = viewsResponse.data?.totalShareStatistics?.impressionCount || 0;
      
      const likes = socialActions?.likesSummary?.totalLikes || 0;
      const comments = socialActions?.commentsSummary?.totalComments || 0;
      const shares = socialActions?.sharesSummary?.totalShares || 0;
      
      return res.status(200).json({
        likes,
        comments,
        shares,
        views,
        engagement: calculateEngagement(likes, comments, shares, views)
      });
    } catch (error) {
      throw new PlatformError('LinkedIn', 'Failed to fetch post analytics', error);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof PlatformError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('LinkedIn Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to fetch LinkedIn analytics' });
  }
}

/**
 * Calculate engagement rate
 */
function calculateEngagement(likes: number, comments: number, shares: number, impressions: number): number {
  if (!impressions) return 0;
  const totalEngagements = likes + comments + shares;
  return (totalEngagements / impressions) * 100;
} 