import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { useSocialStore } from '@/lib/store';
import { Loader2, Upload, Eye } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const scheduleSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platform: z.string(),
  scheduledTime: z.date(),
  media: z.array(z.string()).optional(),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

export function PostScheduler() {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const addPost = useSocialStore((state) => state.addPost);

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

      addPost({
        content: data.content,
        platform: data.platform,
        scheduledTime: scheduledTime.toISOString(),
        status: 'scheduled',
        mediaUrls,
      });
      reset();
      setMediaFiles([]);
      setPreviewUrl(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to schedule post');
      console.error('Error scheduling post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(files);
    
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
    }
  };

  const uploadMedia = async (file: File): Promise<string> => {
    // Implement your media upload logic here
    // This is a placeholder that should be replaced with actual upload functionality
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(file));
      }, 1000);
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Schedule New Post</h2>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Platform</label>
          <select
            {...register('platform')}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
              errors.platform ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="twitter">Twitter</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
          </select>
          {errors.platform && (
            <p className="mt-1 text-sm text-red-500">{errors.platform.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            {...register('content')}
            rows={4}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Write your post content..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Schedule Date & Time</label>
          <div className="grid grid-cols-2 gap-4 mt-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <div>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Media</label>
          <div className="mt-1 flex items-center space-x-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="hidden"
                multiple
              />
              <Button type="button" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
            </label>
            {previewUrl && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Media Preview</DialogTitle>
                  </DialogHeader>
                  <img src={previewUrl} alt="Preview" className="max-w-full h-auto" />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            'Schedule Post'
          )}
        </Button>
      </form>
    </div>
  );
}