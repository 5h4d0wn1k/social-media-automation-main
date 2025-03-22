import React, { useEffect, useState } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from '@vercel/analytics/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Switch } from './components/ui/switch';
import { Dialog, DialogContent } from './components/ui/dialog';
import { Separator } from './components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { CheckCircle } from 'lucide-react';

// Content and Post Management
import { PostScheduler } from './components/post-scheduler';
import { ContentGenerator } from './components/content-generator';
import { PostCreator } from './components/post-creator';
import { ContentCalendar } from './components/content-calendar';

// Analytics and Insights
import { AnalyticsDashboard } from './components/analytics-dashboard';

// Campaign Management
import { CampaignManager } from './components/campaign-manager';
import { CampaignCreator } from './components/campaign-creator';

// RSS and Automation
import { RssFeedManager } from './components/rss-feed-manager';
import { HashtagManager } from './components/hashtag-manager';
import { AutomationManager } from './components/automation-manager';

// Utility Components
import { SchedulerStatus } from './components/ui/scheduler-status';
import { Logo } from './components/ui/logo';
import { SocialMediaGuide } from './components/social-media-guide';
import { WhatsAppSetup } from './components/whatsapp-setup';

// Icons
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
  BarChart3,
  FileText,
  CalendarDays,
  Hash,
  ListOrdered,
  Megaphone,
  Webhook,
  HelpCircle,
  Send,
  Phone,
  Home,
  UserCircle,
  Bell,
  BookOpen,
  ScrollText,
  PanelLeft,
  PanelRight,
  Zap,
  MoveRight,
  Gauge,
  Users,
  Target,
  Search,
  Info
} from 'lucide-react';

// Data and Services
import { useSocialStore, Platform } from './lib/store';
import { setupAutomatedPosts } from './lib/browser-cron';
import { initializeScheduler } from './lib/services/scheduler';
import { env } from './lib/env';

const queryClient = new QueryClient();

// Initialize automated posts
setupAutomatedPosts();

// Add RiteKit API key to the environment
if (!env.RITEKIT_API_KEY) {
  env.RITEKIT_API_KEY = 'demo'; // Use demo key by default
}

