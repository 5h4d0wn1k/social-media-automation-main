import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Lightbulb, 
  Megaphone, 
  ShoppingBag, 
  Calendar, 
  Image, 
  Video, 
  Link2, 
  Clock, 
  Zap, 
  Wrench, 
  Check, 
  Sparkles,
  Copy,
  Star,
  Search,
  Filter,
  Info
} from 'lucide-react';
import { Badge } from './ui/badge';

// Create custom UI components for the ones we're missing

// Create the tooltip component
const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const TooltipTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }> = ({ 
  children, 
  asChild,
  ...props 
}) => {
  return <>{children}</>;
};

const TooltipContent: React.FC<{ children: React.ReactNode, side?: 'top' | 'right' | 'bottom' | 'left' }> = ({ 
  children,
  side = 'top' 
}) => {
  return <div className="bg-gray-900 text-white px-2 py-1 rounded text-sm z-50">{children}</div>;
};

// Create a simplified toast function
const toast = (props: { 
  title?: string, 
  description?: string, 
  variant?: 'default' | 'destructive' | 'success' 
}) => {
  console.log(`Toast: ${props.title} - ${props.description}`);
};

// Dummy ToastAction component
const ToastAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { altText: string }> = () => null;

// Add dummy Input component
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return <input {...props} className={`border rounded-md px-3 py-2 ${props.className || ''}`} />;
};

// Add DropdownMenu components
const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

const DropdownMenuTrigger: React.FC<{ asChild?: boolean, children: React.ReactNode }> = ({ 
  children,
  asChild
}) => {
  return <>{children}</>;
};

const DropdownMenuContent: React.FC<{ 
  children: React.ReactNode, 
  align?: 'start' | 'end' | 'center' 
}> = ({ 
  children,
  align = 'center'
}) => {
  return (
    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
      <div className="py-1">{children}</div>
    </div>
  );
};

const DropdownMenuLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="px-4 py-2 text-sm font-semibold">{children}</div>;
};

const DropdownMenuSeparator: React.FC = () => {
  return <div className="border-t my-1"></div>;
};

const DropdownMenuItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  children: React.ReactNode
}> = ({ 
  children,
  onClick,
  className
}) => {
  return (
    <button 
      className={`w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Define types for better type safety
type CategoryId = 'product-promotion' | 'product-teasers' | 'product-launch' | 'content-ideas' | 'free-tools';

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface Practice {
  title: string;
  description: string;
  example: string;
}

interface Tool {
  name: string;
  description: string;
  url: string;
}

interface ToolCategory {
  title: string;
  description: string;
  tools: Tool[];
}

interface Template {
  id: string;
  title: string;
  template: string;
  example: string;
}

type BestPracticesType = {
  [key in CategoryId]: key extends 'free-tools' ? ToolCategory[] : Practice[];
};

type PostTemplatesType = {
  [key in Exclude<CategoryId, 'free-tools'>]: Template[];
};

// Handle getting favorites from local storage
const getFavorites = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('favoriteTemplates');
  return stored ? JSON.parse(stored) : [];
};

export function SocialMediaGuide() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('product-promotion');
  const [activeTab, setActiveTab] = useState<'best-practices' | 'templates'>('best-practices');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  // Save favorites to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('favoriteTemplates', JSON.stringify(favorites));
  }, [favorites]);

  // Define content categories
  const categories: Category[] = [
    { 
      id: 'product-promotion', 
      label: 'Product Promotion', 
      icon: <ShoppingBag className="h-4 w-4 mr-2" />,
      description: 'Strategies to showcase your products and highlight their value to your audience'
    },
    { 
      id: 'product-teasers', 
      label: 'Product Teasers', 
      icon: <Sparkles className="h-4 w-4 mr-2" />,
      description: 'Build anticipation for upcoming products with engaging teaser content'
    },
    { 
      id: 'product-launch', 
      label: 'Product Launch', 
      icon: <Zap className="h-4 w-4 mr-2" />,
      description: 'Make a splash with your new product launches and maximize visibility'
    },
    { 
      id: 'content-ideas', 
      label: 'Content Ideas', 
      icon: <Lightbulb className="h-4 w-4 mr-2" />,
      description: 'Fresh ideas for engaging your audience beyond direct product promotion'
    },
    { 
      id: 'free-tools', 
      label: 'Free Tools', 
      icon: <Wrench className="h-4 w-4 mr-2" />,
      description: 'Helpful free resources to create and manage your social media content'
    },
  ];

  // Define best practices content
  const bestPractices: BestPracticesType = {
    'product-promotion': [
      {
        title: 'Highlight Benefits, Not Features',
        description: 'Focus on how your product solves your customers\' problems or improves their lives rather than just listing specifications.',
        example: 'Instead of "Our moisturizer contains hyaluronic acid," try "Wake up to plump, hydrated skin with our moisture-locking formula."'
      },
      {
        title: 'Show the Product in Action',
        description: 'Demonstrate your product being used in real-life situations to help your audience envision how it fits into their lives.',
        example: 'Create a short video showing someone using your product and experiencing the benefits in real-time.'
      },
      {
        title: 'Include Social Proof',
        description: 'Incorporate customer testimonials, reviews, or user-generated content to build trust and credibility.',
        example: 'Share a carousel post with real customer before-and-after photos or testimonial quotes.'
      },
      {
        title: 'Create a Sense of Exclusivity',
        description: 'Make your audience feel special by offering exclusive deals, early access, or limited-time offers.',
        example: '"For our Instagram followers only: Use code INSTA20 for 20% off your first purchase."'
      },
      {
        title: 'Leverage User-Generated Content',
        description: 'Encourage customers to share their experiences with your product and repost their content.',
        example: 'Create a branded hashtag for customers to use when posting about your product, then feature the best submissions.'
      }
    ],
    'product-teasers': [
      {
        title: 'Create Mystery with Close-ups',
        description: 'Show intriguing close-up details of your product without revealing the whole thing.',
        example: 'Post a series of extreme close-ups of product details, gradually revealing more with each post.'
      },
      {
        title: 'Use Countdowns',
        description: 'Build anticipation with a countdown series leading up to your product reveal.',
        example: 'Create a 7-day countdown with teasers revealing small hints each day before the full announcement.'
      },
      {
        title: 'Release Behind-the-Scenes Content',
        description: 'Share the product development process to create emotional investment from your audience.',
        example: 'Post time-lapse videos of your product being made, or interviews with your design team discussing the inspiration.'
      },
      {
        title: 'Use Silhouettes or Partial Reveals',
        description: 'Show the shape or outline of your product without revealing all the details.',
        example: 'Post a silhouette of your product against a colorful background with the text "Can you guess what\'s coming?"'
      },
      {
        title: 'Engage Your Audience with Guessing Games',
        description: 'Turn your teaser campaign into an interactive experience by having followers guess details about the upcoming product.',
        example: 'Post pixelated or partially obscured images of your product and ask followers to guess what it is for a chance to win it.'
      }
    ],
    'product-launch': [
      {
        title: 'Create a Branded Hashtag',
        description: 'Develop a unique, memorable hashtag specifically for your launch to track engagement and increase visibility.',
        example: 'When Apple launched AirPods, they used #AirPods to create a centralized conversation around the product.'
      },
      {
        title: 'Showcase Your Product from Multiple Angles',
        description: 'Present your product comprehensively, highlighting different features and use cases.',
        example: 'Create a carousel post showing your product from various angles, with each slide highlighting a different key feature.'
      },
      {
        title: 'Partner with Influencers',
        description: 'Collaborate with relevant influencers to expand your reach and add credibility to your launch.',
        example: 'Send your product to 5-10 influencers in your niche to create launch day content showing their authentic first impressions.'
      },
      {
        title: 'Host a Live Q&A Session',
        description: 'Connect directly with your audience to answer questions about your new product in real-time.',
        example: 'Schedule an Instagram Live for the day after your launch where your product team answers follower questions.'
      },
      {
        title: 'Offer Launch-Day Specials',
        description: 'Create urgency and reward early adopters with special offers available only during your launch period.',
        example: 'Create a 24-hour flash sale with a special discount code, free gift, or bonus for launch day purchases.'
      }
    ],
    'content-ideas': [
      {
        title: 'Educational Content',
        description: 'Create tutorials, how-to guides, and tips related to your product or industry.',
        example: 'If you sell skincare, create a "Skincare 101" series explaining different ingredients and their benefits.'
      },
      {
        title: 'User-Generated Content Campaigns',
        description: 'Encourage customers to create and share content featuring your products.',
        example: 'Ask customers to share photos of how they style your clothing items with the hashtag #MyStyleWith[YourBrand].'
      },
      {
        title: 'Behind-the-Scenes Content',
        description: 'Share glimpses of your company culture, product development, or day-to-day operations.',
        example: 'Post time-lapse videos of products being made, or "day in the life" content featuring team members.'
      },
      {
        title: 'Trend Participation',
        description: 'Join trending challenges or topics in a way that authentically connects to your brand.',
        example: 'Participate in trending TikTok sounds or challenges by adapting them to showcase your products or brand personality.'
      },
      {
        title: 'Seasonal and Holiday Content',
        description: 'Create content tied to seasons, holidays, or cultural moments relevant to your audience.',
        example: 'Develop a gift guide featuring your products for different holidays, or create seasonal styling tips.'
      }
    ],
    'free-tools': [
      {
        title: 'Content Creation Tools',
        description: 'Free tools for creating and editing visual content for social media.',
        tools: [
          { name: 'Canva', description: 'Design platform with templates for all social platforms', url: 'https://www.canva.com/' },
          { name: 'CapCut', description: 'Free video editing software for TikTok and Reels', url: 'https://www.capcut.com/' },
          { name: 'VSCO', description: 'Photo and video editor with filters and editing tools', url: 'https://vsco.co/' },
          { name: 'Pexels', description: 'Free stock photos and videos', url: 'https://www.pexels.com/' },
          { name: 'Unsplash', description: 'Free high-resolution photos', url: 'https://unsplash.com/' }
        ]
      },
      {
        title: 'Social Media Management Tools',
        description: 'Free tools for scheduling and analyzing social media content.',
        tools: [
          { name: 'Later', description: 'Visual social media planner with free plan', url: 'https://later.com/' },
          { name: 'Buffer', description: 'Social media scheduling tool with free tier', url: 'https://buffer.com/' },
          { name: 'Hootsuite', description: 'Social media management platform with limited free plan', url: 'https://hootsuite.com/' },
          { name: 'TweetDeck', description: 'Free Twitter management dashboard', url: 'https://tweetdeck.twitter.com/' },
          { name: 'Facebook Creator Studio', description: 'Free tool for managing Facebook and Instagram', url: 'https://business.facebook.com/creatorstudio/' }
        ]
      },
      {
        title: 'Content Writing Tools',
        description: 'Free tools for writing and optimizing social media copy.',
        tools: [
          { name: 'Hemingway App', description: 'Free tool to make writing clear and bold', url: 'https://hemingwayapp.com/' },
          { name: 'Grammarly', description: 'Writing assistant with free tier', url: 'https://www.grammarly.com/' },
          { name: 'ChatGPT', description: 'AI assistant for generating captions and ideas', url: 'https://chat.openai.com/' },
          { name: 'Hashtagify', description: 'Free hashtag research tool', url: 'https://hashtagify.me/' },
          { name: 'CoSchedule Headline Analyzer', description: 'Free tool to analyze headline effectiveness', url: 'https://coschedule.com/headline-analyzer' }
        ]
      },
      {
        title: 'Analytics and Research Tools',
        description: 'Free tools for analyzing performance and researching content ideas.',
        tools: [
          { name: 'Google Analytics', description: 'Free web analytics service', url: 'https://analytics.google.com/' },
          { name: 'Google Trends', description: 'Explore search trends to find relevant topics', url: 'https://trends.google.com/' },
          { name: 'Meta Business Suite Insights', description: 'Free analytics for Facebook and Instagram', url: 'https://business.facebook.com/' },
          { name: 'Twitter Analytics', description: 'Free insights for your Twitter account', url: 'https://analytics.twitter.com/' },
          { name: 'Answer The Public', description: 'Free search listening tool for content ideas', url: 'https://answerthepublic.com/' }
        ]
      }
    ]
  };

  // Define post templates
  const postTemplates: PostTemplatesType = {
    'product-promotion': [
      {
        id: 'problem-solution',
        title: 'Problem-Solution Format',
        template: 'Ever struggle with [common problem]? 😩 Say goodbye to [pain point] with our [product name]! It [key benefit] so you can [desired outcome]. 👉 [Call to action] #[branded hashtag] #[industry hashtag]',
        example: 'Ever struggle with frizzy hair on humid days? 😩 Say goodbye to bad hair days with our Smooth Serum! It locks in moisture and blocks humidity so you can enjoy silky smooth hair all day long. 👉 Tap the link in bio to shop now! #SmoothHairDontCare #HairGoals'
      },
      {
        id: 'before-after',
        title: 'Before and After',
        template: 'The difference is clear! ✨ Before: [describe before state]. After: [describe transformation with product]. Our [product name] [explains how it works] for [benefit]. Don\'t believe us? Swipe to see more transformations! 👉 [Call to action]',
        example: 'The difference is clear! ✨ Before: Dull, tired skin with visible pores. After: Radiant, smooth complexion after just 2 weeks! Our Glow Serum uses vitamin C and hyaluronic acid for visible results. Don\'t believe us? Swipe to see more transformations! 👉 Link in bio to start your glow journey!'
      },
      {
        id: 'user-testimonial',
        title: 'User Testimonial Spotlight',
        template: '"[Customer quote about product experience]" - @[customer handle]\n\nWe love hearing how [product name] has helped our customers achieve [benefit]! 🙌 Experience the difference yourself: [call to action]',
        example: '"I\'ve tried dozens of planners, but this is the ONLY one that has helped me stay consistent for over 6 months!" - @productivepaula\n\nWe love hearing how our Daily Success Planner has helped our customers achieve their goals! 🙌 Experience the difference yourself: link in bio to get yours with free shipping this week!'
      },
      {
        id: 'limited-time',
        title: 'Limited-Time Offer',
        template: '⏰ FLASH SALE ALERT! ⏰\nFor the next [time period] only, get [discount or special offer] on our bestselling [product]!\n\n[Product benefit 1]\n[Product benefit 2]\n[Product benefit 3]\n\nHurry - this offer ends [date/time]! [Call to action] #[sale hashtag]',
        example: '⏰ FLASH SALE ALERT! ⏰\nFor the next 48 hours only, get 30% OFF our bestselling Fitness Resistance Bands!\n\n✅ Perfect for home workouts\n✅ 5 resistance levels included\n✅ Free workout guide with purchase\n\nHurry - this offer ends Sunday at midnight! Tap the link in our bio to shop now! #FitnessFriday'
      }
    ],
    'product-teasers': [
      {
        id: 'mysterious-closeup',
        title: 'Mysterious Close-up Teaser',
        template: '👀 Can you guess what\'s coming? Here\'s your first clue... [teaser detail about the product]\n\nSomething exciting is coming on [launch date]. Stay tuned! #[teaser hashtag] #ComingSoon',
        example: '👀 Can you guess what\'s coming? Here\'s your first clue... it\'s going to revolutionize your morning routine.\n\nSomething exciting is coming on March 15th. Stay tuned! #MorningGameChanger #ComingSoon'
      },
      {
        id: 'countdown-teaser',
        title: 'Countdown Teaser',
        template: '🚨 [X] DAYS TO GO! 🚨\n\nOur biggest launch of the year is almost here! Here\'s hint #[number]: [intriguing detail about product]\n\nAny guesses what we\'re launching? Comment below! 👇 #[branded hashtag] #LaunchCountdown',
        example: '🚨 3 DAYS TO GO! 🚨\n\nOur biggest launch of the year is almost here! Here\'s hint #2: It comes in 5 stunning colors inspired by the sunset.\n\nAny guesses what we\'re launching? Comment below! 👇 #ColorYourWorld #LaunchCountdown'
      },
      {
        id: 'silhouette-teaser',
        title: 'Silhouette Teaser',
        template: 'Something new is emerging from the shadows... 👀\n\nCan you make out what it is? All will be revealed on [launch date]!\n\n#[branded teaser hashtag] #[industry hashtag] #ComingSoon',
        example: 'Something new is emerging from the shadows... 👀\n\nCan you make out what it is? All will be revealed on Tuesday!\n\n#ShadowSeries #TechInnovation #ComingSoon'
      },
      {
        id: 'behind-scenes-teaser',
        title: 'Behind-the-Scenes Development Teaser',
        template: 'Sneak peek alert! 👀 Our team has been working tirelessly on something special for you.\n\nHere\'s a glimpse behind the scenes of our upcoming [product type]. We can\'t wait to share the finished product with you on [launch date]!\n\n#BehindTheScenes #ComingSoon #[industry hashtag]',
        example: 'Sneak peek alert! 👀 Our team has been working tirelessly on something special for you.\n\nHere\'s a glimpse behind the scenes of our upcoming skincare line. We can\'t wait to share the finished product with you on April 1st!\n\n#BehindTheScenes #ComingSoon #CleanBeauty'
      }
    ],
    'product-launch': [
      {
        id: 'launch-announcement',
        title: 'Official Launch Announcement',
        template: '🚀 IT\'S HERE! 🚀\n\nIntroducing [product name]: [brief description of what it is/does].\n\n✨ [Key feature/benefit 1]\n✨ [Key feature/benefit 2]\n✨ [Key feature/benefit 3]\n\n[Launch offer details if applicable]\n\n👉 [Call to action] #[launch hashtag] #[product hashtag]',
        example: '🚀 IT\'S HERE! 🚀\n\nIntroducing EcoBlend Protein: our first-ever plant-based protein powder made with sustainable ingredients.\n\n✨ 25g protein per serving\n✨ Zero artificial ingredients\n✨ Environmentally-friendly packaging\n\nLaunch special: Get 15% off + free shaker with code LAUNCH15\n\n👉 Link in bio to shop now! #EcoBlendLaunch #SustainableNutrition'
      },
      {
        id: 'feature-showcase',
        title: 'Feature Showcase Launch',
        template: 'NEW DROP ALERT! 📦✨\n\nMeet the [product name] - [tagline or one-sentence description]\n\nSwipe through to discover all the features that make it special:\n\n1️⃣ [Feature 1]\n2️⃣ [Feature 2]\n3️⃣ [Feature 3]\n4️⃣ [Feature 4]\n\nNow available at [where to buy]! [Call to action] #[product hashtag]',
        example: 'NEW DROP ALERT! 📦✨\n\nMeet the UltraLite Jacket - Your perfect travel companion for any weather.\n\nSwipe through to discover all the features that make it special:\n\n1️⃣ Weighs just 6oz - packs into its own pocket!\n2️⃣ 100% waterproof yet breathable\n3️⃣ Reflective details for night safety\n4️⃣ Available in 6 colors\n\nNow available at ultralitegear.com! Link in bio to shop the collection. #UltraLiteDrop'
      },
      {
        id: 'launch-live-event',
        title: 'Launch Day Live Event Announcement',
        template: '🔴 GOING LIVE TODAY! 🔴\n\nJoin us at [time] for the official unveiling of our new [product]! We\'ll be:\n\n📍 Demonstrating how it works\n📍 Answering your questions\n📍 Giving away [product] to [number] lucky viewers\n\nTap the notification bell so you don\'t miss it! #[launch hashtag] #LiveReveal',
        example: '🔴 GOING LIVE TODAY! 🔴\n\nJoin us at 3PM EST for the official unveiling of our new Precision Skincare System! We\'ll be:\n\n📍 Demonstrating how it works\n📍 Answering your questions\n📍 Giving away full systems to 3 lucky viewers\n\nTap the notification bell so you don\'t miss it! #PrecisionSkincare #LiveReveal'
      },
      {
        id: 'early-reviews',
        title: 'Early Customer Reviews Launch Post',
        template: 'The reviews are in! 🌟\n\nWe soft-launched [product name] to a select group of customers last week, and here\'s what they\'re saying:\n\n"[Customer review 1]" - @[customer 1]\n"[Customer review 2]" - @[customer 2]\n"[Customer review 3]" - @[customer 3]\n\nNow available to everyone! [Call to action] #[product hashtag]',
        example: 'The reviews are in! 🌟\n\nWe soft-launched our Comfort+ Mattress to a select group of customers last week, and here\'s what they\'re saying:\n\n"Best sleep of my life! I\'ve never woken up feeling so refreshed." - @sleepyhead22\n"The pressure relief is UNREAL. My back pain is gone!" - @healthyliving\n"Worth every penny. I\'m ordering one for my guest room too." - @homestyler\n\nNow available to everyone! Link in bio to experience the difference. #ComfortPlusSleep'
      }
    ],
    'content-ideas': [
      {
        id: 'expert-tips',
        title: 'Expert Tips Series',
        template: '[Number] [Industry/Topic] Tips from Our Experts 💡\n\n1️⃣ [Tip one]\n2️⃣ [Tip two]\n3️⃣ [Tip three]\n4️⃣ [Tip four]\n5️⃣ [Tip five]\n\nWhich tip are you trying first? Let us know 👇\n\n#[industry hashtag] #ExpertTips #[branded hashtag]',
        example: '5 Sustainable Fashion Tips from Our Experts 💡\n\n1️⃣ Invest in quality basics that last for years\n2️⃣ Look for natural or recycled fibers\n3️⃣ Learn basic mending skills to extend garment life\n4️⃣ Try the 30-wears test before purchasing\n5️⃣ Research brands\' environmental commitments\n\nWhich tip are you trying first? Let us know 👇\n\n#SustainableFashion #ExpertTips #EcoWardrobe'
      },
      {
        id: 'day-in-life',
        title: 'Day in the Life',
        template: 'Ever wonder what goes on behind the scenes at [your company]? Here\'s a day in the life of our [job role]! 📱\n\n⏰ [Morning routine/tasks]\n🕛 [Midday activities]\n🌆 [Afternoon processes]\n\nWhat other behind-the-scenes content would you like to see? 👇 #BehindTheScenes #DayInTheLife #[industry hashtag]',
        example: 'Ever wonder what goes on behind the scenes at Bloom Cosmetics? Here\'s a day in the life of our Product Formulator! 📱\n\n⏰ 8AM: Lab safety checks and reviewing formulation notes\n🕛 12PM: Testing new ingredient combinations\n🌆 3PM: Team meeting to review sample feedback\n\nWhat other behind-the-scenes content would you like to see? 👇 #BehindTheScenes #DayInTheLife #BeautyScience'
      },
      {
        id: 'trending-challenge',
        title: 'Trending Challenge Participation',
        template: 'We couldn\'t resist joining the [trending challenge name] challenge! 🤩\n\n[Brief description of how you\'ve adapted the trend to your brand]\n\n@[creator of challenge] thanks for the inspiration!\n\nWho else is loving this trend? #[challenge hashtag] #[industry hashtag]',
        example: 'We couldn\'t resist joining the #TellMeWithoutTellingMe challenge! 🤩\n\nTell me you\'re a coffee enthusiast without telling me you\'re a coffee enthusiast. We\'ll go first: our office has 5 different brewing methods and we debate tasting notes during morning meetings.\n\n@trendycreator thanks for the inspiration!\n\nWho else is loving this trend? #TellMeWithoutTellingMe #CoffeeLovers'
      },
      {
        id: 'myth-busters',
        title: 'Myth Busters',
        template: '👨‍🔬 MYTH BUSTERS: [Topic] Edition 👩‍🔬\n\nMyth #1: "[Common misconception]"\nTRUTH: [Accurate information]\n\nMyth #2: "[Common misconception]"\nTRUTH: [Accurate information]\n\nMyth #3: "[Common misconception]"\nTRUTH: [Accurate information]\n\nDid any of these surprise you? Share this to bust these myths! #MythBusters #[industry hashtag]',
        example: '👨‍🔬 MYTH BUSTERS: Skincare Edition 👩‍🔬\n\nMyth #1: "Expensive products always work better"\nTRUTH: Price doesn\'t determine effectiveness - ingredients and formulation do!\n\nMyth #2: "You need a 10-step routine for good skin"\nTRUTH: Consistency with a few effective products often works better than many products\n\nMyth #3: "Natural ingredients are always safer"\nTRUTH: Both natural and synthetic ingredients can be safe and effective when properly formulated\n\nDid any of these surprise you? Share this to bust these myths! #MythBusters #SkincareFactCheck'
      }
    ]
  };

  // Function to handle copying template to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedTemplate(text);
        toast({
          title: "Copied to clipboard!",
          description: "Template text has been copied and is ready to use.",
          variant: "success"
        });
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedTemplate(null);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy template: ', err);
        toast({
          title: "Copy failed",
          description: "Unable to copy text to clipboard.",
          variant: "destructive"
        });
      });
  };

  // Function to toggle favorite status
  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      } else {
        const newFavorites = [...prev, templateId];
        toast({
          title: "Template saved!",
          description: "Added to your favorites for quick access.",
          variant: "default"
        });
        return newFavorites;
      }
    });
  };

  // Function to filter templates by search term
  const filterTemplates = (templates: Template[]) => {
    if (!searchTerm && !showOnlyFavorites) return templates;
    
    return templates.filter(template => {
      const matchesSearch = searchTerm === '' || 
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.template.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFavorites = !showOnlyFavorites || favorites.includes(template.id);
      
      return matchesSearch && matchesFavorites;
    });
  };

  // Function to render practice cards
  const renderPractices = () => {
    if (activeCategory === 'free-tools') {
      const toolCategories = bestPractices[activeCategory];
      return (
        <div className="space-y-6">
          {toolCategories.map((category, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
                <CardTitle className="text-lg flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-blue-500" />
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {category.tools.map((tool, toolIndex) => (
                    <div key={toolIndex} className="flex flex-col gap-1 pb-2 border-b last:border-b-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{tool.name}</h4>
                        <a 
                          href={tool.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          <Button variant="outline" size="sm" className="px-2 h-7">
                            <Link2 className="h-4 w-4 mr-1" />
                            Visit
                          </Button>
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    } else {
      const practices = bestPractices[activeCategory] as Practice[];
      return (
        <Accordion type="single" collapsible className="w-full">
          {practices.map((practice, index) => (
            <AccordionItem key={index} value={`practice-${index}`} className="border border-border rounded-md mb-2 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
                <div className="flex items-center text-left">
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                  {practice.title}
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t">
                <div className="space-y-3 p-4">
                  <p className="text-foreground">{practice.description}</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm italic">Example: {practice.example}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }
  };

  // Function to render template cards
  const renderTemplates = () => {
    if (activeCategory === 'free-tools') {
      return (
        <div className="p-6 text-center">
          <Wrench className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-medium">No templates available for this category</h3>
          <p className="text-muted-foreground mt-2">
            This category provides tools rather than templates. Check the Best Practices tab for tool recommendations.
          </p>
        </div>
      );
    }

    const templates = postTemplates[activeCategory];
    const filteredTemplates = filterTemplates(templates);
    
    if (filteredTemplates.length === 0) {
      return (
        <div className="p-6 text-center">
          <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search terms or filters.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setShowOnlyFavorites(false);
            }}
          >
            Clear Filters
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredTemplates.map((template, index) => (
          <Card key={index} className={`overflow-hidden hover:shadow-md transition-all ${favorites.includes(template.id) ? 'border-yellow-200' : ''}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center">
                <Megaphone className="h-5 w-5 mr-2 text-blue-500" />
                <CardTitle className="text-lg">{template.title}</CardTitle>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleFavorite(template.id)}
                    >
                      <Star 
                        className={`h-4 w-4 ${favorites.includes(template.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {favorites.includes(template.id) ? 'Remove from favorites' : 'Add to favorites'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Template</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => copyToClipboard(template.template)}
                    >
                      {copiedTemplate === template.template ? (
                        <Check className="h-4 w-4 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      {copiedTemplate === template.template ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md whitespace-pre-line text-sm">
                    {template.template}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Example</h4>
                  <div className="bg-muted p-3 rounded-md whitespace-pre-line text-sm">
                    {template.example}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-xl">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              Social Media Content Guide
            </CardTitle>
            <CardDescription className="mt-1">
              Tips, best practices, and templates for creating engaging content
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full h-8 w-8 p-0">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[250px] text-sm">
                  Use this guide to explore content strategies, templates, and tools for your social media marketing.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
          {/* Left sidebar with categories */}
          <div className="space-y-4">
            <div className="border rounded-md p-1 h-fit">
              <div className="space-y-1">
                {categories.map((category) => (
                  <TooltipProvider key={category.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={activeCategory === category.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setActiveCategory(category.id)}
                        >
                          {category.icon}
                          {category.label}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="max-w-[200px] text-sm">{category.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
            
            {/* Recently viewed section could go here */}
            <Card className="overflow-hidden">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Recently Viewed</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-2 pb-2">
                  {favorites.length > 0 ? (
                    <div className="space-y-1">
                      {favorites.slice(0, 3).map((id) => {
                        // Find template that matches id
                        let template;
                        for (const cat in postTemplates) {
                          if (cat !== 'free-tools') {
                            const catKey = cat as Exclude<CategoryId, 'free-tools'>;
                            const found = postTemplates[catKey].find(t => t.id === id);
                            if (found) {
                              template = found;
                              break;
                            }
                          }
                        }
                        
                        if (!template) return null;
                        
                        return (
                          <Button 
                            key={id} 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start h-auto py-1.5 text-xs"
                            onClick={() => {
                              // Find category for this template
                              for (const cat in postTemplates) {
                                if (cat !== 'free-tools') {
                                  const catKey = cat as Exclude<CategoryId, 'free-tools'>;
                                  if (postTemplates[catKey].find(t => t.id === id)) {
                                    setActiveCategory(catKey);
                                    setActiveTab('templates');
                                    break;
                                  }
                                }
                              }
                            }}
                          >
                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                            <span className="truncate">{template.title}</span>
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground px-2 py-1">
                      Star templates to save them for quick access
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right content area */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center mb-1">
                {categories.find(c => c.id === activeCategory)?.icon}
                {categories.find(c => c.id === activeCategory)?.label}
              </h2>
              <div className="flex flex-wrap gap-2">
                {activeCategory === 'product-promotion' && (
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    Products
                  </Badge>
                )}
                {activeCategory === 'content-ideas' && (
                  <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Ideas
                  </Badge>
                )}
                {(activeCategory === 'product-teasers' || activeCategory === 'product-launch') && (
                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <Calendar className="h-3 w-3 mr-1" />
                    Launch Strategy
                  </Badge>
                )}
                {activeCategory === 'free-tools' && (
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <Wrench className="h-3 w-3 mr-1" />
                    Tools
                  </Badge>
                )}
                
                <p className="text-sm text-muted-foreground ml-1">
                  {categories.find(c => c.id === activeCategory)?.description}
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'best-practices' | 'templates')}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="best-practices">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Best Practices
                  </TabsTrigger>
                  <TabsTrigger value="templates" disabled={activeCategory === 'free-tools'}>
                    <Megaphone className="h-4 w-4 mr-2" />
                    Post Templates
                  </TabsTrigger>
                </TabsList>
                
                {activeTab === 'templates' && activeCategory !== 'free-tools' && (
                  <div className="flex items-center gap-2">
                    <div className="relative w-[200px]">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}>
                          <div className="flex items-center">
                            <Star className={`h-4 w-4 mr-2 ${showOnlyFavorites ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            {showOnlyFavorites ? 'Show all templates' : 'Show only favorites'}
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSearchTerm(''); setShowOnlyFavorites(false); }}>
                          <div className="flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            Clear all filters
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
              
              <TabsContent value="best-practices" className="mt-0">
                {renderPractices()}
              </TabsContent>
              <TabsContent value="templates" className="mt-0">
                {renderTemplates()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-3 text-sm text-muted-foreground">
        <div className="flex justify-between items-center w-full">
          <span>Updated regularly with new strategies and templates to help you create effective social media content.</span>
          <Badge variant="outline" className="ml-auto">v1.2</Badge>
        </div>
      </CardFooter>
    </Card>
  );
} 