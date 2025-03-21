import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Twitter, Instagram, Facebook, Linkedin, Edit, Trash2, Eye, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useSocialStore } from '@/lib/store';
import { platformIcons } from '@/lib/utils';

export const ContentCalendar: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostDetails, setShowPostDetails] = useState(false);
  
  const { scheduledPosts, removeScheduledPost } = useSocialStore();
  
  // Get posts for the selected date
  const postsForSelectedDate = date 
    ? scheduledPosts.filter(post => {
        const postDate = new Date(post.scheduledTime);
        return postDate.getDate() === date.getDate() &&
               postDate.getMonth() === date.getMonth() &&
               postDate.getFullYear() === date.getFullYear();
      })
    : [];
  
  // Get all upcoming posts
  const upcomingPosts = scheduledPosts.filter(post => {
    return new Date(post.scheduledTime) > new Date();
  }).sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  
  // Get past posts
  const pastPosts = scheduledPosts.filter(post => {
    return new Date(post.scheduledTime) <= new Date();
  }).sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
  
  // Format date from timestamp
  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM dd, yyyy hh:mm a');
  };
  
  // Get highlighted days for the calendar (days with posts)
  const highlightedDays = scheduledPosts.map(post => new Date(post.scheduledTime));
  
  const handlePostDelete = (postId: string) => {
    removeScheduledPost(postId);
    setShowPostDetails(false);
  };
  
  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setShowPostDetails(true);
  };
  
  const renderPlatformIcon = (platform: string) => {
    const Icon = platformIcons[platform] || Twitter;
    return <Icon className="h-4 w-4" />;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Content Calendar</CardTitle>
          <CardDescription>
            Schedule and manage your content across all platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    modifiers={{ highlighted: highlightedDays }}
                    modifiersStyles={{ highlighted: { fontWeight: 'bold', backgroundColor: '#ebf8ff' } }}
                  />
                  
                  {date && (
                    <div className="mt-4">
                      <h3 className="font-medium text-sm mb-2">
                        {format(date, 'MMMM dd, yyyy')}
                      </h3>
                      {postsForSelectedDate.length === 0 ? (
                        <p className="text-sm text-gray-500">No posts scheduled for this day</p>
                      ) : (
                        <div className="space-y-2">
                          {postsForSelectedDate.map((post, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => handlePostClick(post)}
                              className="p-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50"
                            >
                              <div className="flex justify-between items-center">
                                <span className="truncate flex-1">{post.content.slice(0, 30)}...</span>
                                <div className="flex gap-1">
                                  {post.platforms.map((plt, i) => (
                                    <div key={i} className="text-gray-500">
                                      {renderPlatformIcon(plt)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" /> {format(new Date(post.scheduledTime), 'hh:mm a')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Posts list */}
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past Posts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingPosts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No upcoming posts scheduled</p>
                  ) : (
                    upcomingPosts.map((post, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">{formatDate(post.scheduledTime)}</span>
                            </div>
                            <div className="flex gap-1">
                              {post.platforms.map((platform, i) => (
                                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                  {renderPlatformIcon(platform)}
                                  <span className="text-xs">{platform}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          {post.mediaUrls?.length > 0 && (
                            <div className="mt-2 flex gap-2 overflow-x-auto py-1">
                              {post.mediaUrls.map((url, i) => (
                                <img 
                                  key={i} 
                                  src={url} 
                                  alt="Post media" 
                                  className="h-16 w-16 rounded-md object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="border-t p-3 flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handlePostClick(post)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handlePostDelete(post.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="past" className="space-y-4">
                  {pastPosts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No past posts found</p>
                  ) : (
                    pastPosts.map((post, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">{formatDate(post.scheduledTime)}</span>
                            </div>
                            <div className="flex gap-1">
                              {post.platforms.map((platform, i) => (
                                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                  {renderPlatformIcon(platform)}
                                  <span className="text-xs">{platform}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          {post.mediaUrls?.length > 0 && (
                            <div className="mt-2 flex gap-2 overflow-x-auto py-1">
                              {post.mediaUrls.map((url, i) => (
                                <img 
                                  key={i} 
                                  src={url} 
                                  alt="Post media" 
                                  className="h-16 w-16 rounded-md object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="border-t p-3 flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handlePostClick(post)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Post Details Dialog */}
      {selectedPost && (
        <Dialog open={showPostDetails} onOpenChange={setShowPostDetails}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Post Details</DialogTitle>
              <DialogDescription>
                Scheduled for {formatDate(selectedPost.scheduledTime)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedPost.platforms.map((platform, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {renderPlatformIcon(platform)}
                    <span>{platform}</span>
                  </Badge>
                ))}
              </div>
              
              <div className="rounded-md border p-4">
                <p className="whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
              
              {selectedPost.mediaUrls?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Media</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPost.mediaUrls.map((url, i) => (
                      <img 
                        key={i} 
                        src={url} 
                        alt="Post media" 
                        className="rounded-md object-cover aspect-square"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2 sm:justify-between sm:gap-0">
              <Button 
                variant="destructive" 
                onClick={() => handlePostDelete(selectedPost.id)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Post
              </Button>
              <Button 
                onClick={() => setShowPostDetails(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}; 