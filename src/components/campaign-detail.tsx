import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Edit,
  ExternalLink,
  FilePlus,
  LayoutGrid,
  Layers,
  LineChart,
  MessageSquare,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Share2,
  Sparkles,
  Target,
  Trash2,
  Users
} from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Campaign, CampaignStatus, Platform, useSocialStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Alert, AlertDescription } from './ui/alert';

export interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
}

export function CampaignDetail({ campaign, onBack }: CampaignDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const updateCampaign = useSocialStore(state => state.updateCampaign);
  const updateCampaignStatus = useSocialStore(state => state.updateCampaignStatus);
  
  const handleStatusChange = (status: CampaignStatus) => {
    updateCampaignStatus(campaign.id, status);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusActions = () => {
    switch (campaign.status) {
      case 'draft':
        return (
          <Button size="sm" onClick={() => handleStatusChange('active')}>
            <Play className="h-4 w-4 mr-2" />
            Launch Campaign
          </Button>
        );
      case 'active':
        return (
          <Button size="sm" variant="outline" onClick={() => handleStatusChange('paused')}>
            <Pause className="h-4 w-4 mr-2" />
            Pause Campaign
          </Button>
        );
      case 'paused':
        return (
          <Button size="sm" onClick={() => handleStatusChange('active')}>
            <Play className="h-4 w-4 mr-2" />
            Resume Campaign
          </Button>
        );
      case 'completed':
      case 'archived':
        return (
          <Button size="sm" variant="outline" onClick={() => handleStatusChange('active')}>
            <Sparkles className="h-4 w-4 mr-2" />
            Create Similar
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        
        <div className="flex items-center gap-2">
          {getStatusActions()}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Campaign
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FilePlus className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Campaign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Campaign Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-gray-600 mt-1">{campaign.description}</p>
            
            <div className="flex items-center gap-3 mt-3">
              <Badge className={`${getStatusColor(campaign.status)} capitalize`}>
                {campaign.status}
              </Badge>
              
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Layers className="h-4 w-4 mr-1" />
                {campaign.type.replace('-', ' ')}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500 justify-end">
              <Users className="h-4 w-4 mr-1" />
              <span className="font-medium">Target:</span>
              <span className="ml-1">{campaign.targetAudience || 'General'}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 justify-end">
              {campaign.platforms.map(platform => (
                <Badge key={platform} variant="outline" className="bg-gray-50">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Campaign Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="posts">
            <MessageSquare className="h-4 w-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <LineChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Target className="h-4 w-4 mr-2" />
            Goals & Targeting
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          {campaign.status === 'draft' && (
            <Alert className="bg-blue-50 border-blue-100">
              <AlertDescription className="text-blue-700">
                This campaign is currently in draft mode. Launch the campaign to start publishing posts according to the schedule.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Campaign Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Campaign Progress</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Campaign Status</div>
                <div className="font-medium capitalize">{campaign.status}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Total Posts</div>
                <div className="font-medium">{campaign.posts?.length || 0}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Published</div>
                <div className="font-medium">{campaign.posts?.filter(post => post.status === 'published')?.length || 0} posts</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Scheduled</div>
                <div className="font-medium">{campaign.posts?.filter(post => post.status === 'scheduled')?.length || 0} posts</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="bg-gray-100 h-2 rounded-full overflow-hidden w-full">
                <div 
                  className="bg-blue-500 h-full rounded-full" 
                  style={{ 
                    width: `${campaign.posts?.length ? 
                      (campaign.posts.filter(post => post.status === 'published').length / campaign.posts.length) * 100 : 0}%` 
                  }} 
                />
              </div>
            </div>
          </div>
          
          {/* Campaign Phases */}
          {campaign.phases && campaign.phases.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Campaign Phases</h2>
              
              <div className="space-y-4">
                {campaign.phases.map((phase, index) => (
                  <div key={phase.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium flex items-center">
                          <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 inline-flex items-center justify-center text-xs font-bold mr-2">
                            {index + 1}
                          </span>
                          {phase.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {campaign.posts?.filter(post => 
                          new Date(post.scheduledTime) >= new Date(phase.startDate) && 
                          new Date(post.scheduledTime) <= new Date(phase.endDate)
                        )?.length || 0} posts in this phase
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Performance Metrics</h2>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Detailed Analytics
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Engagement</div>
                <div className="text-2xl font-bold text-blue-600">
                  {campaign.currentMetrics?.engagement?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: {campaign.targetMetrics?.engagement?.toLocaleString() || 0}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Reach</div>
                <div className="text-2xl font-bold text-green-600">
                  {campaign.currentMetrics?.reach?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: {campaign.targetMetrics?.reach?.toLocaleString() || 0}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Clicks</div>
                <div className="text-2xl font-bold text-purple-600">
                  {campaign.currentMetrics?.clicks?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: {campaign.targetMetrics?.clicks?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="posts" className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Campaign Posts</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
            
            {campaign.posts?.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No posts created yet</h3>
                <p className="text-gray-500 mb-4">Start creating content for your campaign</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaign.posts?.map((post, index) => (
                  <div key={post.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          {(post.platforms || [campaign.platforms[0]]).map((platform: Platform) => (
                            <Badge key={platform} variant="outline" className="capitalize">
                              {platform}
                            </Badge>
                          ))}
                          <Badge 
                            variant="outline" 
                            className={post.status === 'published' ? 'bg-green-50 text-green-700' : 
                                      post.status === 'scheduled' ? 'bg-blue-50 text-blue-700' : 
                                      'bg-gray-50 text-gray-700'}
                          >
                            {post.status}
                          </Badge>
                        </div>
                        <p className="mt-2">{post.content}</p>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {post.hashtags.map((tag: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-gray-100">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(post.scheduledTime).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Campaign Analytics</h2>
            
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <LineChart className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">Analytics Dashboard</h3>
              <p className="text-gray-500 mb-4">Detailed analytics will be available once the campaign is active</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Campaign Goals & Targeting</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-md font-medium mb-2">Campaign Type</h3>
                <p className="text-gray-600">{campaign.type.replace('-', ' ')}</p>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-md font-medium mb-2">Target Audience</h3>
                <p className="text-gray-600">{campaign.targetAudience || 'No specific target audience defined'}</p>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-md font-medium mb-2">Goals</h3>
                {campaign.goals && campaign.goals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {campaign.goals.map((goal, index) => (
                      <Badge key={index} variant="secondary">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No specific goals defined</p>
                )}
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-md font-medium mb-2">Target Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.platforms.map((platform) => (
                    <Badge key={platform} variant="outline" className="capitalize">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Target Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Engagement</p>
                    <p className="font-medium">{campaign.targetMetrics?.engagement?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reach</p>
                    <p className="font-medium">{campaign.targetMetrics?.reach?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Clicks</p>
                    <p className="font-medium">{campaign.targetMetrics?.clicks?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Campaign Detail Dialog component
 */
export function CampaignDetailDialog({ campaign }: { campaign: Campaign }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <ChevronRight className="h-4 w-4" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Campaign Details</DialogTitle>
        </DialogHeader>
        
        <CampaignDetail 
          campaign={campaign}
          onBack={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 