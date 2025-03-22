import React, { useState, useRef, useEffect } from 'react';
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
  Link as LinkIcon,
  Hash,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  FileText,
  Send,
  AlertTriangle,
  Check,
  FileImage,
  Info,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  ArrowUpCircle,
  Loader2,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Platform, HashtagGroup, useSocialStore } from '../lib/store';
import { postToSocialMedia, postToMultiplePlatforms } from '../lib/api';
import { env } from '@/config/env';
import { getSuggestedHashtags } from '@/lib/api/hashtags';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { format } from 'date-fns';
import { generateSocialMediaCaption } from '@/lib/api/deepseek';

// Platform-specific constraints
const PLATFORM_CONSTRAINTS = {
  twitter: { 
    maxTextLength: 280,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    maxMediaCount: 4
  },
  linkedin: { 
    maxTextLength: 3000,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'],
    maxMediaCount: 9
  },
  facebook: { 
    maxTextLength: 63206,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    maxMediaCount: 10
  },
  instagram: { 
    maxTextLength: 2200,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
    maxMediaCount: 10
  },
  youtube: { 
    maxTextLength: 5000,
    supportedMediaTypes: ['video/mp4'],
    maxMediaCount: 1
  },
  telegram: { 
    maxTextLength: 4096,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'],
    maxMediaCount: 10
  },
  whatsapp: { 
    maxTextLength: 65536,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'],
    maxMediaCount: 30
  },
  github: { 
    maxTextLength: 10000,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxMediaCount: 10
  }
};

// Form schema with validation
const postFormSchema = z.object({
  content: z.string().min(1, "Content is required"),
  scheduledTime: z.string().optional(),
  link: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  hashtags: z.string().optional(),
  platforms: z.array(z.string()).min(1, "Select at least one platform")
});

type PostFormData = z.infer<typeof postFormSchema>;

