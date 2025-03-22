import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Twitter, Instagram, Facebook, Linkedin, Edit, Trash2, Eye, 
  Calendar as CalendarIcon, Clock, Plus, CheckCircle, AlertCircle, 
  Loader, Menu
} from 'lucide-react';
import { format } from 'date-fns';
import { useSocialStore, Post, Platform, PostStatus } from '@/lib/store';
import { platformIcons, cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Extended post type to handle campaign posts that may have 'platforms' property
interface ExtendedPost extends Post {
  platforms?: Platform[];
}

export const ContentCalendar: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedPost, setSelectedPost] = useState<ExtendedPost | null>(null);
  const [showPostDetails, setShowPostDetails] = useState(false);
  
  const posts = useSocialStore((state) => state.posts);
  const removePost = useSocialStore((state) => state.removePost);
  const updatePostStatus = useSocialStore((state) => state.updatePostStatus);
  
  // Convert single platform to array for consistent handling
  const getPostPlatforms = (post: ExtendedPost): Platform[] => {
    if (post.platforms && post.platforms.length > 0) {
      return post.platforms;
    }
    return [post.platform];
  };
  
  // Get posts for the selected date
  const postsForSelectedDate = date 
    ? posts.filter(post => {
        const postDate = new Date(post.scheduledTime);
        return postDate.getDate() === date.getDate() &&
               postDate.getMonth() === date.getMonth() &&
               postDate.getFullYear() === date.getFullYear();
      }) as ExtendedPost[]
    : [];
  
  // Get all upcoming posts
  const upcomingPosts = posts.filter(post => {
    return new Date(post.scheduledTime) > new Date();
  }).sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()) as ExtendedPost[];
  
  // Get past posts
  const pastPosts = posts.filter(post => {
    return new Date(post.scheduledTime) <= new Date();
  }).sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()) as ExtendedPost[];
  
  // Format date from timestamp
  const formatDate = (timestamp: string): string => {
    return format(new Date(timestamp), 'MMM dd, yyyy hh:mm a');
  };
  
  // Get highlighted days for the calendar (days with posts)
  const highlightedDays = posts.map(post => new Date(post.scheduledTime));
  
  const handlePostDelete = (postId: string): void => {
    removePost(postId);
    setShowPostDetails(false);
  };
  
  const handlePostClick = (post: ExtendedPost): void => {
    setSelectedPost(post);
    setShowPostDetails(true);
  };
  
  const handleStatusChange = (postId: string, status: PostStatus): void => {
    updatePostStatus(postId, status);
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({...selectedPost, status});
    }
  };
  
  const renderPlatformIcon = (platform: Platform): React.ReactNode => {
    const Icon = platformIcons[platform] || Twitter;
    return <Icon className="h-4 w-4" />;
  };
  
  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Published</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Scheduled</span>
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Edit className="h-3 w-3" />
            <span>Draft</span>
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const handleCreatePost = () => {
    // This would normally open the post creator
    // For now, we'll just log a message
    console.log("Open post creator");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>
                Schedule and manage your content across all platforms
              </CardDescription>
            </div>
            <Button onClick={handleCreatePost}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
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
                        <p className="text-sm text-muted-foreground">No posts scheduled for this day</p>
                      ) : (
                        <div className="space-y-2">
                          {postsForSelectedDate.map((post, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => handlePostClick(post)}
                              className="p-2 border rounded-md text-sm cursor-pointer hover:bg-muted/50"
                            >
                              <div className="flex justify-between items-center">
                                <span className="truncate flex-1">{post.content.slice(0, 30)}...</span>
                                <div className="flex gap-1">
                                  {getPostPlatforms(post).map((platform, i) => (
                                    <div key={i} className="text-muted-foreground">
                                      {renderPlatformIcon(platform)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" /> {format(new Date(post.scheduledTime), 'hh:mm a')}
                                </div>
                                <div className="mt-1">
                                  {getStatusBadge(post.status)}
                                </div>
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
                    <div className="text-center py-8 space-y-4">
                      <p className="text-muted-foreground">No upcoming posts scheduled</p>
                      <Button onClick={handleCreatePost}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Post
                      </Button>
                    </div>
                  ) : (
                    upcomingPosts.map((post, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{formatDate(post.scheduledTime)}</span>
                            </div>
                            <div className="flex gap-1">
                              {getPostPlatforms(post).map((platform, i) => (
                                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                  {renderPlatformIcon(platform)}
                                  <span className="text-xs">{platform}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          {post.mediaUrls && post.mediaUrls.length > 0 && (
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
                          {post.imageUrl && (
                            <div className="mt-2 flex gap-2 overflow-x-auto py-1">
                              <img 
                                src={post.imageUrl} 
                                alt="Post media" 
                                className="h-16 w-16 rounded-md object-cover"
                              />
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            {getStatusBadge(post.status)}
                            {post.sourceUrl && (
                              <span className="text-xs text-muted-foreground">
                                from RSS feed
                              </span>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t p-3 flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handlePostClick(post)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Menu className="h-4 w-4 mr-1" /> Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Manage Post</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'published')}>
                                <CheckCircle className="h-4 w-4 mr-2" /> Mark as Published
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'failed')}>
                                <AlertCircle className="h-4 w-4 mr-2" /> Mark as Failed
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive" 
                                onClick={() => handlePostDelete(post.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="past" className="space-y-4">
                  {pastPosts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No past posts found</p>
                  ) : (
                    pastPosts.map((post, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{formatDate(post.scheduledTime)}</span>
                            </div>
                            <div className="flex gap-1">
                              {getPostPlatforms(post).map((platform, i) => (
                                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                  {renderPlatformIcon(platform)}
                                  <span className="text-xs">{platform}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          {post.mediaUrls && post.mediaUrls.length > 0 && (
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
                          {post.imageUrl && (
                            <div className="mt-2 flex gap-2 overflow-x-auto py-1">
                              <img 
                                src={post.imageUrl} 
                                alt="Post media" 
                                className="h-16 w-16 rounded-md object-cover"
                              />
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            {getStatusBadge(post.status)}
                            {post.aiGenerated && (
                              <Badge variant="secondary" className="text-xs">AI Generated</Badge>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t p-3 flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handlePostClick(post)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          {post.status !== 'published' && (
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handlePostDelete(post.id)}>
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          )}
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
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {getPostPlatforms(selectedPost).map((platform, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1">
                      {renderPlatformIcon(platform)}
                      <span>{platform}</span>
                    </Badge>
                  ))}
                </div>
                <Badge 
                  variant={selectedPost.status === 'published' ? 'success' : 
                          selectedPost.status === 'failed' ? 'destructive' : 
                          'outline'} 
                  className="capitalize"
                >
                  {selectedPost.status}
                </Badge>
              </div>
              
              <div className="rounded-md border p-4">
                <p className="whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
              
              {(selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 || selectedPost.imageUrl) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Media</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPost.mediaUrls && selectedPost.mediaUrls.map((url, i) => (
                      <img 
                        key={i} 
                        src={url} 
                        alt="Post media" 
                        className="rounded-md object-cover aspect-square"
                      />
                    ))}
                    {selectedPost.imageUrl && (
                      <img 
                        src={selectedPost.imageUrl} 
                        alt="Post media" 
                        className="rounded-md object-cover aspect-square"
                      />
                    )}
                  </div>
                </div>
              )}
              
              {selectedPost.sourceUrl && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Source</h4>
                  <a 
                    href={selectedPost.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {selectedPost.sourceUrl}
                  </a>
                </div>
              )}
              
              {selectedPost.campaignId && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Campaign</h4>
                  <Badge variant="outline">
                    ID: {selectedPost.campaignId}
                  </Badge>
                </div>
              )}
              
              {selectedPost.aiGenerated && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">AI Generated</h4>
                  <p className="text-xs text-muted-foreground">
                    This content was generated using AI assistance
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2 sm:justify-between sm:gap-0">
              {selectedPost.status !== 'published' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusChange(selectedPost.id, 'published')}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Published
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handlePostDelete(selectedPost.id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Post
                  </Button>
                </div>
              )}
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