import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { useSocialStore, Platform, Post } from '@/lib/store';
import { format, parseISO, addDays } from 'date-fns';
import { 
  Clock, 
  Settings, 
  Calendar, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  Plus,
  Clock8,
  FileText,
  Trash2,
  Edit,
  ArrowRight,
  PlusCircle,
  BarChart,
  Rss
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { initializeScheduler } from '@/lib/services/scheduler';

export function AutomationManager() {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [schedulerActive, setSchedulerActive] = useState(true);
  const [schedulerLastRun, setSchedulerLastRun] = useState<Date | null>(null);
  const [schedulingTimes, setSchedulingTimes] = useState<Record<Platform, string[]>>({
    twitter: ['09:00', '12:00', '17:00'],
    facebook: ['10:00', '14:00', '19:00'],
    instagram: ['11:00', '15:00', '20:00'],
    linkedin: ['09:00', '13:00', '16:00'],
    youtube: ['12:00', '18:00', '20:00'],
    telegram: ['10:00', '15:00', '19:00'],
    whatsapp: ['09:00', '14:00', '18:00'],
    github: ['10:00', '14:00', '17:00'],
  });
  
  // Get store data
  const posts = useSocialStore(state => state.posts);
  const platforms = useSocialStore(state => state.platforms);
  const rssFeeds = useSocialStore(state => state.rssFeeds);
  const lastScheduledDate = useSocialStore(state => state.lastScheduledDate);
  
  // Count posts by status
  const scheduledPosts = posts.filter(post => post.status === 'scheduled');
  const publishedPosts = posts.filter(post => post.status === 'published');
  const failedPosts = posts.filter(post => post.status === 'failed');
  
  // Auto-posting configuration
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('twitter');
  const [selectedTime, setSelectedTime] = useState('09:00');
  
  // Initialize scheduler on mount
  useEffect(() => {
    const scheduler = initializeScheduler();
    
    // Set initial state based on actual scheduler status
    setSchedulerLastRun(lastScheduledDate ? new Date(lastScheduledDate) : null);
    
    return () => {
      if (typeof scheduler.stop === 'function') {
        scheduler.stop();
      }
    };
  }, [lastScheduledDate]);
  
  // Helper functions
  const toggleScheduler = () => {
    setSchedulerActive(!schedulerActive);
    // In a real implementation, you would start/stop the scheduler service
    console.log(`Scheduler ${!schedulerActive ? 'started' : 'stopped'}`);
  };
  
  const addSchedulingTime = () => {
    if (selectedTime) {
      setSchedulingTimes(prev => ({
        ...prev,
        [selectedPlatform]: [...prev[selectedPlatform], selectedTime].sort()
      }));
    }
  };
  
  const removeSchedulingTime = (platform: Platform, time: string) => {
    setSchedulingTimes(prev => ({
      ...prev,
      [platform]: prev[platform].filter(t => t !== time)
    }));
  };
  
  const getStatusBadge = (status: 'active' | 'paused' | 'error') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'paused':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Paused</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
    }
  };
  
  // Get upcoming posts for the next 7 days
  const getUpcomingPosts = () => {
    const now = new Date();
    const nextWeek = addDays(now, 7);
    
    return scheduledPosts
      .filter(post => {
        const postDate = new Date(post.scheduledTime);
        return postDate >= now && postDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  };
  
  const upcomingPosts = getUpcomingPosts();
  
  // Format date for display
  const formatScheduleTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Automation Manager</h1>
          <p className="text-muted-foreground">Manage your automatic content posting and scheduling</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Auto Scheduler</span>
            <Switch 
              checked={schedulerActive} 
              onCheckedChange={toggleScheduler} 
            />
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Now
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Posts</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="settings">Scheduler Settings</TabsTrigger>
          <TabsTrigger value="logs">Activity Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scheduler Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-2xl">
                    {schedulerActive ? 'Active' : 'Paused'}
                  </div>
                  {schedulerActive ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                {schedulerLastRun && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last run: {format(schedulerLastRun, 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-semibold text-2xl">{scheduledPosts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Pending publication</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-semibold text-2xl">{publishedPosts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Successfully published</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Failed Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-semibold text-2xl">{failedPosts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {failedPosts.length === 0 ? 'No failures' : 'Requires attention'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Posts</CardTitle>
                <CardDescription>Posts scheduled for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingPosts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No upcoming posts scheduled</p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule a Post
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingPosts.slice(0, 5).map(post => (
                      <div key={post.id} className="flex items-start p-3 border rounded-md">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="capitalize">
                              {post.platform}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatScheduleTime(post.scheduledTime)}
                            </span>
                          </div>
                          <p className="text-sm truncate">{post.content.substring(0, 60)}...</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {upcomingPosts.length > 5 && (
                      <Button variant="ghost" className="w-full text-sm">
                        View all {upcomingPosts.length} upcoming posts
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>RSS Feed Status</CardTitle>
                <CardDescription>Content sources</CardDescription>
              </CardHeader>
              <CardContent>
                {rssFeeds.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No RSS feeds configured</p>
                    <Button variant="outline" className="mt-4" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add RSS Feed
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rssFeeds.map(feed => (
                      <div key={feed.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <Rss className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{feed.name}</p>
                            <p className="text-xs text-muted-foreground">Last check: 30m ago</p>
                          </div>
                        </div>
                        {getStatusBadge('active')}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Platform Scheduling Times</CardTitle>
              <CardDescription>When content is posted to each platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(schedulingTimes).map(([platform, times]) => {
                  // Skip disabled platforms
                  if (platforms && !platforms[platform as Platform]?.enabled) {
                    return null;
                  }
                  
                  return (
                    <div key={platform} className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {platform}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {times.length} times
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {times.map(time => (
                          <div 
                            key={`${platform}-${time}`} 
                            className="flex items-center bg-muted text-xs rounded px-2 py-1"
                          >
                            <Clock8 className="h-3 w-3 mr-1" />
                            {time}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1"
                              onClick={() => removeSchedulingTime(platform as Platform, time)}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex gap-2 flex-1">
                <Select
                  value={selectedPlatform}
                  onValueChange={(value) => setSelectedPlatform(value as Platform)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(platforms || {}).map(([platform, data]) => {
                      if (!data.enabled) return null;
                      return (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-[120px]"
                />
              </div>
              <Button onClick={addSchedulingTime}>
                <Plus className="h-4 w-4 mr-2" />
                Add Time
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Scheduled Posts</CardTitle>
              <CardDescription>View and manage all pending content</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg mb-2">No scheduled posts</p>
                  <p className="max-w-md mx-auto mb-6">
                    You don't have any posts scheduled for automatic publishing.
                    Create new content or set up RSS automation to fill your schedule.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Setup RSS Automation
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-4 py-2 px-4 font-medium text-sm">
                    <div className="col-span-5">Content</div>
                    <div className="col-span-2">Platform</div>
                    <div className="col-span-3">Scheduled For</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  
                  <Separator />
                  
                  {/* Table rows */}
                  {scheduledPosts.map(post => (
                    <div key={post.id} className="grid grid-cols-12 gap-4 py-3 px-4 hover:bg-accent/50 rounded-md">
                      <div className="col-span-5 truncate">{post.content.substring(0, 80)}...</div>
                      <div className="col-span-2">
                        <Badge variant="outline" className="capitalize">
                          {post.platform}
                        </Badge>
                      </div>
                      <div className="col-span-3">
                        {formatScheduleTime(post.scheduledTime)}
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>Set up rules for automated content posting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-accent/30 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">What are automation rules?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Automation rules let you define conditions and actions for automated post scheduling. 
                    For example, you can automatically repost popular content or schedule RSS feed content 
                    to specific platforms at optimal times.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Rule
                  </Button>
                </div>

                <div className="border rounded-md">
                  <div className="p-4 flex items-center justify-between bg-card">
                    <div>
                      <h4 className="font-medium">RSS to Twitter Rule</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically posts new content from tech blogs to Twitter
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <Separator />
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-1">When</h5>
                      <p>New article from Tech Daily RSS feed</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Then</h5>
                      <p>Create and schedule Twitter post</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Schedule</h5>
                      <p>Next available time slot for Twitter</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md">
                  <div className="p-4 flex items-center justify-between bg-card">
                    <div>
                      <h4 className="font-medium">LinkedIn and Twitter Cross-post</h4>
                      <p className="text-sm text-muted-foreground">
                        Shares LinkedIn posts to Twitter with link
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <Separator />
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-1">When</h5>
                      <p>New LinkedIn post created</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Then</h5>
                      <p>Create Twitter post with link to LinkedIn content</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Schedule</h5>
                      <p>3 hours after LinkedIn post</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <Button className="w-full py-6 border-dashed">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Another Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduler Settings</CardTitle>
              <CardDescription>Configure how the automation system works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-base">Scheduler Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable all automated posting
                    </p>
                  </div>
                  <Switch checked={schedulerActive} onCheckedChange={toggleScheduler} />
                </div>
                <Separator />
              </div>
              
              <div className="space-y-4">
                <Label>Scheduling Preferences</Label>
                
                <div className="flex justify-between items-center pl-4">
                  <div>
                    <p className="text-sm">Respect platform's best times</p>
                    <p className="text-xs text-muted-foreground">
                      Optimize posting times based on platform analytics
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex justify-between items-center pl-4">
                  <div>
                    <p className="text-sm">Auto-retry failed posts</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically retry posting if initial attempt fails
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex justify-between items-center pl-4">
                  <div>
                    <p className="text-sm">Send email notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Receive email alerts for important automation events
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>Content Settings</Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm" htmlFor="max-daily">
                      Maximum daily posts per platform
                    </Label>
                    <Input id="max-daily" type="number" defaultValue={5} />
                  </div>
                  <div>
                    <Label className="text-sm" htmlFor="min-interval">
                      Minimum time between posts (hours)
                    </Label>
                    <Input id="min-interval" type="number" defaultValue={2} />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Logs</CardTitle>
              <CardDescription>Activity history of the automation system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">All Events</Button>
                    <Button variant="ghost" size="sm">Posts</Button>
                    <Button variant="ghost" size="sm">Rules</Button>
                    <Button variant="ghost" size="sm">Errors</Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <div className="border rounded-md divide-y">
                  <div className="p-3 flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-top">
                        <p className="text-sm font-medium">Post published successfully</p>
                        <span className="text-xs text-muted-foreground">20 minutes ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Twitter post scheduled for 2:00 PM was published successfully
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-top">
                        <p className="text-sm font-medium">New post scheduled</p>
                        <span className="text-xs text-muted-foreground">1 hour ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        LinkedIn post scheduled for tomorrow at 9:00 AM
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-top">
                        <p className="text-sm font-medium">RSS feeds checked</p>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        3 feeds checked, 2 new articles found and queued
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-top">
                        <p className="text-sm font-medium">Post failed to publish</p>
                        <span className="text-xs text-muted-foreground">Yesterday</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Instagram post failed due to API error: rate limit exceeded
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button variant="ghost" size="sm">
                    Load More Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 