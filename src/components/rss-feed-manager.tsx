import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Platform, useSocialStore } from '@/lib/store';
import { fetchRssFeed, generatePlatformContent } from '@/lib/rss';
import { Loader2, Plus, Trash2, AlertCircle, RefreshCw, Calendar, Globe, Package, LayoutGrid, Link } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { format, parseISO } from 'date-fns';

// Updated schema to match the RssFeed type in the store
const feedSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  frequency: z.enum(['hourly', 'daily', 'weekly'], {
    required_error: 'Please select a refresh frequency',
  }),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
});

// Define the type from the schema
type FeedForm = z.infer<typeof feedSchema>;

// Helper interfaces for RSS feed data
interface RssFeedItem {
  title: string;
  content: string;
  link: string;
  pubDate: string;
  imageUrl?: string;
}

interface RssFeedContent {
  title: string;
  description: string;
  items: RssFeedItem[];
}

// Category options for the feed
const categories = [
  'Technology',
  'Business',
  'Marketing',
  'Social Media',
  'News',
  'Entertainment',
  'Sports',
  'Science',
  'Health',
  'Education',
  'Other',
];

// Refresh frequency options with human-friendly labels
const refreshFrequencies = [
  { value: 'hourly', label: 'Every hour', icon: <RefreshCw className="h-4 w-4 mr-2" /> },
  { value: 'daily', label: 'Once a day', icon: <Calendar className="h-4 w-4 mr-2" /> },
  { value: 'weekly', label: 'Once a week', icon: <Calendar className="h-4 w-4 mr-2" /> },
];

