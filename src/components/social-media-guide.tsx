import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Badge } from './ui/badge';

export function SocialMediaGuide() {
  const [activeCategory, setActiveCategory] = useState('product-promotion');

  // Define content categories
  const categories = [
    { id: 'product-promotion', label: 'Product Promotion', icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
    { id: 'product-teasers', label: 'Product Teasers', icon: <Sparkles className="h-4 w-4 mr-2" /> },
    { id: 'product-launch', label: 'Product Launch', icon: <Zap className="h-4 w-4 mr-2" /> },
    { id: 'content-ideas', label: 'Content Ideas', icon: <Lightbulb className="h-4 w-4 mr-2" /> },
    { id: 'free-tools', label: 'Free Tools', icon: <Wrench className="h-4 w-4 mr-2" /> },
  ];

  // Define best practices content
  const bestPractices = {
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
  const postTemplates = {
    'product-promotion': [
      {
        title: 'Problem-Solution Format',
        template: 'Ever struggle with [common problem]? 😩 Say goodbye to [pain point] with our [product name]! It [key benefit] so you can [desired outcome]. 👉 [Call to action] #[branded hashtag] #[industry hashtag]',
        example: 'Ever struggle with frizzy hair on humid days? 😩 Say goodbye to bad hair days with our Smooth Serum! It locks in moisture and blocks humidity so you can enjoy silky smooth hair all day long. 👉 Tap the link in bio to shop now! #SmoothHairDontCare #HairGoals'
      },
      {
        title: 'Before and After',
        template: 'The difference is clear! ✨ Before: [describe before state]. After: [describe transformation with product]. Our [product name] [explains how it works] for [benefit]. Don\'t believe us? Swipe to see more transformations! 👉 [Call to action]',
        example: 'The difference is clear! ✨ Before: Dull, tired skin with visible pores. After: Radiant, smooth complexion after just 2 weeks! Our Glow Serum uses vitamin C and hyaluronic acid for visible results. Don\'t believe us? Swipe to see more transformations! 👉 Link in bio to start your glow journey!'
      },
      {
        title: 'User Testimonial Spotlight',
        template: '"[Customer quote about product experience]" - @[customer handle]\n\nWe love hearing how [product name] has helped our customers achieve [benefit]! 🙌 Experience the difference yourself: [call to action]',
        example: '"I\'ve tried dozens of planners, but this is the ONLY one that has helped me stay consistent for over 6 months!" - @productivepaula\n\nWe love hearing how our Daily Success Planner has helped our customers achieve their goals! 🙌 Experience the difference yourself: link in bio to get yours with free shipping this week!'
      },
      {
        title: 'Limited-Time Offer',
        template: '⏰ FLASH SALE ALERT! ⏰\nFor the next [time period] only, get [discount or special offer] on our bestselling [product]!\n\n[Product benefit 1]\n[Product benefit 2]\n[Product benefit 3]\n\nHurry - this offer ends [date/time]! [Call to action] #[sale hashtag]',
        example: '⏰ FLASH SALE ALERT! ⏰\nFor the next 48 hours only, get 30% OFF our bestselling Fitness Resistance Bands!\n\n✅ Perfect for home workouts\n✅ 5 resistance levels included\n✅ Free workout guide with purchase\n\nHurry - this offer ends Sunday at midnight! Tap the link in our bio to shop now! #FitnessFriday'
      }
    ],
    'product-teasers': [
      {
        title: 'Mysterious Close-up Teaser',
        template: '👀 Can you guess what\'s coming? Here\'s your first clue... [teaser detail about the product]\n\nSomething exciting is coming on [launch date]. Stay tuned! #[teaser hashtag] #ComingSoon',
        example: '👀 Can you guess what\'s coming? Here\'s your first clue... it\'s going to revolutionize your morning routine.\n\nSomething exciting is coming on March 15th. Stay tuned! #MorningGameChanger #ComingSoon'
      },
      {
        title: 'Countdown Teaser',
        template: '🚨 [X] DAYS TO GO! 🚨\n\nOur biggest launch of the year is almost here! Here\'s hint #[number]: [intriguing detail about product]\n\nAny guesses what we\'re launching? Comment below! 👇 #[branded hashtag] #LaunchCountdown',
        example: '🚨 3 DAYS TO GO! 🚨\n\nOur biggest launch of the year is almost here! Here\'s hint #2: It comes in 5 stunning colors inspired by the sunset.\n\nAny guesses what we\'re launching? Comment below! 👇 #ColorYourWorld #LaunchCountdown'
      },
      {
        title: 'Silhouette Teaser',
        template: 'Something new is emerging from the shadows... 👀\n\nCan you make out what it is? All will be revealed on [launch date]!\n\n#[branded teaser hashtag] #[industry hashtag] #ComingSoon',
        example: 'Something new is emerging from the shadows... 👀\n\nCan you make out what it is? All will be revealed on Tuesday!\n\n#ShadowSeries #TechInnovation #ComingSoon'
      },
      {
        title: 'Behind-the-Scenes Development Teaser',
        template: 'Sneak peek alert! 👀 Our team has been working tirelessly on something special for you.\n\nHere\'s a glimpse behind the scenes of our upcoming [product type]. We can\'t wait to share the finished product with you on [launch date]!\n\n#BehindTheScenes #ComingSoon #[industry hashtag]',
        example: 'Sneak peek alert! 👀 Our team has been working tirelessly on something special for you.\n\nHere\'s a glimpse behind the scenes of our upcoming skincare line. We can\'t wait to share the finished product with you on April 1st!\n\n#BehindTheScenes #ComingSoon #CleanBeauty'
      }
    ],
    'product-launch': [
      {
        title: 'Official Launch Announcement',
        template: '🚀 IT\'S HERE! 🚀\n\nIntroducing [product name]: [brief description of what it is/does].\n\n✨ [Key feature/benefit 1]\n✨ [Key feature/benefit 2]\n✨ [Key feature/benefit 3]\n\n[Launch offer details if applicable]\n\n👉 [Call to action] #[launch hashtag] #[product hashtag]',
        example: '🚀 IT\'S HERE! 🚀\n\nIntroducing EcoBlend Protein: our first-ever plant-based protein powder made with sustainable ingredients.\n\n✨ 25g protein per serving\n✨ Zero artificial ingredients\n✨ Environmentally-friendly packaging\n\nLaunch special: Get 15% off + free shaker with code LAUNCH15\n\n👉 Link in bio to shop now! #EcoBlendLaunch #SustainableNutrition'
      },
      {
        title: 'Feature Showcase Launch',
        template: 'NEW DROP ALERT! 📦✨\n\nMeet the [product name] - [tagline or one-sentence description]\n\nSwipe through to discover all the features that make it special:\n\n1️⃣ [Feature 1]\n2️⃣ [Feature 2]\n3️⃣ [Feature 3]\n4️⃣ [Feature 4]\n\nNow available at [where to buy]! [Call to action] #[product hashtag]',
        example: 'NEW DROP ALERT! 📦✨\n\nMeet the UltraLite Jacket - Your perfect travel companion for any weather.\n\nSwipe through to discover all the features that make it special:\n\n1️⃣ Weighs just 6oz - packs into its own pocket!\n2️⃣ 100% waterproof yet breathable\n3️⃣ Reflective details for night safety\n4️⃣ Available in 6 colors\n\nNow available at ultralitegear.com! Link in bio to shop the collection. #UltraLiteDrop'
      },
      {
        title: 'Launch Day Live Event Announcement',
        template: '🔴 GOING LIVE TODAY! 🔴\n\nJoin us at [time] for the official unveiling of our new [product]! We\'ll be:\n\n📍 Demonstrating how it works\n📍 Answering your questions\n📍 Giving away [product] to [number] lucky viewers\n\nTap the notification bell so you don\'t miss it! #[launch hashtag] #LiveReveal',
        example: '🔴 GOING LIVE TODAY! 🔴\n\nJoin us at 3PM EST for the official unveiling of our new Precision Skincare System! We\'ll be:\n\n📍 Demonstrating how it works\n📍 Answering your questions\n📍 Giving away full systems to 3 lucky viewers\n\nTap the notification bell so you don\'t miss it! #PrecisionSkincare #LiveReveal'
      },
      {
        title: 'Early Customer Reviews Launch Post',
        template: 'The reviews are in! 🌟\n\nWe soft-launched [product name] to a select group of customers last week, and here\'s what they\'re saying:\n\n"[Customer review 1]" - @[customer 1]\n"[Customer review 2]" - @[customer 2]\n"[Customer review 3]" - @[customer 3]\n\nNow available to everyone! [Call to action] #[product hashtag]',
        example: 'The reviews are in! 🌟\n\nWe soft-launched our Comfort+ Mattress to a select group of customers last week, and here\'s what they\'re saying:\n\n"Best sleep of my life! I\'ve never woken up feeling so refreshed." - @sleepyhead22\n"The pressure relief is UNREAL. My back pain is gone!" - @healthyliving\n"Worth every penny. I\'m ordering one for my guest room too." - @homestyler\n\nNow available to everyone! Link in bio to experience the difference. #ComfortPlusSleep'
      }
    ],
    'content-ideas': [
      {
        title: 'Expert Tips Series',
        template: '[Number] [Industry/Topic] Tips from Our Experts 💡\n\n1️⃣ [Tip one]\n2️⃣ [Tip two]\n3️⃣ [Tip three]\n4️⃣ [Tip four]\n5️⃣ [Tip five]\n\nWhich tip are you trying first? Let us know 👇\n\n#[industry hashtag] #ExpertTips #[branded hashtag]',
        example: '5 Sustainable Fashion Tips from Our Experts 💡\n\n1️⃣ Invest in quality basics that last for years\n2️⃣ Look for natural or recycled fibers\n3️⃣ Learn basic mending skills to extend garment life\n4️⃣ Try the 30-wears test before purchasing\n5️⃣ Research brands\' environmental commitments\n\nWhich tip are you trying first? Let us know 👇\n\n#SustainableFashion #ExpertTips #EcoWardrobe'
      },
      {
        title: 'Day in the Life',
        template: 'Ever wonder what goes on behind the scenes at [your company]? Here\'s a day in the life of our [job role]! 📱\n\n⏰ [Morning routine/tasks]\n🕛 [Midday activities]\n🌆 [Afternoon processes]\n\nWhat other behind-the-scenes content would you like to see? 👇 #BehindTheScenes #DayInTheLife #[industry hashtag]',
        example: 'Ever wonder what goes on behind the scenes at Bloom Cosmetics? Here\'s a day in the life of our Product Formulator! 📱\n\n⏰ 8AM: Lab safety checks and reviewing formulation notes\n🕛 12PM: Testing new ingredient combinations\n🌆 3PM: Team meeting to review sample feedback\n\nWhat other behind-the-scenes content would you like to see? 👇 #BehindTheScenes #DayInTheLife #BeautyScience'
      },
      {
        title: 'Trending Challenge Participation',
        template: 'We couldn\'t resist joining the [trending challenge name] challenge! 🤩\n\n[Brief description of how you\'ve adapted the trend to your brand]\n\n@[creator of challenge] thanks for the inspiration!\n\nWho else is loving this trend? #[challenge hashtag] #[industry hashtag]',
        example: 'We couldn\'t resist joining the #TellMeWithoutTellingMe challenge! 🤩\n\nTell me you\'re a coffee enthusiast without telling me you\'re a coffee enthusiast. We\'ll go first: our office has 5 different brewing methods and we debate tasting notes during morning meetings.\n\n@trendycreator thanks for the inspiration!\n\nWho else is loving this trend? #TellMeWithoutTellingMe #CoffeeLovers'
      },
      {
        title: 'Myth Busters',
        template: '👨‍🔬 MYTH BUSTERS: [Topic] Edition 👩‍🔬\n\nMyth #1: "[Common misconception]"\nTRUTH: [Accurate information]\n\nMyth #2: "[Common misconception]"\nTRUTH: [Accurate information]\n\nMyth #3: "[Common misconception]"\nTRUTH: [Accurate information]\n\nDid any of these surprise you? Share this to bust these myths! #MythBusters #[industry hashtag]',
        example: '👨‍🔬 MYTH BUSTERS: Skincare Edition 👩‍🔬\n\nMyth #1: "Expensive products always work better"\nTRUTH: Price doesn\'t determine effectiveness - ingredients and formulation do!\n\nMyth #2: "You need a 10-step routine for good skin"\nTRUTH: Consistency with a few effective products often works better than many products\n\nMyth #3: "Natural ingredients are always safer"\nTRUTH: Both natural and synthetic ingredients can be safe and effective when properly formulated\n\nDid any of these surprise you? Share this to bust these myths! #MythBusters #SkincareFactCheck'
      }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Social Media Content Guide</h2>
      </div>

      <Tabs defaultValue="guide" className="space-y-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="guide">Best Practices</TabsTrigger>
          <TabsTrigger value="templates">Post Templates</TabsTrigger>
          <TabsTrigger value="tools">Tools & Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.filter(c => c.id !== 'free-tools').map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center"
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
              Best Practices for {categories.find(c => c.id === activeCategory)?.label}
            </h3>

            <Accordion type="single" collapsible className="space-y-2">
              {bestPractices[activeCategory].map((practice, index) => (
                <AccordionItem key={index} value={`practice-${index}`} className="border rounded-md p-1">
                  <AccordionTrigger className="px-4 py-2 hover:no-underline">
                    <div className="flex items-center text-left">
                      <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                      <span className="font-medium">{practice.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                    <p className="text-gray-700 mb-2">{practice.description}</p>
                    {practice.example && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mt-2">
                        <p className="text-sm text-gray-600 italic">Example: {practice.example}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.filter(c => c.id !== 'free-tools' && c.id !== 'content-ideas').map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center"
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <Megaphone className="h-5 w-5 mr-2 text-indigo-500" />
              Copy-and-Paste Templates for {categories.find(c => c.id === activeCategory)?.label}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postTemplates[activeCategory].map((template, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      {activeCategory === 'product-promotion' && <ShoppingBag className="h-4 w-4 mr-2 text-blue-500" />}
                      {activeCategory === 'product-teasers' && <Sparkles className="h-4 w-4 mr-2 text-purple-500" />}
                      {activeCategory === 'product-launch' && <Zap className="h-4 w-4 mr-2 text-amber-500" />}
                      {activeCategory === 'content-ideas' && <Lightbulb className="h-4 w-4 mr-2 text-green-500" />}
                      {template.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-3 text-sm whitespace-pre-wrap">
                      {template.template}
                    </div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-3 mb-2">Example:</h4>
                    <div className="text-sm text-gray-600 italic">
                      {template.example}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(template.template)}
                      className="text-xs"
                    >
                      Copy Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-blue-500" />
              Free Tools for Social Media Content Creation
            </h3>
            
            {bestPractices['free-tools'].map((category, index) => (
              <div key={index} className="space-y-4">
                <h4 className="font-medium text-gray-700 flex items-center">
                  {index === 0 && <Image className="h-4 w-4 mr-2 text-pink-500" />}
                  {index === 1 && <Calendar className="h-4 w-4 mr-2 text-green-500" />}
                  {index === 2 && <Megaphone className="h-4 w-4 mr-2 text-amber-500" />}
                  {index === 3 && <Lightbulb className="h-4 w-4 mr-2 text-purple-500" />}
                  {category.title}
                </h4>
                <p className="text-gray-600 text-sm">{category.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {category.tools.map((tool, toolIndex) => (
                    <div key={toolIndex} className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium">{tool.name}</h5>
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                      <a 
                        href={tool.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center"
                      >
                        <Link2 className="h-3 w-3 mr-1" />
                        Visit Website
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 