import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { useSocialStore } from '@/lib/store';
import { fetchRssFeed, generatePlatformContent } from '@/lib/rss';
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const feedSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  refreshInterval: z.string().min(1, 'Refresh interval is required'),
});

type FeedForm = z.infer<typeof feedSchema>;

const categories = [
  'Technology',
  'Business',
  'Marketing',
  'Social Media',
  'News',
  'Entertainment',
  'Other',
];

const refreshIntervals = [
  { value: '15', label: 'Every 15 minutes' },
  { value: '30', label: 'Every 30 minutes' },
  { value: '60', label: 'Every hour' },
  { value: '120', label: 'Every 2 hours' },
  { value: '240', label: 'Every 4 hours' },
];

export function RssFeedManager() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FeedForm>({
    resolver: zodResolver(feedSchema),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const { rssFeeds, addRssFeed, removeRssFeed, addPost, platforms } = useSocialStore();

  const onSubmit = async (data: FeedForm) => {
    setLoading(true);
    setError(null);
    try {
      // Validate feed URL
      const feedContent = await fetchRssFeed(data.url);
      if (!feedContent || !feedContent.items || feedContent.items.length === 0) {
        throw new Error('Invalid RSS feed or no items found');
      }

      addRssFeed({
        ...data,
        id: Date.now().toString(),
        lastFetched: new Date().toISOString(),
      });
      reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add feed');
      console.error('Error adding feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndGeneratePosts = async (feedUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchRssFeed(feedUrl);
      const enabledPlatforms = Object.entries(platforms)
        .filter(([_, data]) => data.enabled)
        .map(([platform]) => platform);

      items.slice(0, 3).forEach((item) => {
        enabledPlatforms.forEach((platform: any) => {
          const content = generatePlatformContent(item, platform);
          const bestTime = platforms[platform].bestTimes[0];
          const scheduledTime = new Date();
          scheduledTime.setHours(parseInt(bestTime.split(':')[0]), parseInt(bestTime.split(':')[1]));

          addPost({
            content,
            platform,
            scheduledTime: scheduledTime.toISOString(),
            status: 'scheduled',
            imageUrl: item.imageUrl,
            sourceUrl: item.link,
          });
        });
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch RSS feed');
      console.error('Error fetching RSS feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const previewFeed = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const feed = await fetchRssFeed(url);
      setPreviewContent(feed);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to preview feed');
      console.error('Error previewing feed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">RSS Feed Manager</h2>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Feed Name</label>
          <Input
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
            placeholder="Enter feed name..."
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Feed URL</label>
          <div className="flex space-x-2">
            <Input
              {...register('url')}
              className={errors.url ? 'border-red-500' : ''}
              placeholder="Enter RSS feed URL..."
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => previewFeed(watch('url'))}
              disabled={loading}
            >
              Preview
            </Button>
          </div>
          {errors.url && (
            <p className="mt-1 text-sm text-red-500">{errors.url.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <Select onValueChange={(value) => register('category').onChange({ target: { value } })}>
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
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Refresh Interval</label>
          <Select onValueChange={(value) => register('refreshInterval').onChange({ target: { value } })}>
            <SelectTrigger className={errors.refreshInterval ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select refresh interval" />
            </SelectTrigger>
            <SelectContent>
              {refreshIntervals.map((interval) => (
                <SelectItem key={interval.value} value={interval.value}>
                  {interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.refreshInterval && (
            <p className="mt-1 text-sm text-red-500">{errors.refreshInterval.message}</p>
          )}
        </div>

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
      </form>

      <div className="space-y-4">
        {rssFeeds.map((feed) => (
          <div key={feed.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">{feed.name}</h3>
              <p className="text-sm text-gray-500">{feed.url}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {feed.category}
                </span>
                <span className="text-xs text-gray-500">
                  Refresh: {refreshIntervals.find(i => i.value === feed.refreshInterval)?.label}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => fetchAndGeneratePosts(feed.url)}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Generate Posts'
                )}
              </Button>
              <Button
                onClick={() => removeRssFeed(feed.id)}
                variant="destructive"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {previewContent && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4">
              View Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Feed Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <h3 className="font-medium">{previewContent.title}</h3>
              <p className="text-sm text-gray-500">{previewContent.description}</p>
              <div className="space-y-2">
                {previewContent.items.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="border-b pb-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Read more
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}