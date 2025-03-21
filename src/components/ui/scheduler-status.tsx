import React from 'react';
import { useEffect, useState } from 'react';
import { useSocialStore } from '@/lib/store';
import { format } from 'date-fns';
import { Badge } from './badge';
import { Clock, ArrowUpCircle, AlertCircle, Check, Loader2 } from 'lucide-react';

export function SchedulerStatus() {
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Automatic Posting Status</h3>
      
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
        
        {nextPost && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Next Post:</h4>
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
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">Auto-refreshes every minute</span>
          <div className="animate-pulse">
            <Loader2 className="h-3 w-3 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
} 