// Define tab groups and their respective tabs
const TAB_GROUPS = {
  main: [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4 mr-2" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
  ],
  content: [
    { id: 'create-post', label: 'Create Post', icon: <Send className="h-4 w-4 mr-2" /> },
    { id: 'content-calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4 mr-2" /> },
    { id: 'generate-content', label: 'AI Generator', icon: <Sparkles className="h-4 w-4 mr-2" /> },
    { id: 'content-guide', label: 'Content Guide', icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { id: 'hashtags', label: 'Hashtags', icon: <Hash className="h-4 w-4 mr-2" /> },
  ],
  campaigns: [
    { id: 'campaigns', label: 'Campaigns', icon: <Megaphone className="h-4 w-4 mr-2" /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarDays className="h-4 w-4 mr-2" /> },
  ],
  automation: [
    { id: 'rss-feeds', label: 'RSS Feeds', icon: <Rss className="h-4 w-4 mr-2" /> },
    { id: 'queue', label: 'Content Queue', icon: <ListOrdered className="h-4 w-4 mr-2" /> },
    { id: 'automations', label: 'Automation', icon: <Webhook className="h-4 w-4 mr-2" /> },
  ],
  system: [
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
    { id: 'platforms', label: 'Platforms', icon: <Gauge className="h-4 w-4 mr-2" /> },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle className="h-4 w-4 mr-2" /> },
  ],
};

interface PlatformData {
  name: string;
  enabled: boolean;
  bestTimes: string[];
  accessToken?: string;
}

function App() {
  // State for platform data and integration status
  const [platformData, setPlatformData] = useState<Record<Platform, PlatformData>>({
    twitter: { name: 'Twitter', enabled: true, bestTimes: ['9:00', '15:00', '18:00'] },
    facebook: { name: 'Facebook', enabled: true, bestTimes: ['12:00', '15:00', '18:00'] },
    instagram: { name: 'Instagram', enabled: true, bestTimes: ['9:00', '12:00', '18:00'] },
    linkedin: { name: 'LinkedIn', enabled: true, bestTimes: ['9:00', '12:00', '17:00'] },
    telegram: { name: 'Telegram', enabled: false, bestTimes: ['10:00', '14:00', '19:00'] },
    whatsapp: { name: 'WhatsApp', enabled: false, bestTimes: ['10:00', '14:00', '19:00'] },
    youtube: { name: 'YouTube', enabled: false, bestTimes: ['15:00', '18:00', '20:00'] },
    github: { name: 'GitHub', enabled: false, bestTimes: ['10:00', '14:00', '17:00'] },
  });

  // State for showing different dialogs and modals
  const [showWhatsAppSetup, setShowWhatsAppSetup] = useState(false);
  const [showHashtagManager, setShowHashtagManager] = useState(false);
  const [showCampaignCreator, setShowCampaignCreator] = useState(false);
  const [showPostCreator, setShowPostCreator] = useState(false);
  
  // Main active tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTabGroup, setActiveTabGroup] = useState('main');

  // Initialize scheduler service
  useEffect(() => {
    initializeScheduler();
  }, []);

  // Set social store data for platforms
  const setSocialData = useSocialStore(state => state.setSocialData);
  useEffect(() => {
    setSocialData(platformData);
  }, [platformData, setSocialData]);

  // Helper functions
  const togglePlatform = (platform: Platform) => {
    setPlatformData(prev => ({
      ...prev,
      [platform]: { ...prev[platform], enabled: !prev[platform].enabled }
    }));
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-5 w-5" />;
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'linkedin': return <Linkedin className="h-5 w-5" />;
      case 'youtube': return <Youtube className="h-5 w-5" />;
      case 'telegram': return <MessageCircle className="h-5 w-5" />;
      case 'whatsapp': return <MessageSquare className="h-5 w-5" />;
      case 'github': return <Github className="h-5 w-5" />;
      default: return null;
    }
  };

  // Get all tabs from all groups
  const getAllTabs = () => {
    return Object.values(TAB_GROUPS).flat();
  };

  // Find tab object by ID
  const findTabById = (id: string) => {
    return getAllTabs().find(tab => tab.id === id);
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Find which group this tab belongs to
    for (const [groupId, tabs] of Object.entries(TAB_GROUPS)) {
      if (tabs.some(tab => tab.id === tabId)) {
        setActiveTabGroup(groupId);
        break;
      }
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Navigation Bar */}
        <header className="border-b py-3 px-4 bg-card flex justify-between items-center">
          <div className="flex items-center">
            <Logo className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold">SocialFlow</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <SchedulerStatus compact={true} />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <UserCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="w-64 border-r bg-card h-full flex flex-col py-4 hidden md:block">
            {Object.entries(TAB_GROUPS).map(([groupId, tabs]) => (
              <div key={groupId} className="mb-6">
                <div className="px-4 mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {groupId === 'main' ? 'Overview' :
                     groupId === 'content' ? 'Content' :
                     groupId === 'campaigns' ? 'Campaigns' :
                     groupId === 'automation' ? 'Automation' :
                     'System'}
                  </h3>
                </div>
                <nav className="space-y-1">
                  {tabs.map(tab => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "secondary" : "ghost"}
                      className="w-full justify-start px-4 py-2 text-left"
                      onClick={() => handleTabChange(tab.id)}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </Button>
                  ))}
                </nav>
              </div>
            ))}

            {/* Social Media Platforms */}
            <div className="px-4 mb-2 mt-auto">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Connected Platforms
              </h3>
            </div>
            <div className="px-3 space-y-1">
              {Object.entries(platformData).map(([platform, data]) => (
                <div 
                  key={platform} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50"
                >
                  <div className="flex items-center">
                    {getPlatformIcon(platform as Platform)}
                    <span className="ml-2 text-sm">{data.name}</span>
                  </div>
                  <Switch 
                    checked={data.enabled}
                    onCheckedChange={() => togglePlatform(platform as Platform)}
                  />
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Tab-specific Header */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">
                  {findTabById(activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-muted-foreground">
                  {activeTabGroup === 'main' && activeTab === 'dashboard' && 'Your social media activity at a glance'}
                  {activeTabGroup === 'main' && activeTab === 'analytics' && 'Track your social media performance'}
                  {activeTabGroup === 'content' && activeTab === 'create-post' && 'Create and schedule new content'}
                  {activeTabGroup === 'content' && activeTab === 'content-calendar' && 'View and manage your content schedule'}
                  {activeTabGroup === 'content' && activeTab === 'generate-content' && 'Generate content with AI assistance'}
                  {activeTabGroup === 'content' && activeTab === 'content-guide' && 'Social media content best practices'}
                  {activeTabGroup === 'content' && activeTab === 'hashtags' && 'Manage your hashtags collection'}
                  {activeTabGroup === 'campaigns' && activeTab === 'campaigns' && 'Manage your marketing campaigns'}
                  {activeTabGroup === 'campaigns' && activeTab === 'schedule' && 'Schedule upcoming campaigns'}
                  {activeTabGroup === 'automation' && activeTab === 'rss-feeds' && 'Manage RSS feed content sources'}
                  {activeTabGroup === 'automation' && activeTab === 'queue' && 'View and manage your content queue'}
                  {activeTabGroup === 'automation' && activeTab === 'automations' && 'Set up automated content workflows'}
                  {activeTabGroup === 'system' && activeTab === 'settings' && 'Configure application settings'}
                  {activeTabGroup === 'system' && activeTab === 'platforms' && 'Manage connected platforms'}
                  {activeTabGroup === 'system' && activeTab === 'help' && 'Get help and resources'}
                </p>
              </div>
              
              {/* Action Buttons based on active tab */}
              <div>
                {activeTab === 'create-post' && (
                  <Button onClick={() => setShowPostCreator(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                )}
                
                {activeTab === 'campaigns' && (
                  <Button onClick={() => setShowCampaignCreator(true)}>
                    <Megaphone className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                )}
                
                {activeTab === 'hashtags' && (
                  <Button onClick={() => setShowHashtagManager(true)}>
                    <Hash className="h-4 w-4 mr-2" />
                    Manage Hashtags
                  </Button>
                )}

                {activeTab === 'platforms' && (
                  <Button onClick={() => setShowWhatsAppSetup(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Set Up WhatsApp
                  </Button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                      <CardDescription>Your social media performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Posts Published</span>
                          <span className="font-medium">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Engagement</span>
                          <span className="font-medium">1,243</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Scheduled Posts</span>
                          <span className="font-medium">8</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Post Analytics</CardTitle>
                      <CardDescription>Content performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center justify-center border rounded-md p-3">
                          <span className="text-2xl font-bold text-blue-500">85%</span>
                          <span className="text-xs text-muted-foreground">Engagement Rate</span>
                        </div>
                        <div className="flex flex-col items-center justify-center border rounded-md p-3">
                          <span className="text-2xl font-bold text-green-500">12.3K</span>
                          <span className="text-xs text-muted-foreground">Total Reach</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Automation Status</CardTitle>
                      <CardDescription>Auto-posting</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SchedulerStatus compact={false} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaigns</CardTitle>
                      <CardDescription>Active marketing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col h-full justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Active Campaigns</span>
                            <span className="font-medium">3</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Pending Posts</span>
                            <span className="font-medium">12</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Campaign Engagement</span>
                            <span className="font-medium text-green-500">+24%</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => handleTabChange('campaigns')}>
                          <Megaphone className="h-3 w-3 mr-2" />
                          View Campaigns
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Content Calendar and Platform Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Calendar</CardTitle>
                      <CardDescription>Upcoming scheduled posts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Product Update Post</p>
                            <p className="text-xs text-muted-foreground">Today, 3:00 PM</p>
                          </div>
                          <Badge variant="secondary">Twitter</Badge>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Team Spotlight</p>
                            <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                          </div>
                          <Badge variant="secondary">LinkedIn</Badge>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Customer Success Story</p>
                            <p className="text-xs text-muted-foreground">Jun 15, 2:00 PM</p>
                          </div>
                          <Badge variant="secondary">Instagram</Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleTabChange('content-calendar')}>
                        View Full Calendar
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Performance</CardTitle>
                      <CardDescription>Engagement by platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Twitter className="h-4 w-4 mr-2 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Twitter</p>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                        <div className="flex items-center">
                          <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">LinkedIn</p>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <div className="flex items-center">
                          <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Instagram</p>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-pink-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="flex items-center">
                          <Facebook className="h-4 w-4 mr-2 text-blue-800" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Facebook</p>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-blue-800 h-2 rounded-full" style={{ width: '52%' }}></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium">52%</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleTabChange('analytics')}>
                        View Full Analytics
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest actions and automation events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Post Published Successfully</p>
                          <p className="text-xs text-muted-foreground">Twitter post was published at 11:30 AM</p>
                          <p className="text-xs text-muted-foreground mt-1">13 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Rss className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New RSS Content Found</p>
                          <p className="text-xs text-muted-foreground">3 new articles from Tech Daily blog</p>
                          <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Post Scheduled</p>
                          <p className="text-xs text-muted-foreground">LinkedIn post scheduled for tomorrow at 9:00 AM</p>
                          <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleTabChange('automations')}>
                      View All Activity
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Analytics */}
            {activeTab === 'analytics' && <AnalyticsDashboard />}

            {/* Content Creation */}
            {activeTab === 'create-post' && <PostCreator isOpen={showPostCreator} onOpenChange={setShowPostCreator} />}
            {activeTab === 'content-calendar' && <ContentCalendar />}
            {activeTab === 'generate-content' && <ContentGenerator />}
            {activeTab === 'content-guide' && <SocialMediaGuide />}
            {activeTab === 'hashtags' && (
              <HashtagManager open={showHashtagManager} onOpenChange={setShowHashtagManager} />
            )}

            {/* Campaigns */}
            {activeTab === 'campaigns' && <CampaignManager />}
            
            {/* Automation */}
            {activeTab === 'rss-feeds' && <RssFeedManager />}
            {activeTab === 'queue' && <PostScheduler />}
            {activeTab === 'automations' && <AutomationManager />}
          </main>
        </div>
      </div>

      {/* Floating Dialogs */}
      {/* WhatsApp Setup Dialog */}
      <WhatsAppSetup open={showWhatsAppSetup} onOpenChange={setShowWhatsAppSetup} />

      {/* Campaign Creator Dialog */}
      <CampaignCreator open={showCampaignCreator} onOpenChange={setShowCampaignCreator} />

      {/* React Query Devtools */}
      <ReactQueryDevtools initialIsOpen={false} />

      {/* Analytics */}
      <Analytics />
    </QueryClientProvider>
  );
}

export default App;