export function RssFeedManager() {
  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<FeedForm>({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      platforms: [],
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<RssFeedContent | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('feeds');
  
  const { rssFeeds, addRssFeed, removeRssFeed, addPost, platforms } = useSocialStore();

  const onSubmit = async (data: FeedForm) => {
    setLoading(true);
    setError(null);
    try {
      // Validate feed URL
      const feedItems = await fetchRssFeed(data.url);
      if (!feedItems || feedItems.length === 0) {
        throw new Error('Invalid RSS feed or no items found');
      }

      // Convert platforms from string[] to Platform[]
      const platformsArray = data.platforms.map(p => p as Platform);

      // Add feed to store
      addRssFeed({
        url: data.url,
        name: data.name,
        category: data.category,
        frequency: data.frequency,
        platforms: platformsArray,
        lastFetched: new Date().toISOString(),
      });
      
      reset();
      setActiveTab('feeds');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add feed');
      console.error('Error adding feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndGeneratePosts = async (feedUrl: string, selectedPlatforms: Platform[]) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch feed data
      const items = await fetchRssFeed(feedUrl);
      
      if (!items || items.length === 0) {
        throw new Error('No items found in this feed');
      }

      // For each post in the feed, create a scheduled post for each platform
      let postsCreated = 0;
      items.slice(0, 3).forEach((item: RssFeedItem) => {
        selectedPlatforms.forEach((platform) => {
          // Create platform-specific content
          const content = generatePlatformContent(item, platform);
          
          // Get the best time from the platform settings
          const platformData = platforms[platform];
          if (!platformData || !platformData.bestTimes || platformData.bestTimes.length === 0) {
            return;
          }
          
          const bestTime = platformData.bestTimes[0];
          const scheduledTime = new Date();
          scheduledTime.setHours(parseInt(bestTime.split(':')[0]), parseInt(bestTime.split(':')[1]));

          // Add the post to the store
          addPost({
            content,
            platform,
            scheduledTime: scheduledTime.toISOString(),
            status: 'scheduled',
            imageUrl: item.imageUrl,
            sourceUrl: item.link,
          });
          
          postsCreated++;
        });
      });

      // Show success message
      setError(null);
      return postsCreated;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch RSS feed');
      console.error('Error fetching RSS feed:', error);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  const previewFeed = async (url: string) => {
    setPreviewLoading(true);
    setError(null);
    try {
      if (!url) {
        throw new Error('Please enter a URL to preview');
      }
      
      // Fetch the feed content
      const feedItems = await fetchRssFeed(url);
      
      if (!feedItems || feedItems.length === 0) {
        throw new Error('No items found in this feed');
      }
      
      // Create preview content object
      const previewData: RssFeedContent = {
        title: feedItems[0]?.title || 'RSS Feed',
        description: feedItems[0]?.content?.substring(0, 100) || 'No description available',
        items: feedItems.slice(0, 5) as RssFeedItem[],
      };
      
      setPreviewContent(previewData);
      setIsPreviewOpen(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to preview feed');
      console.error('Error previewing feed:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">RSS Feed Manager</h2>
            {activeTab === 'feeds' && (
              <Button onClick={() => setActiveTab('add')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Feed
              </Button>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feeds">
              <LayoutGrid className="h-4 w-4 mr-2" />
              My Feeds
            </TabsTrigger>
            <TabsTrigger value="add">
              <Plus className="h-4 w-4 mr-2" />
              Add New Feed
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="feeds" className="p-6">
          {rssFeeds.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No RSS Feeds Yet</h3>
              <p className="text-gray-500 mb-4">Add your first RSS feed to start generating social media content automatically.</p>
              <Button onClick={() => setActiveTab('add')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Feed
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rssFeeds.map((feed) => (
                <Card key={feed.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <Badge variant="outline" className="mb-2">
                        {feed.category}
                      </Badge>
                      <Badge variant="secondary">
                        {refreshFrequencies.find(f => f.value === feed.frequency)?.label}
                      </Badge>
                    </div>
                    <CardTitle>{feed.name}</CardTitle>
                    <CardDescription className="truncate">
                      <Link className="h-3 w-3 inline mr-1" />
                      {feed.url}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {feed.platforms.map((platform) => (
                        <Badge key={platform} variant="outline">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    
                    {feed.lastFetched && (
                      <p className="text-xs text-gray-500">
                        Last fetched: {format(parseISO(feed.lastFetched), 'MMM d, yyyy HH:mm')}
                      </p>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previewFeed(feed.url)}
                      disabled={previewLoading}
                    >
                      {previewLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Preview
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => fetchAndGeneratePosts(feed.url, feed.platforms)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Generate Posts
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeRssFeed(feed.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add" className="border-none p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feed Name</label>
              <Input
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Enter a descriptive name..."
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feed URL</label>
              <div className="flex space-x-2">
                <Input
                  {...register('url')}
                  className={errors.url ? 'border-red-500' : ''}
                  placeholder="https://example.com/feed.xml"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => previewFeed(watch('url'))}
                  disabled={previewLoading}
                >
                  {previewLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Preview
                </Button>
              </div>
              {errors.url && (
                <p className="mt-1 text-sm text-red-500">{errors.url.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Frequency</label>
              <Controller
                control={control}
                name="frequency"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className={errors.frequency ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select refresh frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {refreshFrequencies.map((frequency) => (
                        <SelectItem key={frequency.value} value={frequency.value}>
                          <div className="flex items-center">
                            {frequency.icon}
                            {frequency.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.frequency && (
                <p className="mt-1 text-sm text-red-500">{errors.frequency.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Platforms</label>
              <Controller
                control={control}
                name="platforms"
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange([...field.value, value])}
                    value={field.value.length > 0 ? field.value[field.value.length - 1] : undefined}
                  >
                    <SelectTrigger className={errors.platforms ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select target platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(platforms)
                        .filter(([_, data]) => data.enabled)
                        .map(([platform]) => (
                          <SelectItem key={platform} value={platform}>
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              
              <div className="flex flex-wrap gap-2 mt-2">
                {watch('platforms').map((platform) => (
                  <Badge key={platform} variant="secondary" className="flex items-center gap-1">
                    {platform}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1"
                      onClick={() => {
                        const newPlatforms = watch('platforms').filter(p => p !== platform);
                        register('platforms').onChange({ target: { value: newPlatforms } });
                      }}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
              
              {errors.platforms && (
                <p className="mt-1 text-sm text-red-500">{errors.platforms.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  reset();
                  setActiveTab('feeds');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Feed...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feed
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>RSS Feed Preview</DialogTitle>
          </DialogHeader>
          
          {previewContent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{previewContent.title}</h3>
                {previewContent.description && (
                  <p className="text-sm text-gray-500">{previewContent.description}</p>
                )}
              </div>
              
              <div className="space-y-4">
                {previewContent.items.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription>
                        {item.pubDate && (
                          <span>Published: {format(new Date(item.pubDate), 'MMMM d, yyyy')}</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      {item.imageUrl && (
                        <div className="mb-3 rounded-md overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-700">
                        {item.content?.substring(0, 200)}
                        {item.content?.length > 200 ? '...' : ''}
                      </p>
                    </CardContent>
                    
                    <CardFooter>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center"
                      >
                        <Link className="h-4 w-4 mr-1" />
                        Read full article
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}