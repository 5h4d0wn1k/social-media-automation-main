import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Megaphone,
  Plus,
  Rocket,
  Sparkles,
  Target,
  UserPlus,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import { 
  Campaign, 
  CampaignType, 
  Platform, 
  useSocialStore 
} from '@/lib/store';
import { 
  generateCampaign,
  generateCampaignIdeas
} from '@/lib/api/campaigns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';

// Campaign creation form schema
const campaignFormSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(['product-launch', 'event-promotion', 'content-series', 'seasonal', 'awareness', 'general']),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  targetAudience: z.string().optional(),
  goals: z.array(z.string()).optional()
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

// List of common campaign goals
const COMMON_GOALS = [
  'Increase brand awareness',
  'Drive website traffic',
  'Generate leads',
  'Boost engagement',
  'Promote a new product/service',
  'Drive sales/conversions',
  'Build community',
  'Educate audience',
  'Collect user-generated content',
  'Highlight company culture',
  'Increase social following',
  'Establish thought leadership'
];

// Human-readable campaign type labels
const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  'product-launch': 'Product Launch',
  'event-promotion': 'Event Promotion',
  'content-series': 'Content Series',
  'seasonal': 'Seasonal Campaign',
  'awareness': 'Awareness Campaign',
  'general': 'General Marketing'
};

const CAMPAIGN_TYPES: { value: CampaignType; label: string; description: string }[] = [
  { value: 'product-launch', label: 'Product Launch', description: 'Launch a new product or service' },
  { value: 'event-promotion', label: 'Event Promotion', description: 'Promote an upcoming event or webinar' },
  { value: 'content-series', label: 'Content Series', description: 'Create a series of related content' },
  { value: 'seasonal', label: 'Seasonal', description: 'Holiday or seasonal promotions and content' },
  { value: 'awareness', label: 'Brand Awareness', description: 'Increase visibility and recognition of your brand' },
  { value: 'general', label: 'General Marketing', description: 'General marketing campaign' },
];

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'github', label: 'GitHub' },
];

interface CampaignCreatorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Campaign Creator Dialog component
 */
export function CampaignCreator({ open: externalOpen, onOpenChange }: CampaignCreatorProps = {}) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignType, setCampaignType] = useState<CampaignType | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetAudience: '',
    goals: [] as string[],
  });
  
  const addCampaign = useSocialStore(state => state.addCampaign);
  
  // Sync with external state if provided
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  // Update external state if handler provided
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    } else {
      setSelectedPlatforms(prev => [...prev, platform]);
    }
  };
  
  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleCreateCampaign = () => {
    if (!campaignType || selectedPlatforms.length === 0) return;
    
    const newCampaign = {
      name: formData.name,
      description: formData.description,
      type: campaignType,
      status: 'draft' as const,
      platforms: selectedPlatforms,
      startDate: formData.startDate,
      endDate: formData.endDate,
      targetAudience: formData.targetAudience,
      posts: [],
      goals: formData.goals,
      currentMetrics: {
        engagement: 0,
        reach: 0,
        clicks: 0,
      },
      targetMetrics: {
        engagement: 1000,
        reach: 5000,
        clicks: 200,
      },
    };
    
    addCampaign(newCampaign);
    
    // Reset the form
    setCurrentStep(1);
    setCampaignType(null);
    setSelectedPlatforms([]);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      targetAudience: '',
      goals: [],
    });
    
    // Close the dialog
    handleOpenChange(false);
  };
  
  const resetForm = () => {
    setCurrentStep(1);
    setCampaignType(null);
    setSelectedPlatforms([]);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      targetAudience: '',
      goals: [],
    });
  };
  
  return (
    <>
      <Button onClick={() => handleOpenChange(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Campaign
      </Button>
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
                </div>
                <div className={`text-sm font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Campaign Type</div>
                <ChevronRight className="h-4 w-4 mx-2 text-gray-300" />
              </div>
              
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  {currentStep > 2 ? <Check className="h-4 w-4" /> : '2'}
                </div>
                <div className={`text-sm font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Basic Info</div>
                <ChevronRight className="h-4 w-4 mx-2 text-gray-300" />
              </div>
              
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  {currentStep > 3 ? <Check className="h-4 w-4" /> : '3'}
                </div>
                <div className={`text-sm font-medium ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Platforms</div>
              </div>
            </div>
            
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium mb-4">Select Campaign Type</h2>
                <div className="grid grid-cols-2 gap-4">
                  {CAMPAIGN_TYPES.map((type) => (
                    <div 
                      key={type.value}
                      className={`border rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 ${campaignType === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setCampaignType(type.value)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{type.label}</h3>
                        {campaignType === type.value && (
                          <div className="bg-blue-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={handleNext} 
                    disabled={!campaignType}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium mb-4">Campaign Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Campaign Name</label>
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="E.g. Summer Sale 2023"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Briefly describe your campaign"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <Input 
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <Input 
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Audience</label>
                    <Input 
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      placeholder="E.g. 25-34 year old professionals"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!formData.name || !formData.startDate || !formData.endDate}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium mb-4">Select Platforms</h2>
                
                <div className="grid grid-cols-3 gap-3">
                  {PLATFORMS.map((platform) => (
                    <div 
                      key={platform.value}
                      className={`border rounded-lg p-3 cursor-pointer hover:border-blue-300 ${selectedPlatforms.includes(platform.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => togglePlatform(platform.value)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{platform.label}</span>
                        {selectedPlatforms.includes(platform.value) && (
                          <div className="bg-blue-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-2">Campaign Summary</h3>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Campaign Type</p>
                        <p className="font-medium">{CAMPAIGN_TYPES.find(t => t.value === campaignType)?.label}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">
                          {formData.startDate && formData.endDate ? (
                            `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}`
                          ) : 'Not set'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Target Audience</p>
                        <p className="font-medium">{formData.targetAudience || 'General'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Platforms</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPlatforms.map(platform => (
                            <Badge key={platform} variant="outline">
                              {PLATFORMS.find(p => p.value === platform)?.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleCreateCampaign} 
                    disabled={selectedPlatforms.length === 0}
                  >
                    Create Campaign
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function to get campaign type description
function getCampaignTypeDescription(type: CampaignType): string {
  switch (type) {
    case 'product-launch':
      return "A sequence of posts to build anticipation and promote a new product or service launch";
    case 'event-promotion':
      return "Content to promote an upcoming event, drive registrations, and maintain engagement";
    case 'content-series':
      return "A themed series of educational or entertaining posts on a specific topic";
    case 'seasonal':
      return "Campaign tied to a season, holiday, or time-limited theme";
    case 'awareness':
      return "Content focused on raising awareness about a cause, issue, or brand value";
    case 'general':
      return "A flexible campaign template for general marketing purposes";
    default:
      return "";
  }
}

// Helper function to get estimated post count based on campaign type
function getEstimatedPostCount(type: CampaignType): number {
  switch (type) {
    case 'product-launch': return 12;
    case 'event-promotion': return 10;
    case 'content-series': return 8;
    case 'seasonal': return 6;
    case 'awareness': return 7;
    case 'general': return 5;
    default: return 5;
  }
} 