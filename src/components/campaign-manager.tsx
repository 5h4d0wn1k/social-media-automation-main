import React, { useState } from 'react';
import { ChevronRight, Filter as FilterIcon, Plus, LayoutGrid, Calendar, ArchiveIcon, FilePlus, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useSocialStore, Campaign } from '@/lib/store';
import { CampaignCreator } from './campaign-creator';
import { CampaignDetail } from './campaign-detail';

/**
 * Campaign Manager Component
 */
export function CampaignManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const campaigns = useSocialStore((state) => state.campaigns);
  
  // If a campaign is selected, show its detail view
  if (selectedCampaign) {
    const campaign = campaigns.find(c => c.id === selectedCampaign);
    if (campaign) {
      return (
        <div className="p-2">
          <div className="container mx-auto py-6">
            <CampaignDetail 
              campaign={campaign} 
              onBack={() => setSelectedCampaign(null)} 
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="p-2">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Campaign Manager</h1>
          <CampaignCreator />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <Tag className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FilePlus className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-2">Active Campaigns</h3>
                <p className="text-3xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {campaigns.length} total campaigns
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-2">Scheduled Posts</h3>
                <p className="text-3xl font-bold">
                  {campaigns.reduce((count, campaign) => 
                    count + (campaign.posts?.filter(post => post.status === 'scheduled')?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">Across all campaigns</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-2">Campaign Ideas</h3>
                <p className="text-3xl font-bold">3</p>
                <p className="text-sm text-gray-500 mt-1">Based on your audience</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
              <h3 className="text-xl font-medium mb-4">Recent Campaigns</h3>
              
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You don't have any campaigns yet</p>
                  <CampaignCreator />
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map(campaign => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign} 
                      onClick={() => setSelectedCampaign(campaign.id)}
                    />
                  ))}
                  
                  {campaigns.length > 3 && (
                    <div className="text-center mt-6">
                      <Button variant="outline" onClick={() => setActiveTab('campaigns')}>
                        View All Campaigns
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="campaigns">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">All Campaigns</h2>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <CampaignCreator />
                </div>
              </div>
              
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You don't have any campaigns yet</p>
                  <CampaignCreator />
                </div>
              ) : (
                <div className="space-y-6">
                  {campaigns.map(campaign => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign} 
                      onClick={() => setSelectedCampaign(campaign.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-medium mb-4">Campaign Calendar</h2>
              <p className="text-gray-500">Calendar view coming soon.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-medium mb-4">Campaign Templates</h2>
              <p className="text-gray-500">Templates feature coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Campaign Card Component
 */
interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
}

function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-lg">{campaign.name}</h3>
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-sm mb-2">{campaign.description}</p>
          
          <div className="flex items-center text-sm text-gray-500 gap-4">
            <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
            <span>{campaign.platforms.join(', ')}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Target:</span> {campaign.targetAudience || 'General'}
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="text-right mr-4">
              <div className="text-sm text-gray-500">Posts</div>
              <div className="font-semibold">{campaign.posts?.length || 0}</div>
            </div>
            
            <div className="text-right mr-4">
              <div className="text-sm text-gray-500">Engagement</div>
              <div className="font-semibold">{campaign.currentMetrics?.engagement?.toLocaleString() || 0}</div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onClick}>
              <ChevronRight className="h-4 w-4" />
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing components for completeness
function Filter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
} 