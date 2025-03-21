import { schedulePostsForToday, publishDuePosts } from '../scheduler';
import { useSocialStore } from '@/lib/store';
import { generateContent } from '@/lib/ai';
import * as twitter from '@/lib/api/twitter';
import * as linkedin from '@/lib/api/linkedin';
import * as facebook from '@/lib/api/facebook';
import * as telegram from '@/lib/api/telegram';
import * as whatsapp from '@/lib/api/whatsapp';

// Mock dependencies
jest.mock('@/lib/store');
jest.mock('@/lib/ai');
jest.mock('@/lib/api/twitter');
jest.mock('@/lib/api/linkedin');
jest.mock('@/lib/api/facebook');
jest.mock('@/lib/api/telegram');
jest.mock('@/lib/api/whatsapp');

describe('Social Media Scheduler', () => {
  // Set up test data and mocks before each test
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock store initial state
    (useSocialStore.getState as jest.Mock).mockReturnValue({
      posts: [],
      lastScheduledDate: null,
      platforms: {
        twitter: {
          enabled: true,
          bestTimes: ['09:00', '12:00', '17:00'],
        },
        linkedin: {
          enabled: true,
          bestTimes: ['08:00', '10:00', '16:00'],
        },
        facebook: {
          enabled: false,
          bestTimes: ['10:00', '15:00', '20:00'],
        },
        telegram: {
          enabled: true,
          bestTimes: ['09:30', '13:30', '19:00'],
        },
        whatsapp: {
          enabled: false,
          bestTimes: ['10:30', '14:00', '18:30'],
        },
      },
      addPost: jest.fn(),
      setLastScheduledDate: jest.fn(),
      updatePostStatus: jest.fn(),
    });
    
    // Mock content generation
    (generateContent as jest.Mock).mockResolvedValue('Generated content for testing');
    
    // Mock API posting functions
    (twitter.postToTwitter as jest.Mock).mockResolvedValue({ id: 'tweet123' });
    (linkedin.postToLinkedIn as jest.Mock).mockResolvedValue({ id: 'post456' });
    (telegram.postToTelegram as jest.Mock).mockResolvedValue({ message_id: 789 });
  });
  
  describe('schedulePostsForToday', () => {
    test('should schedule posts for enabled platforms', async () => {
      // Set test date
      const testDate = new Date('2023-04-15T08:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => testDate as unknown as Date);
      
      await schedulePostsForToday();
      
      const store = useSocialStore.getState();
      
      // Should generate posts for Twitter, LinkedIn and Telegram (3 enabled platforms)
      // Each platform should get 3 posts (or fewer if fewer peak times)
      expect(generateContent).toHaveBeenCalledTimes(9);
      
      // Should add posts to the store
      expect(store.addPost).toHaveBeenCalledTimes(9);
      
      // Should update last scheduled date
      expect(store.setLastScheduledDate).toHaveBeenCalledWith('2023-04-15');
    });
    
    test('should not schedule posts if already scheduled today', async () => {
      // Mock that posts were already scheduled today
      (useSocialStore.getState as jest.Mock).mockReturnValue({
        ...useSocialStore.getState(),
        lastScheduledDate: '2023-04-15',
      });
      
      // Set test date
      const testDate = new Date('2023-04-15T08:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => testDate as unknown as Date);
      
      await schedulePostsForToday();
      
      // Should not generate any posts
      expect(generateContent).not.toHaveBeenCalled();
      
      // Should not add posts to the store
      expect(useSocialStore.getState().addPost).not.toHaveBeenCalled();
    });
    
    test('should skip scheduling posts for time slots in the past', async () => {
      // Set test date to late in the day
      const testDate = new Date('2023-04-15T18:30:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => testDate as unknown as Date);
      
      await schedulePostsForToday();
      
      // Should only schedule posts for time slots that are in the future
      // Twitter has 1 future time slot, LinkedIn has 0, Telegram has 0
      // So we should only generate 1 post
      expect(generateContent).toHaveBeenCalledTimes(1);
      
      // Should only add one post to the store
      expect(useSocialStore.getState().addPost).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('publishDuePosts', () => {
    test('should publish scheduled posts that are due', async () => {
      // Set test date
      const testDate = new Date('2023-04-15T12:05:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => testDate as unknown as Date);
      
      // Mock posts in the store
      (useSocialStore.getState as jest.Mock).mockReturnValue({
        ...useSocialStore.getState(),
        posts: [
          {
            id: 'post1',
            content: 'Test Twitter content',
            platform: 'twitter',
            scheduledTime: '2023-04-15T12:00:00Z', // Due (5 minutes ago)
            status: 'scheduled',
          },
          {
            id: 'post2',
            content: 'Test LinkedIn content',
            platform: 'linkedin',
            scheduledTime: '2023-04-15T12:00:00Z', // Due (5 minutes ago)
            status: 'scheduled',
          },
          {
            id: 'post3',
            content: 'Test Telegram content',
            platform: 'telegram',
            scheduledTime: '2023-04-15T13:30:00Z', // Not due yet
            status: 'scheduled',
          },
          {
            id: 'post4',
            content: 'Test Facebook content',
            platform: 'facebook', // Platform disabled in our mock
            scheduledTime: '2023-04-15T12:00:00Z', // Due but platform disabled
            status: 'scheduled',
          },
        ],
      });
      
      await publishDuePosts();
      
      // Should publish posts that are due for enabled platforms
      expect(twitter.postToTwitter).toHaveBeenCalledWith('Test Twitter content', undefined);
      expect(linkedin.postToLinkedIn).toHaveBeenCalledWith('Test LinkedIn content', undefined);
      
      // Should not publish posts for future times
      expect(telegram.postToTelegram).not.toHaveBeenCalled();
      
      // Should not publish posts for disabled platforms
      expect(facebook.postToFacebook).not.toHaveBeenCalled();
      
      // Should update status to 'published' for published posts
      const store = useSocialStore.getState();
      expect(store.updatePostStatus).toHaveBeenCalledWith('post1', 'published');
      expect(store.updatePostStatus).toHaveBeenCalledWith('post2', 'published');
      expect(store.updatePostStatus).not.toHaveBeenCalledWith('post3', 'published');
      expect(store.updatePostStatus).not.toHaveBeenCalledWith('post4', 'published');
    });
    
    test('should handle posting errors', async () => {
      // Mock a posting error
      (twitter.postToTwitter as jest.Mock).mockRejectedValue(new Error('API error'));
      
      // Set test date
      const testDate = new Date('2023-04-15T12:05:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => testDate as unknown as Date);
      
      // Mock posts in the store
      (useSocialStore.getState as jest.Mock).mockReturnValue({
        ...useSocialStore.getState(),
        posts: [
          {
            id: 'post1',
            content: 'Test Twitter content',
            platform: 'twitter',
            scheduledTime: '2023-04-15T12:00:00Z', // Due
            status: 'scheduled',
          },
        ],
      });
      
      await publishDuePosts();
      
      // Should attempt to publish the post
      expect(twitter.postToTwitter).toHaveBeenCalledWith('Test Twitter content', undefined);
      
      // Should update status to 'failed' for the post with error
      const store = useSocialStore.getState();
      expect(store.updatePostStatus).toHaveBeenCalledWith('post1', 'failed');
    });
  });
}); 