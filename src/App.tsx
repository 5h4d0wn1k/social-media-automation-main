import React, { useEffect } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from '@vercel/analytics/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { PostScheduler } from './components/post-scheduler';
import { ContentGenerator } from './components/content-generator';
import { RssFeedManager } from './components/rss-feed-manager';
import { AnalyticsDashboard } from './components/analytics-dashboard';
import { PostCreator } from './components/post-creator';
import { HashtagManager } from './components/hashtag-manager';
import { SchedulerStatus } from './components/ui/scheduler-status';
import { Logo } from './components/ui/logo';
import {
  Calendar,
  Clock,
  Instagram,
  Linkedin,
  MessageSquare,
  Settings,
  Twitter,
  Facebook,
  Youtube,
  MessageCircle,
  MessagesSquare,
  Github,
  Rss,
  Sparkles,
  BarChart,
  BarChart3,
  FileText,
  CalendarDays,
  Hash,
  ListOrdered,
  Megaphone,
  Webhook,
  HelpCircle,
  Send
} from 'lucide-react';
import { useSocialStore } from './lib/store';
import { setupAutomatedPosts } from './lib/browser-cron';
import { initializeScheduler } from './lib/services/scheduler';
import { env } from './lib/env';
import { ContentCalendar } from './components/content-calendar';
import { SocialMediaGuide } from './components/social-media-guide';

const queryClient = new QueryClient();

// Initialize automated posts
setupAutomatedPosts();

// Add RiteKit API key to the environment
if (!env.RITEKIT_API_KEY) {
  env.RITEKIT_API_KEY = 'demo'; // Use demo key by default
}

interface PlatformData {
  name: string;
  enabled: boolean;
  // ... existing properties ...
}

