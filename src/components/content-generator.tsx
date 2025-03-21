import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Platform, useSocialStore } from '@/lib/store';
import { generateContent } from '@/lib/ai';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const generatorSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  platform: z.string(),
  tone: z.enum(['professional', 'casual', 'friendly']),
  length: z.enum(['short', 'medium', 'long']),
});

type GeneratorForm = z.infer<typeof generatorSchema>;

export function ContentGenerator() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<GeneratorForm>({
    resolver: zodResolver(generatorSchema),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addPost = useSocialStore((state) => state.addPost);
  const platforms = useSocialStore((state) => state.platforms);
  const selectedPlatform = watch('platform');

  const onSubmit = async (data: GeneratorForm) => {
    setLoading(true);
    setError(null);
    try {
      const content = await generateContent(data);
      const bestTime = platforms[data.platform].bestTimes[0];
      const scheduledTime = new Date();
      scheduledTime.setHours(parseInt(bestTime.split(':')[0]), parseInt(bestTime.split(':')[1]));
      
      addPost({
        content,
        platform: data.platform,
        scheduledTime: scheduledTime.toISOString(),
        status: 'scheduled',
        aiGenerated: true,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate content');
      console.error('Error generating content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxLength = () => {
    switch (selectedPlatform) {
      case 'twitter':
        return 280;
      case 'linkedin':
        return 3000;
      case 'facebook':
        return 63206;
      default:
        return 1000;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Generate AI Content</h2>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Topic</label>
          <input
            {...register('topic')}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
              errors.topic ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your topic..."
          />
          {errors.topic && (
            <p className="mt-1 text-sm text-red-500">{errors.topic.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Platform</label>
          <select
            {...register('platform')}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
              errors.platform ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {Object.entries(platforms).map(([platform, data]) => (
              data.enabled && (
                <option key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </option>
              )
            ))}
          </select>
          {errors.platform && (
            <p className="mt-1 text-sm text-red-500">{errors.platform.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tone</label>
          <select
            {...register('tone')}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
              errors.tone ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
          </select>
          {errors.tone && (
            <p className="mt-1 text-sm text-red-500">{errors.tone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Length</label>
          <select
            {...register('length')}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
              errors.length ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
          {errors.length && (
            <p className="mt-1 text-sm text-red-500">{errors.length.message}</p>
          )}
        </div>

        <div className="text-sm text-gray-500">
          Maximum length for {selectedPlatform}: {getMaxLength()} characters
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Content'
          )}
        </Button>
      </form>
    </div>
  );
}