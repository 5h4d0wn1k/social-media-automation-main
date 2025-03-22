import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Platform, useSocialStore } from '@/lib/store';
import { callDeepSeekAPI, generateSocialMediaCaption } from '@/lib/api/deepseek';
import { Loader2, Sparkles, Shuffle, Clock, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Slider } from './ui/slider';

const generatorSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram', 'youtube', 'telegram', 'whatsapp', 'github']),
  tone: z.enum(['professional', 'casual', 'friendly', 'humorous', 'formal', 'inspirational']),
  length: z.enum(['short', 'medium', 'long']),
  contentType: z.enum(['post', 'thread', 'article', 'caption']),
  audience: z.string().optional(),
  keywords: z.string().optional(),
  includeHashtags: z.boolean().default(true),
  includeEmojis: z.boolean().default(true),
  creativity: z.number().min(0).max(100).default(70),
});

type GeneratorForm = z.infer<typeof generatorSchema>;

interface GenerateContentParams {
  topic: string;
  platform: Platform;
  tone: string;
  length: string;
  contentType: string;
  audience?: string;
  keywords?: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
  creativity: number;
}

export function ContentGenerator() {
  const [activeTab, setActiveTab] = useState('generator');
  const { register, handleSubmit, formState: { errors }, watch, control, setValue } = useForm<GeneratorForm>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      tone: 'professional',
      length: 'medium',
      contentType: 'post',
      includeHashtags: true, 
      includeEmojis: true,
      creativity: 70,
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const addPost = useSocialStore((state) => state.addPost);
  const platforms = useSocialStore((state) => state.platforms);

  const selectedPlatform = watch('platform') as Platform;
  const selectedTone = watch('tone');
  const selectedLength = watch('length');
  const selectedContentType = watch('contentType');
  const includeHashtags = watch('includeHashtags');
  const includeEmojis = watch('includeEmojis');
  const creativityLevel = watch('creativity');

  const generateContent = async (formData: GeneratorForm) => {
    try {
      const params: GenerateContentParams = {
        ...formData,
        platform: formData.platform as Platform,
      };
      
      const systemPrompt = `You are a professional social media content creator who specializes in creating engaging content for ${params.platform}. 
      Create content that is ${params.tone} in tone, ${params.length} in length, and follows best practices for ${params.platform}.`;
      
      let prompt = `Create a ${params.contentType} about "${params.topic}" for ${params.platform}`;
      
      if (params.audience) {
        prompt += ` targeting ${params.audience}`;
      }
      
      if (params.keywords) {
        prompt += `. Include the following keywords: ${params.keywords}`;
      }
      
      if (params.includeHashtags) {
        prompt += `. Include relevant hashtags`;
      }
      
      if (params.includeEmojis) {
        prompt += `. Include appropriate emojis`;
      }
      
      prompt += `. The content should be ${params.tone} in tone and ${params.length} in length.`;
      
      const temperature = params.creativity / 100; // Convert 0-100 scale to 0-1
      
      const result = await callDeepSeekAPI(prompt, systemPrompt, temperature);
      return result;
    } catch (error) {
      console.error("Error in generateContent:", error);
      throw error;
    }
  };

  const onSubmit = async (data: GeneratorForm) => {
    setLoading(true);
    setError(null);
    try {
      const content = await generateContent(data);
      setGeneratedContent(content);
      setVariations([]);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate content');
      console.error('Error generating content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseContent = () => {
    if (!generatedContent || !selectedPlatform) return;
    
    try {
      // Find the best posting time for the selected platform
      const platformData = platforms[selectedPlatform];
      if (!platformData?.bestTimes?.length) {
        throw new Error(`No best times configured for ${selectedPlatform}`);
      }
      
      const bestTime = platformData.bestTimes[0];
      const scheduledTime = new Date();
      scheduledTime.setHours(parseInt(bestTime.split(':')[0]), parseInt(bestTime.split(':')[1]));
      
      addPost({
        content: generatedContent,
        platform: selectedPlatform,
        scheduledTime: scheduledTime.toISOString(),
        status: 'scheduled',
        aiGenerated: true,
      });
      
      // Clear the generated content after scheduling
      setGeneratedContent(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to schedule content');
      console.error('Error scheduling content:', error);
    }
  };

  const generateVariations = async () => {
    if (!generatedContent) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = watch();
      // Generate 3 variations
      const promises = [1, 2, 3].map(() => generateContent(formData));
      const results = await Promise.all(promises);
      setVariations(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate variations');
      console.error('Error generating variations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectVariation = (content: string) => {
    setGeneratedContent(content);
  };

  const getMaxLength = () => {
    switch (selectedPlatform) {
      case 'twitter':
        return 280;
      case 'linkedin':
        return 3000;
      case 'facebook':
        return 63206;
      case 'instagram':
        return 2200;
      case 'telegram':
        return 4096;
      case 'whatsapp':
        return 65536;
      default:
        return 1000;
    }
  };

  const getToneDescription = () => {
    switch (selectedTone) {
      case 'professional': return 'Business-oriented and formal';
      case 'casual': return 'Relaxed and conversational';
      case 'friendly': return 'Warm and approachable';
      case 'humorous': return 'Funny and entertaining';
      case 'formal': return 'Serious and structured';
      case 'inspirational': return 'Motivational and uplifting';
      default: return '';
    }
  };

  const getLengthDescription = () => {
    switch (selectedLength) {
      case 'short': return `Brief content (< ${getMaxLength() / 4} chars)`;
      case 'medium': return `Standard length (< ${getMaxLength() / 2} chars)`;
      case 'long': return `Detailed content (< ${getMaxLength()} chars)`;
      default: return '';
    }
  };

  const getContentTypeDescription = () => {
    switch (selectedContentType) {
      case 'post': return 'Single social media post';
      case 'thread': return 'Series of connected posts';
      case 'article': return 'Longer form content';
      case 'caption': return 'Image description for social media';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="generator">
            <Sparkles className="h-4 w-4 mr-2" />
            Content Generator
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Generated History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Content Generator</CardTitle>
              <CardDescription>
                Generate engaging social media content with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Topic or Prompt</Label>
                    <Textarea
                      id="topic"
                      placeholder="What would you like to create content about?"
                      className={errors.topic ? 'border-red-500' : ''}
                      {...register('topic')}
                    />
                    {errors.topic && (
                      <p className="mt-1 text-sm text-red-500">{errors.topic.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="platform">Platform</Label>
                      <Select 
                        defaultValue="twitter" 
                        onValueChange={(value: string) => setValue('platform', value as Platform)}
                      >
                        <SelectTrigger className={errors.platform ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(platforms).map(([platform, data]) => (
                            data.enabled && (
                              <SelectItem key={platform} value={platform}>
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                              </SelectItem>
                            )
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.platform && (
                        <p className="mt-1 text-sm text-red-500">{errors.platform.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="contentType">Content Type</Label>
                      <Select 
                        defaultValue="post" 
                        onValueChange={(value: string) => setValue('contentType', value as any)}
                      >
                        <SelectTrigger className={errors.contentType ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="post">Post</SelectItem>
                          <SelectItem value="thread">Thread</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="caption">Caption</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.contentType && (
                        <p className="mt-1 text-sm text-red-500">{errors.contentType.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">{getContentTypeDescription()}</p>
                    </div>

                    <div>
                      <Label htmlFor="tone">Tone</Label>
                      <Select 
                        defaultValue="professional" 
                        onValueChange={(value: string) => setValue('tone', value as any)}
                      >
                        <SelectTrigger className={errors.tone ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="humorous">Humorous</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="inspirational">Inspirational</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.tone && (
                        <p className="mt-1 text-sm text-red-500">{errors.tone.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">{getToneDescription()}</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="length">Length</Label>
                      <Select 
                        defaultValue="medium" 
                        onValueChange={(value: string) => setValue('length', value as any)}
                      >
                        <SelectTrigger className={errors.length ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.length && (
                        <p className="mt-1 text-sm text-red-500">{errors.length.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">{getLengthDescription()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="audience">Target Audience (Optional)</Label>
                    <Input
                      id="audience"
                      placeholder="E.g., Marketing professionals, Tech enthusiasts, etc."
                      {...register('audience')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="keywords">Key Phrases (Optional)</Label>
                    <Input
                      id="keywords"
                      placeholder="Enter comma-separated keywords to include"
                      {...register('keywords')}
                    />
                    <p className="mt-1 text-xs text-gray-500">These will be incorporated into the generated content</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="includeHashtags"
                        checked={includeHashtags}
                        onCheckedChange={(checked) => setValue('includeHashtags', checked)}
                      />
                      <Label htmlFor="includeHashtags">Include Hashtags</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="includeEmojis"
                        checked={includeEmojis}
                        onCheckedChange={(checked) => setValue('includeEmojis', checked)}
                      />
                      <Label htmlFor="includeEmojis">Include Emojis</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="creativity">Creativity Level</Label>
                      <span className="text-sm text-gray-500">{creativityLevel}%</span>
                    </div>
                    <Slider
                      id="creativity"
                      min={0}
                      max={100}
                      step={5}
                      value={[creativityLevel]}
                      onValueChange={(value) => setValue('creativity', value[0])}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Factual</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Maximum length for {selectedPlatform}: {getMaxLength()} characters
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {generatedContent && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  Generated for {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap mb-4">
                  {generatedContent}
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  Character count: {generatedContent.length} / {getMaxLength()}
                  {generatedContent.length > getMaxLength() && (
                    <span className="text-red-500 ml-1">
                      (exceeds maximum length by {generatedContent.length - getMaxLength()})
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleUseContent} disabled={loading}>
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule Post
                  </Button>
                  <Button variant="outline" onClick={generateVariations} disabled={loading}>
                    <Shuffle className="mr-2 h-4 w-4" />
                    Generate Variations
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {variations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Content Variations</CardTitle>
                <CardDescription>
                  Choose a variation to use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {variations.map((variation, index) => (
                    <div key={index} className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer" onClick={() => selectVariation(variation)}>
                      <div className="mb-2 flex justify-between items-center">
                        <Badge>Variation {index + 1}</Badge>
                        <Button size="sm" variant="ghost" onClick={(e) => {
                          e.stopPropagation();
                          selectVariation(variation);
                        }}>
                          Select
                        </Button>
                      </div>
                      <div className="whitespace-pre-wrap text-sm">
                        {variation.length > 200 ? variation.substring(0, 200) + '...' : variation}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Generated Content History</CardTitle>
              <CardDescription>
                View and reuse previously generated content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Generated content history will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}