function Dashboard() {
  const posts = useSocialStore((state) => state.posts);
  const platforms = useSocialStore((state) => state.platforms);
  const [activeTab, setActiveTab] = React.useState("analytics");

  useEffect(() => {
    // Initialize the auto-posting scheduler
    const scheduler = initializeScheduler();
    
    // Clean up when component unmounts
    return () => {
      scheduler.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 mb-1 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-800 mt-2 text-center">Shadownik</h1><Logo className="h-6 w-6" />
        </div>
        
        <div className="px-4 py-3">
          <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Platforms
          </h2>
          <div className="mt-1 space-y-0.5">
            {Object.entries(platforms).map(([platform, data]) => (
              <a
                key={platform}
                href="#"
                className="group flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {platform === 'twitter' && <Twitter className="h-4 w-4 mr-2 text-blue-400" />}
                {platform === 'linkedin' && <Linkedin className="h-4 w-4 mr-2 text-blue-600" />}
                {platform === 'facebook' && <Facebook className="h-4 w-4 mr-2 text-blue-600" />}
                {platform === 'instagram' && <Instagram className="h-4 w-4 mr-2 text-pink-600" />}
                {platform === 'youtube' && <Youtube className="h-4 w-4 mr-2 text-red-600" />}
                {platform === 'telegram' && <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />}
                {platform === 'whatsapp' && <MessagesSquare className="h-4 w-4 mr-2 text-green-500" />}
                {platform === 'github' && <Github className="h-4 w-4 mr-2 text-gray-900" />}
                <span className="truncate capitalize">{platform}</span>
                {data.enabled && (
                  <span className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
                )}
              </a>
            ))}
          </div>
        </div>
        
        <div className="mt-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          <div className="px-4 py-3">
            <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Dashboard
            </h2>
            <div className="space-y-1">
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              
              <Button
                variant={activeTab === "content" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("content")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Content
              </Button>
              
              <Button
                variant={activeTab === "create-post" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("create-post")}
              >
                <Send className="h-4 w-4 mr-2" />
                Create Post
              </Button>
              
              <Button
                variant={activeTab === "scheduler" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("scheduler")}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              
              <Button
                variant={activeTab === "hashtags" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("hashtags")}
              >
                <Hash className="h-4 w-4 mr-2" />
                Hashtags
              </Button>
              
              <Button
                variant={activeTab === "calendar" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("calendar")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </div>
          </div>
          
          <div className="px-4 py-3 mt-1">
            <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Advanced
            </h2>
            <div className="space-y-1">
              <Button
                variant={activeTab === "queue" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("queue")}
              >
                <ListOrdered className="h-4 w-4 mr-2" />
                Queue
              </Button>
              
              <Button
                variant={activeTab === "rss" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("rss")}
              >
                <Rss className="h-4 w-4 mr-2" />
                RSS Feeds
              </Button>
              
              <Button
                variant={activeTab === "ai" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("ai")}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generator
              </Button>
              
              <Button
                variant={activeTab === "campaigns" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("campaigns")}
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Campaigns
              </Button>
              
              <Button
                variant={activeTab === "automation" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("automation")}
              >
                <Webhook className="h-4 w-4 mr-2" />
                Automation
              </Button>
            </div>
          </div>
          
          <div className="px-4 py-3 mt-1">
            <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              System
            </h2>
            <div className="space-y-1">
              <Button
                variant={activeTab === "settings" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-9"
                onClick={() => console.log('Help clicked')}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & Support
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4 mt-auto border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">S</div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-700">Shadownik</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto p-0 h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="create-post">Create Post</TabsTrigger>
              <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
              <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="guide">Content Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-8">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="content" className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <ContentGenerator />
                <RssFeedManager />
              </div>
            </TabsContent>

            <TabsContent value="create-post" className="space-y-8">
              <PostCreator />
            </TabsContent>

            <TabsContent value="scheduler" className="space-y-8">
              <PostScheduler />
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">Scheduled Posts</h2>
                <div className="mt-6 space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {post.platform === 'twitter' && <Twitter className="h-4 w-4 text-blue-400" />}
                          {post.platform === 'linkedin' && <Linkedin className="h-4 w-4 text-blue-600" />}
                          {post.platform === 'facebook' && <Facebook className="h-4 w-4 text-blue-600" />}
                          {post.platform === 'instagram' && <Instagram className="h-4 w-4 text-pink-600" />}
                          {post.platform === 'youtube' && <Youtube className="h-4 w-4 text-red-600" />}
                          {post.platform === 'telegram' && <MessageCircle className="h-4 w-4 text-blue-500" />}
                          {post.platform === 'whatsapp' && <MessagesSquare className="h-4 w-4 text-green-500" />}
                          {post.platform === 'github' && <Github className="h-4 w-4 text-gray-900" />}
                          <span className="text-sm font-medium text-gray-900 capitalize">{post.platform} Post</span>
                          {post.aiGenerated && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Generated
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{post.content}</p>
                        {post.imageUrl && (
                          <img src={post.imageUrl} alt="" className="mt-2 rounded-lg w-full max-w-md h-40 object-cover" />
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Scheduled for {new Date(post.scheduledTime).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hashtags" className="space-y-8">
              <HashtagManager />
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-8">
              <ContentCalendar />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Account Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="shadownik" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="contact@shadownik.com" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">API Configuration</h3>
                    <div className="space-y-4">
                      {Object.entries(platforms).map(([platform, data]) => (
                        <div key={platform} className="flex items-center gap-3 p-3 border border-gray-200 rounded-md">
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                            {platform === 'twitter' && <Twitter className="h-4 w-4 text-blue-400" />}
                            {platform === 'linkedin' && <Linkedin className="h-4 w-4 text-blue-600" />}
                            {platform === 'facebook' && <Facebook className="h-4 w-4 text-blue-600" />}
                            {platform === 'instagram' && <Instagram className="h-4 w-4 text-pink-600" />}
                            {platform === 'youtube' && <Youtube className="h-4 w-4 text-red-600" />}
                            {platform === 'telegram' && <MessageCircle className="h-4 w-4 text-blue-500" />}
                            {platform === 'whatsapp' && <MessagesSquare className="h-4 w-4 text-green-500" />}
                            {platform === 'github' && <Github className="h-4 w-4 text-gray-900" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 capitalize">{platform}</h4>
                            <p className="text-xs text-gray-500">API configured</p>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Automation Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Enable AI Content Generation</h4>
                          <p className="text-xs text-gray-500">Allow AI to generate content automatically</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                          <span className="absolute h-4 w-4 rounded-full bg-white translate-x-6 transform transition"></span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Schedule Posts Automatically</h4>
                          <p className="text-xs text-gray-500">Post content at optimal times</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                          <span className="absolute h-4 w-4 rounded-full bg-white translate-x-6 transform transition"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-3">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="guide" className="space-y-8">
              <SocialMediaGuide />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Initialize the auto-posting scheduler
    const scheduler = initializeScheduler();
    
    // Clean up when component unmounts
    return () => {
      scheduler.stop();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
      <ReactQueryDevtools />
      <Analytics />
    </QueryClientProvider>
  );
}

export default App;