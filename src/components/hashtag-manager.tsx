import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Youtube, 
  MessageCircle, 
  MessagesSquare, 
  Github,
  Hash,
  Search,
  Trash2,
  Edit2,
  RefreshCw,
  Plus,
  BarChart2,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { HashtagGroup, Platform, useSocialStore } from '@/lib/store';
import { 
  getSuggestedHashtags, 
  getTrendingHashtags, 
  getHashtagStats,
  getHashtagsFromImage 
} from '@/lib/api/hashtags';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const hashtagSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  hashtags: z.string().min(1, "At least one hashtag is required"),
  category: z.string().min(1, "Category is required"),
  platforms: z.array(z.string()).min(1, "Select at least one platform")
});

type HashtagFormData = z.infer<typeof hashtagSchema>;

export function HashtagManager() {
  const hashtagGroups = useSocialStore((state) => state.hashtagGroups);
  const addHashtagGroup = useSocialStore((state) => state.addHashtagGroup);
  const updateHashtagGroup = useSocialStore((state) => state.updateHashtagGroup);
  const removeHashtagGroup = useSocialStore((state) => state.removeHashtagGroup);
  const platforms = useSocialStore((state) => state.platforms);
  
  const [activeTab, setActiveTab] = useState('manage');
  const [editingGroup, setEditingGroup] = useState<HashtagGroup | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [searchText, setSearchText] = useState('');
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('business');
  const [hashtagToAnalyze, setHashtagToAnalyze] = useState('');
  const [statsResult, setStatsResult] = useState<any>(null);
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<HashtagFormData>({
    resolver: zodResolver(hashtagSchema),
    defaultValues: {
      name: '',
      hashtags: '',
      category: 'Business',
      platforms: []
    }
  });

  // Load trending hashtags on component mount
  useEffect(() => {
    fetchTrendingHashtags();
  }, [selectedCategory]);

  // Update form when editing a group
  useEffect(() => {
    if (editingGroup) {
      setValue('name', editingGroup.name);
      setValue('hashtags', editingGroup.hashtags.join(', '));
      setValue('category', editingGroup.category);
      setValue('platforms', editingGroup.platforms);
      setSelectedPlatforms(editingGroup.platforms);
    } else {
      reset();
      setSelectedPlatforms([]);
    }
  }, [editingGroup, setValue, reset]);

  const fetchSuggestedHashtags = async () => {
    if (!searchText.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      const hashtags = await getSuggestedHashtags(searchText, 10);
      setSuggestedHashtags(hashtags);
    } catch (err) {
      setError('Failed to fetch hashtag suggestions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingHashtags = async () => {
    try {
      setLoading(true);
      setError(null);
      const hashtags = await getTrendingHashtags(selectedCategory);
      setTrendingHashtags(hashtags);
    } catch (err) {
      setError('Failed to fetch trending hashtags');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHashtagStats = async () => {
    if (!hashtagToAnalyze.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      const stats = await getHashtagStats(hashtagToAnalyze);
      setStatsResult(stats);
    } catch (err) {
      setError('Failed to analyze hashtag');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchImageHashtags = async () => {
    if (!imageUrl.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      const hashtags = await getHashtagsFromImage(imageUrl);
      setSuggestedHashtags(hashtags);
    } catch (err) {
      setError('Failed to analyze image for hashtags');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => {
      const newSelection = prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform];
      
      setValue('platforms', newSelection);
      return newSelection;
    });
  };

  const onSubmit = (data: HashtagFormData) => {
    // Parse hashtags from comma-separated string
    const hashtagArray = data.hashtags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    
    const groupData = {
      name: data.name,
      hashtags: hashtagArray,
      platforms: data.platforms as Platform[],
      category: data.category
    };
    
    if (editingGroup) {
      updateHashtagGroup(editingGroup.id, groupData);
    } else {
      addHashtagGroup(groupData);
    }
    
    // Reset form and editing state
    reset();
    setEditingGroup(null);
    setSelectedPlatforms([]);
  };

  const addSuggestedHashtag = (hashtag: string) => {
    const currentHashtags = getValue('hashtags') || '';
    const hashtags = currentHashtags
      ? currentHashtags.split(',').map(h => h.trim())
      : [];
    
    // Add hashtag if not already present
    if (!hashtags.includes(hashtag)) {
      setValue('hashtags', [...hashtags, hashtag].join(', '));
    }
  };

  const getValue = (field: keyof HashtagFormData): string => {
    try {
      // This is a bit hacky but it works for simple form values
      // @ts-ignore - we know this might not be safe but it's internal to this component
      return document.querySelector(`[name="${field}"]`).value || '';
    } catch {
      return '';
    }
  };

  // Clear all data and form
  const handleCancel = () => {
    reset();
    setEditingGroup(null);
    setSelectedPlatforms([]);
  };

  // Categories for hashtags
  const categories = [
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
    { value: 'education', label: 'Education' },
    { value: 'travel', label: 'Travel' },
    { value: 'fashion', label: 'Fashion' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Hashtag Manager</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="manage">Manage Groups</TabsTrigger>
          <TabsTrigger value="generate">Generate Hashtags</TabsTrigger>
          <TabsTrigger value="analyze">Analyze Hashtags</TabsTrigger>
        </TabsList>
        
        {/* MANAGE HASHTAG GROUPS */}
        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create/Edit Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {editingGroup ? 'Edit Hashtag Group' : 'Create Hashtag Group'}
                </h3>
                {editingGroup && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCancel}
                  >
                    Cancel Editing
                  </Button>
                )}
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Group Name</label>
                  <input 
                    type="text" 
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Marketing, Tech, Fashion" 
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Hashtags (comma separated)</label>
                  <textarea 
                    className={`w-full px-3 py-2 border rounded-md h-24 ${
                      errors.hashtags ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="#marketing, #socialmedia, #growthhacking"
                    {...register('hashtags')}
                  />
                  {errors.hashtags && (
                    <p className="text-red-500 text-xs">{errors.hashtags.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Category</label>
                  <select 
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                    {...register('category')}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.label}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs">{errors.category.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(platforms).map(([platform, data]) => (
                      <button
                        key={platform}
                        type="button"
                        className={`
                          flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors
                          ${selectedPlatforms.includes(platform as Platform) 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                          }
                          ${!data.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        onClick={() => togglePlatform(platform as Platform)}
                        disabled={!data.enabled}
                      >
                        {platform === 'twitter' && <Twitter className="h-3 w-3" />}
                        {platform === 'linkedin' && <Linkedin className="h-3 w-3" />}
                        {platform === 'facebook' && <Facebook className="h-3 w-3" />}
                        {platform === 'instagram' && <Instagram className="h-3 w-3" />}
                        {platform === 'youtube' && <Youtube className="h-3 w-3" />}
                        {platform === 'telegram' && <MessageCircle className="h-3 w-3" />}
                        {platform === 'whatsapp' && <MessagesSquare className="h-3 w-3" />}
                        {platform === 'github' && <Github className="h-3 w-3" />}
                        <span className="capitalize">{platform}</span>
                      </button>
                    ))}
                  </div>
                  {errors.platforms && (
                    <p className="text-red-500 text-xs">{errors.platforms.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full">
                  {editingGroup ? 'Update Hashtag Group' : 'Save Hashtag Group'}
                </Button>
              </form>
            </div>
            
            {/* Saved Groups */}
            <div>
              <h3 className="text-lg font-medium mb-4">Saved Hashtag Groups</h3>
              {hashtagGroups.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-md">
                  <Hash className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No hashtag groups yet.</p>
                  <p className="text-sm text-gray-400">Create your first group to get started.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {hashtagGroups.map((group) => (
                    <div key={group.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{group.name}</h4>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingGroup(group)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeHashtagGroup(group.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{group.category}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {group.hashtags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {group.platforms.map(platform => (
                          <span key={platform} className="text-gray-500">
                            {platform === 'twitter' && <Twitter className="h-3 w-3" />}
                            {platform === 'linkedin' && <Linkedin className="h-3 w-3" />}
                            {platform === 'facebook' && <Facebook className="h-3 w-3" />}
                            {platform === 'instagram' && <Instagram className="h-3 w-3" />}
                            {platform === 'youtube' && <Youtube className="h-3 w-3" />}
                            {platform === 'telegram' && <MessageCircle className="h-3 w-3" />}
                            {platform === 'whatsapp' && <MessagesSquare className="h-3 w-3" />}
                            {platform === 'github' && <Github className="h-3 w-3" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* GENERATE HASHTAGS */}
        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Text-based Generation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Generate from Text</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter topic or content"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Button 
                  onClick={fetchSuggestedHashtags}
                  disabled={loading || !searchText.trim()}
                >
                  {loading ? 'Generating...' : 'Generate'}
                </Button>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Trending by Category</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {categories.map(category => (
                    <button
                      key={category.value}
                      className={`text-xs px-3 py-1 rounded-full ${
                        selectedCategory === category.value
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchTrendingHashtags}
                  className="w-full"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Refresh Trending Hashtags
                </Button>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Image-based Hashtags</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button 
                    variant="secondary"
                    onClick={fetchImageHashtags}
                    disabled={loading || !imageUrl.trim()}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            
            {/* Results Display */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Hashtag Results</h3>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Create Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Hashtag Group</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Group Name</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="e.g., Generated Hashtags" 
                          value={`Generated ${new Date().toLocaleDateString()}`}
                          onChange={(e) => setValue('name', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Hashtags</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                          value={
                            [...suggestedHashtags, ...trendingHashtags.slice(0, 3)]
                              .filter((v, i, a) => a.indexOf(v) === i)
                              .join(', ')
                          }
                          onChange={(e) => setValue('hashtags', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Category</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={categories.find(c => c.value === selectedCategory)?.label}
                          onChange={(e) => setValue('category', e.target.value)}
                        >
                          {categories.map(category => (
                            <option key={category.value} value={category.label}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Platforms</label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(platforms)
                            .filter(([_, data]) => data.enabled)
                            .map(([platform]) => (
                              <button
                                key={platform}
                                type="button"
                                className={`
                                  flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors
                                  ${selectedPlatforms.includes(platform as Platform) 
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                                  }
                                `}
                                onClick={() => togglePlatform(platform as Platform)}
                              >
                                <span className="capitalize">{platform}</span>
                              </button>
                          ))}
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full">Save Group</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Suggested Hashtags */}
              {suggestedHashtags.length > 0 && (
                <div className="border border-gray-200 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">
                    Suggested Hashtags 
                    <Badge variant="outline" className="ml-2">
                      {suggestedHashtags.length}
                    </Badge>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestedHashtags.map(tag => (
                      <button
                        key={tag}
                        className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-100"
                        onClick={() => addSuggestedHashtag(tag)}
                      >
                        <span>{tag}</span>
                        <Plus className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Trending Hashtags */}
              {trendingHashtags.length > 0 && (
                <div className="border border-gray-200 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">
                    Trending Hashtags
                    <Badge variant="secondary" className="ml-2">
                      {selectedCategory}
                    </Badge>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trendingHashtags.map(tag => (
                      <button
                        key={tag}
                        className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-green-100"
                        onClick={() => addSuggestedHashtag(tag)}
                      >
                        <span>{tag}</span>
                        <Plus className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {suggestedHashtags.length === 0 && trendingHashtags.length === 0 && !loading && (
                <div className="text-center p-6 bg-gray-50 rounded-md">
                  <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No hashtags generated yet.</p>
                  <p className="text-sm text-gray-400">Use the tools on the left to find hashtags.</p>
                </div>
              )}
              
              {loading && (
                <div className="text-center p-6">
                  <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500">Generating hashtags...</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* ANALYZE HASHTAGS */}
        <TabsContent value="analyze" className="space-y-4">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter a hashtag to analyze (without #)"
              value={hashtagToAnalyze}
              onChange={(e) => setHashtagToAnalyze(e.target.value)}
            />
            <Button 
              onClick={fetchHashtagStats}
              disabled={loading || !hashtagToAnalyze.trim()}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>
          
          {loading && (
            <div className="text-center p-6">
              <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
              <p className="text-gray-500">Analyzing hashtag...</p>
            </div>
          )}
          
          {statsResult && !loading && (
            <div className="border border-gray-200 rounded-md p-6">
              <h3 className="text-lg font-medium mb-4">
                #{statsResult.hashtag || hashtagToAnalyze} Analysis
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-blue-700">Exposure</h4>
                  <p className="text-xl font-bold">{statsResult.exposure?.toLocaleString() || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Potential views per hour</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-green-700">Activity</h4>
                  <p className="text-xl font-bold">{statsResult.tweets?.toLocaleString() || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Tweets per hour</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Related Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {statsResult.hashtags?.map((tag: string) => (
                    <button
                      key={tag}
                      className="text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                      onClick={() => setHashtagToAnalyze(tag.replace('#', ''))}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                
                {Array.isArray(statsResult.hashtags) && statsResult.hashtags.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setValue('hashtags', statsResult.hashtags.join(', '));
                      setActiveTab('manage');
                    }}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Create Group from Related Hashtags
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {!statsResult && !loading && (
            <div className="text-center p-6 bg-gray-50 rounded-md">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Enter a hashtag to see analytics.</p>
              <p className="text-sm text-gray-400">You'll see exposure, activity, and related tags.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 