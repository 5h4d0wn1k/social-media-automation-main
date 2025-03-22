import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { useSocialStore, Platform, Post } from '@/lib/store';
import { 
  Loader2, 
  Upload, 
  Eye, 
  Calendar as CalendarIcon, 
  Clock, 
  X, 
  AlertCircle, 
  CheckCircle, 
  ImagePlus, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { cn, platformIcons } from '@/lib/utils';
import { generateSocialMediaCaption } from '@/lib/api/deepseek';
import { generateHashtagsWithDeepSeek } from '@/lib/api/deepseek';

// Create a simplified toast function
const toast = (props: { 
  title?: string, 
  description?: string, 
  variant?: 'default' | 'destructive' | 'success' 
}) => {
  console.log(`Toast: ${props.title} - ${props.description}`);
};

// Dummy ToastAction component
const ToastAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { altText: string }> = () => null;

const scheduleSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram', 'youtube', 'telegram', 'whatsapp', 'github'] as const),
  scheduledTime: z.date(),
  media: z.array(z.instanceof(File)).optional(),
  hashtags: z.string().optional(),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

// Platform type from the schema for consistency
type SchedulePlatform = z.infer<typeof scheduleSchema>['platform'];

// Character limits by platform
const PLATFORM_LIMITS: Record<SchedulePlatform, number> = {
  twitter: 280,
  facebook: 5000,
  instagram: 2200,
  linkedin: 3000,
  youtube: 5000,
  telegram: 4096,
  whatsapp: 1000,
  github: 1000
};

// Media format support by platform
const PLATFORM_MEDIA_SUPPORT: Record<SchedulePlatform, { image: boolean; video: boolean; gif: boolean }> = {
  twitter: { image: true, video: true, gif: true },
  facebook: { image: true, video: true, gif: true },
  instagram: { image: true, video: true, gif: false },
  linkedin: { image: true, video: true, gif: false },
  youtube: { image: true, video: true, gif: false },
  telegram: { image: true, video: true, gif: true },
  whatsapp: { image: true, video: true, gif: true },
  github: { image: true, video: false, gif: true }
};

// Media size limits by platform (in MB)
const PLATFORM_MEDIA_SIZE_LIMITS: Record<SchedulePlatform, { image: number; video: number }> = {
  twitter: { image: 5, video: 512 },
  facebook: { image: 30, video: 4000 },
  instagram: { image: 30, video: 650 },
  linkedin: { image: 100, video: 5000 },
  youtube: { image: 2, video: 128000 },
  telegram: { image: 10, video: 2000 },
  whatsapp: { image: 16, video: 16 },
  github: { image: 10, video: 100 }
};

export function PostScheduler() {
  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      platform: 'twitter',
      content: '',
      scheduledTime: new Date(),
      hashtags: '',
      media: []
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState(format(new Date(), 'HH:mm'));
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'preview' | 'schedule'>('content');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const addPost = useSocialStore((state) => state.addPost);
  const platforms = useSocialStore((state) => state.platforms);
  
  const selectedPlatform = watch('platform') as SchedulePlatform;
  const contentText = watch('content');
  const hashtagsText = watch('hashtags');

  // Update character count
  useEffect(() => {
    setCharacterCount(contentText?.length || 0);
  }, [contentText]);

  const onSubmit = async (data: ScheduleForm) => {
    setLoading(true);
    setError(null);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledTime = new Date(selectedDate || new Date());
      scheduledTime.setHours(hours, minutes);

      // Handle media upload if files exist
      const mediaUrls = mediaFiles.length > 0 
        ? await Promise.all(mediaFiles.map(file => uploadMedia(file)))
        : [];

      // Create content with hashtags if any
      const finalContent = data.hashtags 
        ? `${data.content}\n\n${data.hashtags}` 
        : data.content;

      // Add post to store
      addPost({
        content: finalContent,
        platform: data.platform,
        scheduledTime: scheduledTime.toISOString(),
        status: 'scheduled',
        mediaUrls,
      });

      // Show success message
      setShowSuccessMessage(true);
      
      // Reset form and state
      setTimeout(() => {
        reset();
        setMediaFiles([]);
        setPreviewUrls([]);
        setShowSuccessMessage(false);
        setActiveTab('content');
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to schedule post');
      console.error('Error scheduling post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    const selectedPlatform = watch('platform') as SchedulePlatform;
    
    // Validate file types
    const invalidFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isGif = file.type === 'image/gif';
      
      if (isImage && !PLATFORM_MEDIA_SUPPORT[selectedPlatform].image) {
        return true;
      }
      if (isVideo && !PLATFORM_MEDIA_SUPPORT[selectedPlatform].video) {
        return true;
      }
      if (isGif && !PLATFORM_MEDIA_SUPPORT[selectedPlatform].gif) {
        return true;
      }
      
      return false;
    });
    
    if (invalidFiles.length > 0) {
      setError(`${selectedPlatform} doesn't support some of the selected file types`);
      return;
    }
    
    // Validate file sizes
    const oversizedFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const sizeInMB = file.size / (1024 * 1024);
      const maxSize = isImage 
        ? PLATFORM_MEDIA_SIZE_LIMITS[selectedPlatform].image 
        : PLATFORM_MEDIA_SIZE_LIMITS[selectedPlatform].video;
      
      return sizeInMB > maxSize;
    });
    
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the maximum size for ${selectedPlatform}`);
      return;
    }
    
    // Store files and create preview URLs
    setMediaFiles(files);
    
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeMedia = (index: number) => {
    const newFiles = [...mediaFiles];
    newFiles.splice(index, 1);
    setMediaFiles(newFiles);
    
    const newUrls = [...previewUrls];
    URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);
  };

  const uploadMedia = async (file: File): Promise<string> => {
    // In a real app, you would upload the file to your server or a cloud storage
    // For this example, we'll just return the object URL
    return URL.createObjectURL(file);
  };

  const generateAICaption = async () => {
    const platform = watch('platform');
    setIsGeneratingCaption(true);
    
    try {
      // Generate a description based on media if available
      let prompt = "Generate a social media post";
      
      if (mediaFiles.length > 0) {
        const fileTypes = mediaFiles.map(file => {
          if (file.type.startsWith('image/')) return 'image';
          if (file.type.startsWith('video/')) return 'video';
          return 'file';
        });
        
        prompt = `Generate a social media post about ${fileTypes.join(', ')}`;
      }
      
      const caption = await generateSocialMediaCaption(prompt, platform);
      setValue('content', caption);
    } catch (error) {
      setError('Failed to generate caption');
      console.error('Error generating caption:', error);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const generateHashtags = async () => {
    const content = watch('content');
    if (!content) {
      setError('Please add content first to generate relevant hashtags');
      return;
    }
    
    setIsGeneratingHashtags(true);
    
    try {
      const hashtags = await generateHashtagsWithDeepSeek(content, 5);
      setValue('hashtags', hashtags.join(' '));
    } catch (error) {
      setError('Failed to generate hashtags');
      console.error('Error generating hashtags:', error);
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setValue('scheduledTime', date || new Date());
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes);
      setValue('scheduledTime', newDate);
    }
  };

  // Get character limit for selected platform
  const getCharacterLimit = () => {
    return PLATFORM_LIMITS[selectedPlatform];
  };

  // Check if we're over character limit
  const isOverCharacterLimit = () => {
    return characterCount > getCharacterLimit();
  };

  // Generate time slots for easy selection
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Schedule New Post</CardTitle>
        <CardDescription>
          Create and schedule content for your social media platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccessMessage ? (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your post has been scheduled successfully.
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="mb-4 grid grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div>
                <Label className="text-base font-medium">Platform</Label>
                <Controller
                  name="platform"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(platforms).map(([platform, data]) => {
                          if (!data.enabled) return null;
                          
                          const Icon = platformIcons[platform] || MessageSquare;
                          
                          return (
                            <SelectItem key={platform} value={platform}>
                              <div className="flex items-center">
                                <Icon className="h-4 w-4 mr-2" />
                                <span className="capitalize">{platform}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.platform && (
                  <p className="mt-1 text-sm text-destructive">{errors.platform.message}</p>
                )}
              </div>
              
              <div>
                <div className="flex justify-between">
                  <Label className="text-base font-medium">Content</Label>
                  <div className={cn(
                    "text-xs",
                    isOverCharacterLimit() ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {characterCount}/{getCharacterLimit()}
                  </div>
                </div>
                <Textarea
                  {...register('content')}
                  rows={5}
                  className={cn(
                    "mt-1.5 resize-none",
                    errors.content ? "border-destructive" : "",
                    isOverCharacterLimit() ? "border-destructive" : ""
                  )}
                  placeholder={`What's on your mind? (${getCharacterLimit()} character limit)`}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
                )}
                {isOverCharacterLimit() && !errors.content && (
                  <p className="mt-1 text-sm text-destructive">
                    Content exceeds character limit for {selectedPlatform}
                  </p>
                )}
              </div>
              
              <div>
                <Label className="text-base font-medium">Hashtags</Label>
                <div className="relative">
                  <Textarea
                    {...register('hashtags')}
                    rows={2}
                    className="mt-1.5 resize-none"
                    placeholder="Add hashtags (optional)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={generateHashtags}
                    disabled={isGeneratingHashtags || !contentText}
                  >
                    {isGeneratingHashtags ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    Generate
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium">Media</Label>
                <div className="mt-1.5 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label
                      htmlFor="media-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {selectedPlatform && (
                            <>
                              Upload media (max: {PLATFORM_MEDIA_SIZE_LIMITS[selectedPlatform].image}MB image
                              /{PLATFORM_MEDIA_SIZE_LIMITS[selectedPlatform].video}MB video)
                            </>
                          )}
                        </span>
                      </div>
                      <input
                        id="media-upload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleMediaChange}
                        className="hidden"
                        multiple
                      />
                    </Label>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateAICaption}
                      disabled={isGeneratingCaption}
                    >
                      {isGeneratingCaption ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-1" />
                      )}
                      Generate Caption
                    </Button>
                  </div>
                  
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          {mediaFiles[idx]?.type.startsWith('image/') ? (
                            <img 
                              src={url} 
                              alt={`Preview ${idx}`} 
                              className="h-24 w-full object-cover rounded-md" 
                            />
                          ) : (
                            <video 
                              src={url}
                              className="h-24 w-full object-cover rounded-md"
                              controls
                            />
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeMedia(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  disabled={!contentText}
                >
                  Continue to Preview
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="rounded-lg border overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    {(() => {
                      const Icon = platformIcons[selectedPlatform] || MessageSquare;
                      return <Icon className="h-5 w-5 mr-2" />;
                    })()}
                    <span className="font-medium capitalize">{selectedPlatform} Preview</span>
                  </div>
                  <Badge variant="outline">Preview</Badge>
                </div>
                
                <div className="p-4">
                  <div className="mb-3 whitespace-pre-wrap">{contentText}</div>
                  
                  {hashtagsText && (
                    <div className="text-blue-600 mb-3">{hashtagsText}</div>
                  )}
                  
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {previewUrls.map((url, idx) => (
                        <div key={idx}>
                          {mediaFiles[idx]?.type.startsWith('image/') ? (
                            <img 
                              src={url} 
                              alt={`Preview ${idx}`} 
                              className="h-48 w-full object-cover rounded-md" 
                            />
                          ) : (
                            <video 
                              src={url}
                              className="h-48 w-full object-cover rounded-md"
                              controls
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('content')}
                >
                  Back to Content
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                >
                  Continue to Schedule
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-medium block mb-2">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label className="text-base font-medium block mb-2">Time</Label>
                  <Select value={selectedTime} onValueChange={handleTimeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeSlots().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-sm mb-2">Scheduling Summary</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Platform:</dt>
                    <dd className="capitalize font-medium">{selectedPlatform}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Date:</dt>
                    <dd className="font-medium">{selectedDate ? format(selectedDate, 'PPP') : '-'}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Time:</dt>
                    <dd className="font-medium">{selectedTime}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Media:</dt>
                    <dd className="font-medium">{mediaFiles.length} {mediaFiles.length === 1 ? 'file' : 'files'}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('preview')}
                >
                  Back to Preview
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || isOverCharacterLimit()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Schedule Post'
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  );
}