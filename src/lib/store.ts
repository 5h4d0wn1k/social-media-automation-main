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
  campaignId?: string;
}

export interface PlatformData {
  enabled: boolean;
  bestTimes: string[]; // Format: "HH:MM" in 24h format
  accessToken?: string;
}

export interface RssFeed {
  id: string;
  url: string;
  name: string;
  category: string;
  frequency: 'hourly' | 'daily' | 'weekly';
  lastFetched?: string;
  platforms: Platform[];
}

export interface HashtagGroup {
  id: string;
  name: string;
  hashtags: string[];
  platforms: Platform[];
  category: string;
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type CampaignType = 'product-launch' | 'event-promotion' | 'content-series' | 'seasonal' | 'awareness' | 'general';

export interface CampaignPost {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledTime: string;
  status: PostStatus;
  mediaUrls?: string[];
  position: number;
  hashtags?: string[];
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  platforms: Platform[];
  targetAudience?: string;
  goals?: string[];
  hashtagGroups?: string[];
  posts: any[]; // Will be updated with CampaignPost type
  phases?: Array<{
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  }>;
  targetMetrics?: {
    engagement: number;
    reach: number;
    clicks: number;
  };
  currentMetrics?: {
    engagement: number;
    reach: number;
    clicks: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface SocialStore {
  posts: Post[];
  platforms: Record<Platform, PlatformData>;
  rssFeeds: RssFeed[];
  lastScheduledDate: string | null;
  hashtagGroups: HashtagGroup[];
  campaigns: Campaign[];
  
  addPost: (post: Omit<Post, 'id'>) => void;
  removePost: (id: string) => void;
  updatePostStatus: (id: string, status: PostStatus) => void;
  
  togglePlatform: (platform: Platform, enabled: boolean) => void;
  setPlatformBestTimes: (platform: Platform, times: string[]) => void;
  
  addRssFeed: (feed: Omit<RssFeed, 'id'>) => void;
  removeRssFeed: (id: string) => void;
  
  addHashtagGroup: (group: Omit<HashtagGroup, 'id'>) => void;
  updateHashtagGroup: (id: string, group: Partial<Omit<HashtagGroup, 'id'>>) => void;
  removeHashtagGroup: (id: string) => void;
  
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCampaign: (id: string, campaign: Partial<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  removeCampaign: (id: string) => void;
  addCampaignPost: (campaignId: string, post: Omit<CampaignPost, 'id'>) => void;
  updateCampaignPost: (campaignId: string, postId: string, updates: Partial<Omit<CampaignPost, 'id'>>) => void;
  removeCampaignPost: (campaignId: string, postId: string) => void;
  updateCampaignStatus: (id: string, status: CampaignStatus) => void;
  
  setLastScheduledDate: (date: string) => void;
  setSocialData: (data: Record<Platform, PlatformData>) => void;
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
      campaigns: [],
      
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
      
      addCampaign: (campaign) => set((state) => ({
        campaigns: [...state.campaigns, { 
          ...campaign, 
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      })),
      
      updateCampaign: (id, updates) => set((state) => ({
        campaigns: state.campaigns.map((campaign) => 
          campaign.id === id 
            ? { 
                ...campaign, 
                ...updates, 
                updatedAt: new Date().toISOString() 
              } 
            : campaign
        ),
      })),
      
      removeCampaign: (id) => set((state) => ({
        campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
      })),
      
      addCampaignPost: (campaignId, post) => set((state) => ({
        campaigns: state.campaigns.map((campaign) => 
          campaign.id === campaignId 
            ? { 
                ...campaign, 
                posts: [...campaign.posts, { ...post, id: Date.now().toString() }],
                updatedAt: new Date().toISOString()
              } 
            : campaign
        ),
      })),
      
      updateCampaignPost: (campaignId, postId, updates) => set((state) => ({
        campaigns: state.campaigns.map((campaign) => 
          campaign.id === campaignId 
            ? { 
                ...campaign, 
                posts: campaign.posts.map((post) => 
                  post.id === postId ? { ...post, ...updates } : post
                ),
                updatedAt: new Date().toISOString()
              } 
            : campaign
        ),
      })),
      
      removeCampaignPost: (campaignId, postId) => set((state) => ({
        campaigns: state.campaigns.map((campaign) => 
          campaign.id === campaignId 
            ? { 
                ...campaign, 
                posts: campaign.posts.filter((post) => post.id !== postId),
                updatedAt: new Date().toISOString()
              } 
            : campaign
        ),
      })),
      
      updateCampaignStatus: (id, status) => set((state) => ({
        campaigns: state.campaigns.map((campaign) => 
          campaign.id === id 
            ? { 
                ...campaign, 
                status,
                updatedAt: new Date().toISOString()
              } 
            : campaign
        ),
      })),
      
      setSocialData: (data) => set({
        platforms: data,
      }),
    }),
    {
      name: 'social-store',
    }
  )
);