interface PostCreatorProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PostCreator({ isOpen, onOpenChange }: PostCreatorProps = {}) {
  const platforms = useSocialStore((state) => state.platforms);
  const addPost = useSocialStore((state) => state.addPost);
  const hashtagGroups = useSocialStore((state) => state.hashtagGroups);
  const removeHashtagGroup = useSocialStore((state) => state.removeHashtagGroup);
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    Object.entries(platforms)
      .filter(([_, data]) => data.enabled)
      .map(([platform]) => platform as Platform)
  );
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState<boolean | null>(null);
  const [postResults, setPostResults] = useState<Record<Platform, { success: boolean; message: string }>>({} as any);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: '',
      link: '',
      hashtags: '',
      platforms: selectedPlatforms
    }
  });
  
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [selectedHashtagGroup, setSelectedHashtagGroup] = useState<string | null>(null);
  const [isLoadingHashtags, setIsLoadingHashtags] = useState(false);
  
  // Update form value when selected platforms change
  useEffect(() => {
    setValue('platforms', selectedPlatforms);
  }, [selectedPlatforms, setValue]);
  
  const watchContent = watch('content');
  const watchHashtags = watch('hashtags');
  const watchLink = watch('link');
  const contentWithHashtags = `${watchContent}${watchHashtags ? ' ' + watchHashtags : ''}${watchLink ? ' ' + watchLink : ''}`;
  
  // Check for platform-specific content length restrictions
  useEffect(() => {
    const newErrors: string[] = [];
    if (contentWithHashtags) {
      selectedPlatforms.forEach(platform => {
        const maxLength = PLATFORM_CONSTRAINTS[platform]?.maxTextLength || 0;
        if (maxLength && contentWithHashtags.length > maxLength) {
          newErrors.push(`Content exceeds ${platform}'s ${maxLength} character limit (currently ${contentWithHashtags.length} characters)`);
        }
      });
    }
    setValidationErrors(newErrors);
  }, [contentWithHashtags, selectedPlatforms]);
  
  // Get hashtags for content
  useEffect(() => {
    const debouncedSuggestHashtags = setTimeout(() => {
      if (watchContent && watchContent.length > 15) {
        suggestHashtags(watchContent);
      }
    }, 1500);
    
    return () => clearTimeout(debouncedSuggestHashtags);
  }, [watchContent]);
  
  const suggestHashtags = async (content: string) => {
    if (!showHashtagSuggestions) return;
    
    try {
      setIsLoadingHashtags(true);
      const hashtags = await getSuggestedHashtags(content, 5);
      setSuggestedHashtags(hashtags);
    } catch (error) {
      console.error('Error getting hashtag suggestions:', error);
    } finally {
      setIsLoadingHashtags(false);
    }
  };
  
  const toggleHashtagSuggestions = () => {
    setShowHashtagSuggestions(prev => {
      const newValue = !prev;
      if (newValue && watchContent && watchContent.length > 15) {
        suggestHashtags(watchContent);
      }
      return newValue;
    });
  };
  
  const addHashtag = (hashtag: string) => {
    const currentHashtags = watchHashtags || '';
    if (!currentHashtags.includes(hashtag)) {
      setValue('hashtags', currentHashtags ? `${currentHashtags} ${hashtag}` : hashtag);
    }
  };
  
  const applyHashtagGroup = (groupId: string) => {
    const group = hashtagGroups.find(g => g.id === groupId);
    if (group) {
      setValue('hashtags', group.hashtags.join(' '));
      
      // If group has specific platforms, select them
      if (group.platforms.length > 0) {
        setSelectedPlatforms(group.platforms);
        setValue('platforms', group.platforms);
      }
      
      setSelectedHashtagGroup(groupId);
    }
  };
  
  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform];
      
      setValue('platforms', newPlatforms);
      return newPlatforms;
    });
  };
  
  const validateMediaForPlatforms = (files: File[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    let valid = true;
    
    if (files.length === 0) {
      return { valid: true, errors: [] };
    }
    
    // Check media count and types for each selected platform
    selectedPlatforms.forEach(platform => {
      const platformConstraints = PLATFORM_CONSTRAINTS[platform];
      
      if (files.length > platformConstraints.maxMediaCount) {
        errors.push(`${platform} supports a maximum of ${platformConstraints.maxMediaCount} media files`);
        valid = false;
      }
      
      files.forEach(file => {
        if (!platformConstraints.supportedMediaTypes.includes(file.type)) {
          errors.push(`${platform} doesn't support ${file.type} media type`);
          valid = false;
        }
      });
    });
    
    // Return unique errors
    return { valid, errors: [...new Set(errors)] };
  };
  
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const allFiles = [...mediaFiles, ...newFiles];
      
      // Validate media for selected platforms
      const { valid, errors } = validateMediaForPlatforms(allFiles);
      
      if (!valid) {
        setValidationErrors(prev => [...prev, ...errors]);
        return;
      }
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setMediaFiles(allFiles);
      setMediaPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  const removeMedia = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    
    const newFiles = mediaFiles.filter((_, i) => i !== index);
    const newUrls = mediaPreviewUrls.filter((_, i) => i !== index);
    
    setMediaFiles(newFiles);
    setMediaPreviewUrls(newUrls);
    
    // Re-validate media
    const { errors } = validateMediaForPlatforms(newFiles);
    setValidationErrors(errors);
  };
  
  const onSubmit = async (data: PostFormData) => {
    if (selectedPlatforms.length === 0) {
      setValidationErrors(["Please select at least one platform"]);
      return;
    }
    
    // Check for any validation errors
    if (validationErrors.length > 0) {
      // Don't proceed if there are validation errors
      return;
    }
    
    setIsPosting(true);
    const results: Record<Platform, { success: boolean; message: string }> = {} as any;
    let overallSuccess = true;
    
    // Combine content and hashtags
    const fullContent = contentWithHashtags;
    
    // Prepare image URLs if any
    let imageUrls: string[] = [];
    if (mediaFiles.length > 0) {
      // In a real app, you'd upload these to your server or a CDN
      // For this demo, we'll just use the local object URLs (which won't work in production)
      imageUrls = mediaPreviewUrls;
    }
    
    try {
      // Post to all selected platforms simultaneously
      const postResults = await postToMultiplePlatforms(
        selectedPlatforms,
        fullContent,
        imageUrls
      );
      
      // Convert the results to our format
      for (const [platform, result] of Object.entries(postResults)) {
        results[platform as Platform] = { 
          success: result.success, 
          message: result.success ? "Posted successfully" : (result.error || "Failed to post")
        };
        
        if (!result.success) {
          overallSuccess = false;
        }
        
        // If scheduled, add to the store
        if (data.scheduledTime && result.success) {
          addPost({
            content: fullContent,
            platform: platform as Platform,
            scheduledTime: new Date(data.scheduledTime).toISOString(),
            status: 'scheduled',
            imageUrl: imageUrls.length > 0 ? imageUrls[0] : undefined,
            mediaUrls: imageUrls.length > 0 ? imageUrls : undefined
          });
        }
      }
    } catch (error) {
      console.error("Error posting to platforms:", error);
      overallSuccess = false;
      
      // Set all platforms as failed
      for (const platform of selectedPlatforms) {
        results[platform] = { 
          success: false, 
          message: error instanceof Error ? error.message : "Unknown error occurred"
        };
      }
    }
    
    setPostResults(results);
    setPostSuccess(overallSuccess);
    setIsPosting(false);
    
    if (overallSuccess) {
      // Clear form after successful post
      reset();
      setMediaFiles([]);
      setMediaPreviewUrls([]);
      setValidationErrors([]);
    }
  };
  
  const getMediaTypeIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      if (file.type === 'image/gif') return <FileImage className="h-4 w-4" />;
      return <ImageIcon className="h-4 w-4" />;
    }
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };
  
  const getMediaTypeLabel = (file: File) => {
    if (file.type.startsWith('image/')) {
      if (file.type === 'image/gif') return 'GIF';
      return 'Image';
    }
    if (file.type.startsWith('video/')) return 'Video';
    return 'File';
  };
  
  const getMediaPreview = (file: File, url: string, index: number) => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="relative group">
          <img src={url} alt="Preview" className="h-20 rounded-md object-cover" />
          <div className="absolute top-1 left-1 bg-black bg-opacity-50 rounded px-1 py-0.5">
            <span className="text-xs text-white font-medium">{getMediaTypeLabel(file)}</span>
          </div>
          <button 
            onClick={() => removeMedia(index)} 
            className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      );
    }
    
    if (file.type.startsWith('video/')) {
      return (
        <div className="relative group">
          <video src={url} className="h-20 rounded-md object-cover" />
          <div className="absolute top-1 left-1 bg-black bg-opacity-50 rounded px-1 py-0.5">
            <span className="text-xs text-white font-medium">{getMediaTypeLabel(file)}</span>
          </div>
          <button 
            onClick={() => removeMedia(index)} 
            className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      );
    }
    
    return (
      <div className="relative group flex flex-col items-center justify-center h-20 w-20 bg-gray-100 rounded-md">
        <FileText className="h-8 w-8 text-gray-400" />
        <span className="text-xs text-gray-500 mt-1">{getMediaTypeLabel(file)}</span>
        <button 
          onClick={() => removeMedia(index)} 
          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      </div>
    );
  };
  
  // Get minimum character limit across selected platforms
  const getMinimumCharLimit = () => {
    return selectedPlatforms.reduce((min, platform) => {
      const maxLength = PLATFORM_CONSTRAINTS[platform]?.maxTextLength || Infinity;
      return Math.min(min, maxLength);
    }, Infinity);
  };
  
  // Check if all platforms support all media files
  const getPlatformsSupportingCurrentMedia = () => {
    if (mediaFiles.length === 0) return selectedPlatforms;
    
    return selectedPlatforms.filter(platform => {
      const constraints = PLATFORM_CONSTRAINTS[platform];
      
      // Check if platform supports all file types and count
      return mediaFiles.length <= constraints.maxMediaCount &&
        mediaFiles.every(file => constraints.supportedMediaTypes.includes(file.type));
    });
  };
  
  const supportedPlatforms = getPlatformsSupportingCurrentMedia();
  const minCharLimit = getMinimumCharLimit();
  const isOverCharLimit = minCharLimit < Infinity && contentWithHashtags.length > minCharLimit;

  // Add new state for hashtag manager
  const [editingGroup, setEditingGroup] = useState<HashtagGroup | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('business');
  const [hashtagToAnalyze, setHashtagToAnalyze] = useState('');
  const [statsResult, setStatsResult] = useState<any>(null);

  // Add state for scheduler status
  const posts = useSocialStore((state) => state.posts);
  const lastScheduledDate = useSocialStore((state) => state.lastScheduledDate);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Count posts by status
  const scheduledPosts = posts.filter(post => post.status === 'scheduled');
  const publishedPosts = posts.filter(post => post.status === 'published');
  const failedPosts = posts.filter(post => post.status === 'failed');
  
  // Find upcoming scheduled posts
  const upcomingPosts = scheduledPosts
    .filter(post => new Date(post.scheduledTime) > currentTime)
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  
  // Get next upcoming post
  const nextPost = upcomingPosts[0];

  // Add new state for tabs
  const [activeTab, setActiveTab] = useState<string>("create");

  // Add state for AI caption generation
  const [captionPrompt, setCaptionPrompt] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  // Function to generate AI caption
  const generateAICaption = async () => {
    if (!captionPrompt.trim() || selectedPlatforms.length === 0) return;
    
    try {
      setIsGeneratingCaption(true);
      // Use the first selected platform for caption targeting
      const targetPlatform = selectedPlatforms[0];
      const caption = await generateSocialMediaCaption(captionPrompt, targetPlatform);
      
      // Set the generated caption as content
      setValue('content', caption);
      
      // Auto-suggest hashtags for the generated content
      if (showHashtagSuggestions) {
        suggestHashtags(caption);
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      // Could add error state here
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const [open, setOpen] = useState(false);
  
  // Sync with external state if provided
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Update external state if handler provided
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Social Media Manager</h2>
        <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
          <span className="font-medium">Cross-Platform Posting</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="create">
            <Send className="h-4 w-4 mr-2" />
            Create Post
          </TabsTrigger>
          <TabsTrigger value="hashtags">
            <Hash className="h-4 w-4 mr-2" />
            Hashtags
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Clock className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Post Creation Tab */}
        <TabsContent value="create" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Post Creator Column */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Select Platforms</label>
                    <div className="flex space-x-2">
                      <button 
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => setSelectedPlatforms(
                          Object.entries(platforms)
                            .filter(([_, data]) => data.enabled)
                            .map(([platform]) => platform as Platform)
                        )}
                      >
                        Select All Enabled
                      </button>
                      <button 
                        type="button"
                        className="text-xs text-gray-600 hover:text-gray-800"
                        onClick={() => setSelectedPlatforms([])}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto pr-2 pb-2 rounded-md border border-gray-100">
                    <div className="flex flex-wrap gap-2 p-2">
                      {Object.entries(platforms).map(([platform, data]) => {
                        const isCompatible = mediaFiles.length === 0 || 
                          supportedPlatforms.includes(platform as Platform);
                        
                        return (
                          <button
                            key={platform}
                            className={`
                              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                              ${selectedPlatforms.includes(platform as Platform) 
                                ? isCompatible 
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                              }
                              ${!data.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                              ${!isCompatible && !selectedPlatforms.includes(platform as Platform) ? 'opacity-50' : ''}
                            `}
                            onClick={() => togglePlatform(platform as Platform)}
                            disabled={!data.enabled}
                            title={!isCompatible ? "Current media not supported by this platform" : ""}
                          >
                            {platform === 'twitter' && <Twitter className="h-4 w-4 text-blue-400" />}
                            {platform === 'linkedin' && <Linkedin className="h-4 w-4 text-blue-600" />}
                            {platform === 'facebook' && <Facebook className="h-4 w-4 text-blue-600" />}
                            {platform === 'instagram' && <Instagram className="h-4 w-4 text-pink-600" />}
                            {platform === 'youtube' && <Youtube className="h-4 w-4 text-red-600" />}
                            {platform === 'telegram' && <MessageCircle className="h-4 w-4 text-blue-500" />}
                            {platform === 'whatsapp' && <MessagesSquare className="h-4 w-4 text-green-500" />}
                            {platform === 'github' && <Github className="h-4 w-4 text-gray-900" />}
                            <span className="capitalize">{platform}</span>
                            {!data.enabled && <span className="text-xs text-gray-500">(Disabled)</span>}
                            {selectedPlatforms.includes(platform as Platform) && !isCompatible && (
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {selectedPlatforms.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Posting to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}:  
                      {selectedPlatforms.map((platform, index) => (
                        <span key={platform} className="font-medium capitalize">
                          {index > 0 ? ', ' : ' '}{platform}
                        </span>
                      ))}
                    </p>
                  )}
                  
                  {/* Warning for incompatible platforms */}
                  {mediaFiles.length > 0 && selectedPlatforms.some(platform => !supportedPlatforms.includes(platform)) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
                      <p className="text-xs text-amber-700 flex items-start">
                        <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 mr-1 flex-shrink-0" />
                        <span>
                          Some selected platforms don't support your current media. Please review your selections.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Add AI caption generation */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">AI Caption Generation</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAICaption}
                        disabled={isGeneratingCaption || !captionPrompt.trim() || selectedPlatforms.length === 0}
                      >
                        {isGeneratingCaption ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Caption
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Describe what you want to post about..."
                      value={captionPrompt}
                      onChange={(e) => setCaptionPrompt(e.target.value)}
                      disabled={isGeneratingCaption}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Example: "Announcing our new product launch" or "Tips for productivity"
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Post Content</label>
                    <span className={`text-xs font-medium ${isOverCharLimit ? 'text-red-500' : 'text-gray-500'}`}>
                      {contentWithHashtags.length} / {minCharLimit < Infinity ? minCharLimit : "∞"}
                    </span>
                  </div>
                  <textarea 
                    className={`w-full min-h-[120px] px-3 py-2 border rounded-md resize-y ${
                      isOverCharLimit ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="What would you like to share?"
                    {...register('content', { required: "Content is required" })}
                  />
                  {errors.content && (
                    <p className="text-red-500 text-xs">{errors.content.message}</p>
                  )}
                  {isOverCharLimit && (
                    <p className="text-red-500 text-xs">Content exceeds character limit for some platforms</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Add Link</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="url" 
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md" 
                        placeholder="https://example.com"
                        {...register('link')}
                      />
                    </div>
                    {errors.link && (
                      <p className="text-red-500 text-xs">{errors.link.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Hashtags</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className={`text-xs font-medium ${showHashtagSuggestions ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-700`}
                          onClick={toggleHashtagSuggestions}
                        >
                          {showHashtagSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
                        </button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                              Hashtag Groups
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Select Hashtag Group</DialogTitle>
                            </DialogHeader>
                            
                            {hashtagGroups.length === 0 ? (
                              <div className="text-center p-6">
                                <p className="text-gray-500">No hashtag groups found.</p>
                                <p className="text-sm text-gray-400 mt-1">Create hashtag groups in the Hashtag Manager.</p>
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                {hashtagGroups.map(group => (
                                  <button
                                    key={group.id}
                                    type="button"
                                    className={`w-full text-left p-3 border rounded-md hover:bg-gray-50 transition-colors ${
                                      selectedHashtagGroup === group.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                                    }`}
                                    onClick={() => applyHashtagGroup(group.id)}
                                  >
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-medium">{group.name}</h4>
                                      <span className="text-xs text-gray-500">{group.category}</span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {group.hashtags.map(tag => (
                                        <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="mt-2 flex items-center text-xs text-blue-600">
                                      <ArrowRight className="h-3 w-3 mr-1" />
                                      <span>Apply to post</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md" 
                        placeholder="#marketing #socialmedia"
                        {...register('hashtags')}
                      />
                    </div>
                    
                    {showHashtagSuggestions && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-medium text-gray-700">Suggested Hashtags</h4>
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => suggestHashtags(watchContent)}
                            disabled={isLoadingHashtags || !watchContent}
                          >
                            Refresh
                          </button>
                        </div>
                        
                        {isLoadingHashtags ? (
                          <div className="flex items-center justify-center py-2">
                            <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                            <span className="ml-2 text-xs text-gray-500">Generating suggestions...</span>
                          </div>
                        ) : suggestedHashtags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {suggestedHashtags.map(tag => (
                              <button
                                key={tag}
                                type="button"
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-100"
                                onClick={() => addHashtag(tag)}
                              >
                                <span>{tag}</span>
                                <Plus className="h-3 w-3" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 py-1">
                            {watchContent && watchContent.length > 15
                              ? "No suggestions available. Try adding more descriptive content."
                              : "Add more content to get hashtag suggestions."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Media</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      {mediaFiles.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Revoke all URLs
                            mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
                            setMediaFiles([]);
                            setMediaPreviewUrls([]);
                            setValidationErrors([]);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All
                        </Button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleMediaUpload}
                      multiple
                      accept="image/*,video/*,audio/*,application/pdf"
                    />
                  </div>
                  
                  {selectedPlatforms.length > 0 && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      Supported: {selectedPlatforms.length === 1 ? (
                        <span>
                          {PLATFORM_CONSTRAINTS[selectedPlatforms[0]].supportedMediaTypes.map(type => 
                            type.split('/')[1].toUpperCase()
                          ).join(', ')} 
                          (max {PLATFORM_CONSTRAINTS[selectedPlatforms[0]].maxMediaCount})
                        </span>
                      ) : "Various media types depending on platform"}
                    </div>
                  )}
                  
                  {mediaPreviewUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mediaFiles.map((file, index) => (
                        <div key={index}>
                          {getMediaPreview(file, mediaPreviewUrls[index], index)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Schedule (Optional)</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                    {...register('scheduledTime')}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-gray-500">Leave empty to post immediately</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Preview</label>
                  <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{contentWithHashtags}</p>
                    
                    {mediaPreviewUrls.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {mediaFiles.map((file, index) => (
                          <div key={index} className="inline-flex items-center gap-1 text-xs text-gray-500">
                            {getMediaTypeIcon(file)}
                            <span className="truncate max-w-[150px]">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Validation Errors Display */}
                {validationErrors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="text-sm font-medium text-red-800 flex items-center mb-1">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Validation Errors
                    </h4>
                    <ul className="text-xs text-red-700 space-y-1 ml-5 list-disc">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Post Results */}
                {postSuccess !== null && (
                  <div className={`p-4 rounded-md ${postSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <h3 className="font-medium flex items-center">
                      {postSuccess ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                          Post successful!
                          {env.IS_DEVELOPMENT && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                              DEVELOPMENT MODE
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                          Some posts failed
                        </>
                      )}
                    </h3>
                    {env.IS_DEVELOPMENT && (
                      <div className="mt-2 p-2 border border-amber-200 bg-amber-50 rounded-md">
                        <p className="text-xs text-amber-700 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          <span>
                            <strong>Running in development mode</strong> - no actual posts are being made to real platforms.
                          </span>
                        </p>
                        <div className="text-xs mt-1 text-amber-700">
                          <span>To make real posts, you need to:</span>
                          <ol className="list-decimal ml-5 mt-1">
                            <li>Make sure your API server is running at <code className="bg-amber-100 px-1 rounded">{env.API_URL}</code></li>
                            <li>Configure your social media API credentials in the .env file</li>
                            <li>If you see 404 errors, your app is looking for an API at <code className="bg-amber-100 px-1 rounded">{window.location.origin}/api/social</code> which doesn't exist. Check the browser console.</li>
                          </ol>
                        </div>
                      </div>
                    )}
                    <ul className="mt-2 text-sm">
                      {Object.entries(postResults).map(([platform, result]) => (
                        <li key={platform} className="flex items-center gap-2 py-1">
                          {result.success ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-red-500">✗</span>
                          )}
                          <span className="capitalize font-medium">{platform}:</span> {result.message}
                          {env.IS_DEVELOPMENT && result.success && (
                            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded ml-1">(mock data)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-500">
                    {contentWithHashtags ? 
                      <span>{contentWithHashtags.length} characters</span> : 
                      <span>Add content to your post</span>
                    }
                  </div>
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={
                      isPosting || 
                      !watchContent || 
                      selectedPlatforms.length === 0 || 
                      validationErrors.length > 0 ||
                      isOverCharLimit
                    }
                  >
                    <Send className="h-4 w-4" />
                    {isPosting ? 'Posting...' : (
                      selectedPlatforms.length > 1 
                        ? `Post to ${selectedPlatforms.length} platforms` 
                        : 'Post Now'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Quick Tips</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Add hashtags to increase your post visibility</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Different platforms have different character limits</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Schedule posts for optimal engagement times</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium mb-2">Upcoming Posts</h4>
                  {nextPost ? (
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize">
                          {nextPost.platform}
                        </Badge>
                        <span className="text-gray-500">
                          {format(new Date(nextPost.scheduledTime), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-700 truncate">{nextPost.content.substring(0, 60)}...</p>
                      <button 
                        className="text-xs text-blue-600 flex items-center mt-2 hover:text-blue-800" 
                        onClick={() => setActiveTab("schedule")}
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        View all scheduled posts
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No upcoming posts</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Hashtags Tab */}
        <TabsContent value="hashtags" className="space-y-4">
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
                    onClick={() => setEditingGroup(null)}
                  >
                    Cancel Editing
                  </Button>
                )}
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                // Here we need to implement the hashtag form submission
                // Similar to the logic in the original HashtagManager component
              }} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Group Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-md border-gray-300"
                    placeholder="e.g., Marketing, Tech, Fashion" 
                    value={editingGroup?.name || ''}
                    onChange={(e) => {
                      if (editingGroup) {
                        setEditingGroup({...editingGroup, name: e.target.value});
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Hashtags (comma separated)</label>
                  <textarea 
                    className="w-full px-3 py-2 border rounded-md h-24 border-gray-300"
                    placeholder="#marketing, #socialmedia, #growthhacking"
                    value={editingGroup?.hashtags.join(', ') || ''}
                    onChange={(e) => {
                      if (editingGroup) {
                        setEditingGroup({
                          ...editingGroup, 
                          hashtags: e.target.value.split(',').map(tag => tag.trim())
                        });
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Category</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md border-gray-300"
                    value={editingGroup?.category || 'Business'}
                    onChange={(e) => {
                      if (editingGroup) {
                        setEditingGroup({...editingGroup, category: e.target.value});
                      }
                    }}
                  >
                    <option value="Business">Business</option>
                    <option value="Technology">Technology</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Sports">Sports</option>
                    <option value="Education">Education</option>
                    <option value="Travel">Travel</option>
                    <option value="Fashion">Fashion</option>
                  </select>
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
                          ${editingGroup?.platforms.includes(platform as Platform) 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                          }
                          ${!data.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        onClick={() => {
                          if (!editingGroup) return;
                          
                          const platforms = editingGroup.platforms.includes(platform as Platform)
                            ? editingGroup.platforms.filter(p => p !== platform)
                            : [...editingGroup.platforms, platform as Platform];
                            
                          setEditingGroup({...editingGroup, platforms});
                        }}
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
                </div>
                
                <Button type="submit" className="w-full">
                  {editingGroup?.id ? 'Update Hashtag Group' : 'Save Hashtag Group'}
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
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setValue('hashtags', group.hashtags.join(' '));
                            setSelectedPlatforms(group.platforms);
                            setValue('platforms', group.platforms);
                            setActiveTab('create');
                          }}
                        >
                          Apply to current post
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-medium">Scheduled Posts</h3>
              
              {scheduledPosts.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-md">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No scheduled posts yet.</p>
                  <p className="text-sm text-gray-400">Schedule your first post to get started.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {upcomingPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {post.platform}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(new Date(post.scheduledTime), 'MMM dd, yyyy • HH:mm')}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // Edit logic would go here
                              setActiveTab('create');
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // Remove logic would go here
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{post.content}</p>
                      {post.imageUrl && (
                        <div className="mt-2">
                          <img src={post.imageUrl} alt="Post media" className="h-20 rounded-md object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Posting Status</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Scheduler Status:</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Active</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Scheduled:</span>
                    {lastScheduledDate ? (
                      <span className="text-sm font-medium">{lastScheduledDate}</span>
                    ) : (
                      <span className="text-sm text-gray-500">Never</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 my-3">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <div className="text-blue-600 font-semibold">{scheduledPosts.length}</div>
                    <div className="text-xs text-gray-600">Scheduled</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <div className="text-green-600 font-semibold">{publishedPosts.length}</div>
                    <div className="text-xs text-gray-600">Published</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded text-center">
                    <div className="text-red-600 font-semibold">{failedPosts.length}</div>
                    <div className="text-xs text-gray-600">Failed</div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-3" 
                  onClick={() => setActiveTab('create')}
                >
                  Create New Post
                </Button>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Optimal Posting Times</h3>
                
                <div className="space-y-3">
                  {Object.entries(platforms)
                    .filter(([_, data]) => data.enabled)
                    .map(([platform, data]) => (
                    <div key={platform}>
                      <div className="flex items-center mb-1">
                        {platform === 'twitter' && <Twitter className="h-4 w-4 text-blue-400 mr-1" />}
                        {platform === 'linkedin' && <Linkedin className="h-4 w-4 text-blue-600 mr-1" />}
                        {platform === 'facebook' && <Facebook className="h-4 w-4 text-blue-600 mr-1" />}
                        {platform === 'instagram' && <Instagram className="h-4 w-4 text-pink-600 mr-1" />}
                        {platform === 'youtube' && <Youtube className="h-4 w-4 text-red-600 mr-1" />}
                        {platform === 'telegram' && <MessageCircle className="h-4 w-4 text-blue-500 mr-1" />}
                        {platform === 'whatsapp' && <MessagesSquare className="h-4 w-4 text-green-500 mr-1" />}
                        {platform === 'github' && <Github className="h-4 w-4 text-gray-900 mr-1" />}
                        <span className="text-sm font-medium capitalize">{platform}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2 ml-5">
                        {data.bestTimes.map((time, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 