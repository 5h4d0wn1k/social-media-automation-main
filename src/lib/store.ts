import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Platform = 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'telegram' | 'whatsapp' | 'github';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface Post {
  id: string;
  content: string;
  platform: Platform;
  scheduledTime: string;
  status: PostStatus;
  mediaUrls?: string[];
  sourceUrl?: string;
  imageUrl?: string;
  aiGenerated?: boolean;
}

export interface PlatformData {
  enabled: boolean;
  bestTimes: string[]; // Format: "HH:MM" in 24h format
  accessToken?: string;
}

export interface RssFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  refreshInterval: number;
  lastFetched?: string;
}

export interface HashtagGroup {
  id: string;
  name: string;
  hashtags: string[];
  platforms: Platform[];
  category: string;
}

interface SocialStore {
  posts: Post[];
  platforms: Record<Platform, PlatformData>;
  rssFeeds: RssFeed[];
  lastScheduledDate: string | null;
  hashtagGroups: HashtagGroup[];
  
  // Post management
  addPost: (post: Omit<Post, 'id'>) => void;
  removePost: (id: string) => void;
  updatePostStatus: (id: string, status: PostStatus) => void;
  
  // Platform management
  togglePlatform: (platform: Platform, enabled: boolean) => void;
  setPlatformBestTimes: (platform: Platform, times: string[]) => void;
  
  // RSS Feed management
  addRssFeed: (feed: Omit<RssFeed, 'id'>) => void;
  removeRssFeed: (id: string) => void;
  
  // Hashtag management
  addHashtagGroup: (group: Omit<HashtagGroup, 'id'>) => void;
  updateHashtagGroup: (id: string, group: Partial<Omit<HashtagGroup, 'id'>>) => void;
  removeHashtagGroup: (id: string) => void;
  
  // Scheduler management
  setLastScheduledDate: (date: string) => void;
}

export const useSocialStore = create<SocialStore>()(
  persist(
    (set) => ({
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
          enabled: true,
          bestTimes: ['10:00', '15:00', '20:00'],
        },
        instagram: {
          enabled: true,
          bestTimes: ['12:00', '15:00', '21:00'],
        },
        youtube: {
          enabled: false,
          bestTimes: ['11:00', '14:00', '18:00'],
        },
        telegram: {
          enabled: true,
          bestTimes: ['09:30', '13:30', '19:00'],
        },
        whatsapp: {
          enabled: true,
          bestTimes: ['10:30', '14:00', '18:30'],
        },
        github: {
          enabled: false,
          bestTimes: ['10:00', '14:00', '16:00'],
        },
      },
      rssFeeds: [],
      hashtagGroups: [
        {
          id: '1',
          name: 'Marketing',
          hashtags: ['#marketing', '#socialmedia', '#digitalmarketing', '#contentmarketing', '#growthhacking'],
          platforms: ['twitter', 'instagram'],
          category: 'Business'
        },
        {
          id: '2',
          name: 'Tech News',
          hashtags: ['#tech', '#technology', '#ai', '#ml', '#programming'],
          platforms: ['twitter', 'linkedin'],
          category: 'Technology'
        },
        {
          id: '3',
          name: 'Motivation',
          hashtags: ['#motivation', '#success', '#entrepreneur', '#inspiration'],
          platforms: ['instagram', 'facebook'],
          category: 'Personal'
        }
      ],
      
      addPost: (post) => set((state) => ({
        posts: [...state.posts, { ...post, id: Date.now().toString() }],
      })),
      
      removePost: (id) => set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
      })),
      
      updatePostStatus: (id, status) => set((state) => ({
        posts: state.posts.map((post) => 
          post.id === id ? { ...post, status } : post
        ),
      })),
      
      togglePlatform: (platform, enabled) => set((state) => ({
        platforms: {
          ...state.platforms,
          [platform]: {
            ...state.platforms[platform],
            enabled,
          },
        },
      })),
      
      setPlatformBestTimes: (platform, times) => set((state) => ({
        platforms: {
          ...state.platforms,
          [platform]: {
            ...state.platforms[platform],
            bestTimes: times,
          },
        },
      })),
      
      addRssFeed: (feed) => set((state) => ({
        rssFeeds: [...state.rssFeeds, { ...feed, id: Date.now().toString() }],
      })),
      
      removeRssFeed: (id) => set((state) => ({
        rssFeeds: state.rssFeeds.filter((feed) => feed.id !== id),
      })),
      
      setLastScheduledDate: (date) => set({
        lastScheduledDate: date,
      }),
      
      addHashtagGroup: (group) => set((state) => ({
        hashtagGroups: [...state.hashtagGroups, { ...group, id: Date.now().toString() }],
      })),
      
      updateHashtagGroup: (id, updates) => set((state) => ({
        hashtagGroups: state.hashtagGroups.map((group) => 
          group.id === id ? { ...group, ...updates } : group
        ),
      })),
      
      removeHashtagGroup: (id) => set((state) => ({
        hashtagGroups: state.hashtagGroups.filter((group) => group.id !== id),
      })),
    }),
    {
      name: 'social-store',
    }
  )
);