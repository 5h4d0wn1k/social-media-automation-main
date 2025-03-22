import { Campaign, CampaignPost, CampaignType, Platform } from '../store';
import { deepseekClient } from './deepseek';
import { getSuggestedHashtags } from './hashtags';
import { v4 as uuidv4 } from 'uuid';
import { callDeepSeekAPI } from './deepseek';

// Types for campaign generation
interface GenerateCampaignParams {
  name: string;
  type: CampaignType;
  platforms: Platform[];
  startDate: string;
  endDate: string;
  description: string;
  targetAudience?: string;
  goals?: string[];
}

interface CampaignTemplate {
  name: string;
  postCount: number;
  description: string;
  phases: Array<{
    name: string;
    durationPercentage: number;
    postTypes: Array<string>;
  }>;
  postTemplates: Record<string, string>;
}

// Campaign templates based on different campaign types
const CAMPAIGN_TEMPLATES: Record<CampaignType, CampaignTemplate> = {
  'product-launch': {
    name: 'Product Launch',
    postCount: 12,
    description: 'A comprehensive campaign for launching a new product or service',
    phases: [
      {
        name: 'Teaser',
        durationPercentage: 30,
        postTypes: ['teaser-close-up', 'teaser-silhouette', 'teaser-mystery']
      },
      {
        name: 'Launch',
        durationPercentage: 20,
        postTypes: ['launch-announcement', 'launch-features', 'launch-demo']
      },
      {
        name: 'Education',
        durationPercentage: 30,
        postTypes: ['product-benefits', 'how-to', 'faq']
      },
      {
        name: 'Social Proof',
        durationPercentage: 20,
        postTypes: ['testimonial', 'user-generated', 'case-study']
      }
    ],
    postTemplates: {
      'teaser-close-up': '👀 Can you guess what\'s coming? Here\'s a sneak peek! Stay tuned for our exciting announcement on {date}. #ComingSoon #{productCategory}',
      'teaser-silhouette': 'Something new is emerging from the shadows... All will be revealed on {date}! #ComingSoon #{brandName}',
      'teaser-mystery': 'The countdown begins! Just {days} days until we reveal something that will change how you {benefit}. Any guesses?',
      'launch-announcement': '🚀 LAUNCHING TODAY! 🚀\n\nIntroducing {productName}: {description}.\n\n✨ {feature1}\n✨ {feature2}\n✨ {feature3}\n\n{callToAction}',
      'launch-features': 'What makes {productName} special?\n\n1️⃣ {feature1}\n2️⃣ {feature2}\n3️⃣ {feature3}\n4️⃣ {feature4}\n\nAvailable now! {link} #NewLaunch',
      'launch-demo': 'See {productName} in action! Watch how it {benefit} in our latest demo. Link in bio! #ProductDemo',
      'product-benefits': 'How {productName} will transform your {use-case}:\n\n✅ {benefit1}\n✅ {benefit2}\n✅ {benefit3}\n\nGet yours today! {callToAction}',
      'how-to': 'How to get the most out of your {productName}:\n\n1. {step1}\n2. {step2}\n3. {step3}\n\nPro tip: {tip}',
      'faq': 'Your top questions about {productName}, answered:\n\nQ: {question1}\nA: {answer1}\n\nQ: {question2}\nA: {answer2}\n\nMore questions? Drop them below!',
      'testimonial': '"I was skeptical at first, but {productName} has completely {benefit}!" - @{customerHandle}\n\nHear what our customers are saying and try it yourself! {link}',
      'user-generated': 'We love seeing how you use {productName}! 💜\n\nShow us your experience by tagging #{brandName} in your posts!',
      'case-study': 'See how @{companyName} achieved {result} using {productName}. Read the full case study: {link} #Success #ROI'
    }
  },
  'event-promotion': {
    name: 'Event Promotion',
    postCount: 10,
    description: 'Promote an upcoming event, webinar, or conference',
    phases: [
      {
        name: 'Announcement',
        durationPercentage: 20,
        postTypes: ['event-announcement', 'save-the-date']
      },
      {
        name: 'Speaker/Feature Highlights',
        durationPercentage: 40,
        postTypes: ['speaker-spotlight', 'agenda-highlight', 'feature-reveal']
      },
      {
        name: 'Registration Push',
        durationPercentage: 30,
        postTypes: ['early-bird', 'registration-reminder', 'last-chance']
      },
      {
        name: 'Final Push',
        durationPercentage: 10,
        postTypes: ['day-before', 'live-event']
      }
    ],
    postTemplates: {
      'event-announcement': '📣 BIG ANNOUNCEMENT! Mark your calendars for {eventName} on {date} at {time}. {description} #SaveTheDate',
      'save-the-date': '🗓️ SAVE THE DATE: {date}\n\nJoin us for {eventName} - {tagline}\n\nDetails coming soon! #SaveTheDate #{eventHashtag}',
      'speaker-spotlight': 'Meet our speaker: {speakerName}, {speakerTitle} at {speakerCompany}.\n\nThey'll be talking about {topic}. Register now to secure your spot! {link}',
      'agenda-highlight': 'What to expect at {eventName}:\n\n⏰ {session1Time}: {session1}\n⏰ {session2Time}: {session2}\n⏰ {session3Time}: {session3}\n\nDon't miss out! {registrationLink}',
      'feature-reveal': 'At {eventName}, you'll experience {feature}! Just one of the many reasons you won't want to miss this. {registrationLink}',
      'early-bird': '🐦 EARLY BIRD SPECIAL! Register for {eventName} before {deadline} and get {discount}! {registrationLink} #EarlyBird',
      'registration-reminder': 'Registration for {eventName} is filling up fast! Secure your spot before it's too late: {registrationLink} #{eventHashtag}',
      'last-chance': '⏰ LAST CHANCE! Registration for {eventName} closes {deadline}. Don't miss out! {registrationLink} #LastChance',
      'day-before': '🔔 TOMORROW'S THE DAY! Final reminder for {eventName}. Check your email for access details and we'll see you there! #{eventHashtag}',
      'live-event': '🔴 WE'RE LIVE! {eventName} is starting now. Join us here: {liveLink} #LiveNow #{eventHashtag}'
    }
  },
  'content-series': {
    name: 'Content Series',
    postCount: 8,
    description: 'A thematic series of posts that educate or entertain your audience',
    phases: [
      {
        name: 'Series Announcement',
        durationPercentage: 10,
        postTypes: ['series-announcement']
      },
      {
        name: 'Content Delivery',
        durationPercentage: 70,
        postTypes: ['series-part', 'series-tip', 'series-highlight']
      },
      {
        name: 'Wrap-Up',
        durationPercentage: 20,
        postTypes: ['series-recap', 'series-next']
      }
    ],
    postTemplates: {
      'series-announcement': '📚 NEW SERIES ALERT! Introducing "{seriesName}" where we'll {seriesDescription} over the next {duration}. Stay tuned! #{seriesHashtag}',
      'series-part': 'Part {number} of our {seriesName} series: {title}\n\n{content}\n\nStay tuned for Part {nextNumber} coming {nextDate}! #{seriesHashtag}',
      'series-tip': '{seriesName} Tip #{number}: {tipTitle}\n\n{tipContent}\n\nYour turn! Share your own tips below. #{seriesHashtag}',
      'series-highlight': 'Highlight from our {seriesName} series: {highlight}\n\nMissed the full content? Check out the link in our bio! #{seriesHashtag}',
      'series-recap': 'That's a wrap on our {seriesName} series! Here's what we covered:\n\n1️⃣ {recap1}\n2️⃣ {recap2}\n3️⃣ {recap3}\n\nWhich was your favorite? #{seriesHashtag}',
      'series-next': 'Thanks for following our {seriesName} series! 💙\n\nWhat topics would you like us to cover next? Drop your suggestions below!'
    }
  },
  'seasonal': {
    name: 'Seasonal Campaign',
    postCount: 6,
    description: 'Campaign tied to a seasonal event or holiday',
    phases: [
      {
        name: 'Pre-Season',
        durationPercentage: 30,
        postTypes: ['seasonal-announcement', 'seasonal-countdown']
      },
      {
        name: 'Main Season',
        durationPercentage: 50,
        postTypes: ['seasonal-offer', 'seasonal-content', 'seasonal-ugc']
      },
      {
        name: 'End of Season',
        durationPercentage: 20,
        postTypes: ['seasonal-last-chance', 'seasonal-thank-you']
      }
    ],
    postTemplates: {
      'seasonal-announcement': '🎉 {season} is coming and we're celebrating with {offer}! Mark your calendars for {startDate}. #{seasonHashtag}',
      'seasonal-countdown': 'Just {days} days until our {season} {event/sale/collection}! Get ready for {teaser}. #{seasonHashtag}',
      'seasonal-offer': 'Our {season} {offer} is now LIVE! {details}\n\nShop now: {link} #Limited #Seasonal',
      'seasonal-content': '{season} {tip/idea/inspiration}: {content}\n\nHow are you celebrating this {season}? Share below! #{seasonHashtag}',
      'seasonal-ugc': 'Show us how you're enjoying {product} this {season}! Tag us and use #{brandHashtag} for a chance to be featured. 📸',
      'seasonal-last-chance': '⏰ LAST DAY of our {season} {offer}! Don't miss out: {link} #LastChance',
      'seasonal-thank-you': 'Thank you for celebrating {season} with us! Stay tuned for more exciting things coming your way. 💙 #{brandHashtag}'
    }
  },
  'awareness': {
    name: 'Awareness Campaign',
    postCount: 7,
    description: 'Raise awareness about a cause, issue, or brand value',
    phases: [
      {
        name: 'Introduction',
        durationPercentage: 20,
        postTypes: ['awareness-intro']
      },
      {
        name: 'Education',
        durationPercentage: 50,
        postTypes: ['awareness-fact', 'awareness-story', 'awareness-myth']
      },
      {
        name: 'Action',
        durationPercentage: 30,
        postTypes: ['awareness-challenge', 'awareness-support', 'awareness-impact']
      }
    ],
    postTemplates: {
      'awareness-intro': 'Today we're launching our campaign for {cause}. Here's why it matters: {reason}\n\nJoin us in making a difference. #{causeHashtag}',
      'awareness-fact': 'Did you know? {fact} about {topic}.\n\nThis is why we're committed to {action}. Learn more: {link} #{causeHashtag}',
      'awareness-story': '{storyOpening}\n\nThis is just one of many stories that drive our mission to {mission}. #{causeHashtag}',
      'awareness-myth': 'MYTH: {myth}\nFACT: {truth}\n\nHelp us spread awareness by sharing this post. #{causeHashtag}',
      'awareness-challenge': 'Take the {challengeName} Challenge!\n\nHere's how:\n1. {step1}\n2. {step2}\n3. {step3}\n\nTag us in your posts! #{challengeHashtag}',
      'awareness-support': 'Want to support {cause}? Here are {number} ways you can help:\n\n✨ {way1}\n✨ {way2}\n✨ {way3}\n\nEvery action counts. #{causeHashtag}',
      'awareness-impact': 'Thanks to your support, we've {achievement}. But our work for {cause} continues.\n\nHelp us reach our next goal: {link} #{causeHashtag}'
    }
  },
  'general': {
    name: 'General Campaign',
    postCount: 5,
    description: 'A flexible campaign template for general marketing purposes',
    phases: [
      {
        name: 'Introduction',
        durationPercentage: 20,
        postTypes: ['intro-post']
      },
      {
        name: 'Core Content',
        durationPercentage: 60,
        postTypes: ['value-post', 'engagement-post', 'educational-post']
      },
      {
        name: 'Call-to-Action',
        durationPercentage: 20,
        postTypes: ['cta-post']
      }
    ],
    postTemplates: {
      'intro-post': 'We're excited to share {topic} with you over the coming weeks! Here's what you can expect: {preview}. #{campaignHashtag}',
      'value-post': 'How {topic} can benefit you:\n\n✨ {benefit1}\n✨ {benefit2}\n✨ {benefit3}\n\nWhich one resonates with you the most? #{campaignHashtag}',
      'engagement-post': '{question} Share your thoughts in the comments below! 👇 We'd love to hear from you. #{campaignHashtag}',
      'educational-post': '{didYouKnow} Here's how it works:\n\n1. {step1}\n2. {step2}\n3. {step3}\n\nLearn more: {link} #{campaignHashtag}',
      'cta-post': 'Ready to {action}? Here's how to get started:\n\n{instructions}\n\n{callToAction} {link} #{campaignHashtag}'
    }
  }
};

/**
 * Generate campaign content using DeepSeek AI
 * @param params Campaign generation parameters
 * @returns A fully structured campaign object
 */
export async function generateCampaign(params: GenerateCampaignParams): Promise<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>> {
  try {
    // Get the template for the specified campaign type
    const template = CAMPAIGN_TEMPLATES[params.type];
    
    // Calculate date range and distribute posts
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    const campaignDuration = endDate.getTime() - startDate.getTime();
    const postsToGenerate = template.postCount;
    
    // Distribute posts across the phases based on duration percentages
    const phasePostCounts = template.phases.map(phase => 
      Math.max(1, Math.round(postsToGenerate * (phase.durationPercentage / 100)))
    );
    
    // Adjust to ensure total post count matches template
    const totalPlannedPosts = phasePostCounts.reduce((a, b) => a + b, 0);
    if (totalPlannedPosts !== postsToGenerate) {
      const diff = postsToGenerate - totalPlannedPosts;
      phasePostCounts[phasePostCounts.length - 1] += diff;
    }
    
    // Define content placeholder for AI to fill
    const contentPlaceholders = {
      productName: params.name,
      brandName: params.name,
      description: params.description,
      targetAudience: params.targetAudience || "our audience",
      goals: params.goals?.join(", ") || "engage our audience"
    };
    
    // Generate campaign posts
    const campaignPosts: CampaignPost[] = [];
    let currentPost = 0;
    let currentDate = new Date(startDate);
    
    for (let phaseIndex = 0; phaseIndex < template.phases.length; phaseIndex++) {
      const phase = template.phases[phaseIndex];
      const phasePosts = phasePostCounts[phaseIndex];
      const phaseDuration = (campaignDuration * phase.durationPercentage) / 100;
      const postInterval = phaseDuration / phasePosts;
      
      for (let i = 0; i < phasePosts; i++) {
        // Select post type for this post
        const postType = phase.postTypes[i % phase.postTypes.length];
        const postTemplate = template.postTemplates[postType];
        
        // Calculate scheduled time for this post
        const scheduledTime = new Date(currentDate.getTime() + (i * postInterval));
        
        // Generate content with AI
        const content = await generatePostContent(
          postTemplate,
          postType,
          params.type,
          params.platforms[0], // Primary platform
          contentPlaceholders
        );
        
        // Generate hashtags
        const hashtags = await getSuggestedHashtags(content, 5);
        
        // Add post to campaign
        campaignPosts.push({
          id: `temp-${currentPost}`,
          content,
          platforms: params.platforms,
          scheduledTime: scheduledTime.toISOString(),
          status: 'draft',
          position: currentPost,
          hashtags
        });
        
        currentPost++;
      }
      
      // Update current date for next phase
      currentDate = new Date(currentDate.getTime() + phaseDuration);
    }
    
    // Create the campaign object
    return {
      name: params.name,
      description: params.description,
      type: params.type,
      status: 'draft',
      startDate: params.startDate,
      endDate: params.endDate,
      platforms: params.platforms,
      targetAudience: params.targetAudience,
      goals: params.goals,
      posts: campaignPosts,
      metrics: {
        impressions: 0,
        engagement: 0,
        clicks: 0,
        conversions: 0
      }
    };
  } catch (error) {
    console.error('Error generating campaign:', error);
    throw new Error('Failed to generate campaign');
  }
}

/**
 * Generate post content for a campaign using DeepSeek AI
 * @param template The post template to use
 * @param postType The type of post being created
 * @param campaignType The overall campaign type
 * @param platform The primary social platform
 * @param placeholders Object with content placeholders
 * @returns Generated post content
 */
async function generatePostContent(
  template: string,
  postType: string,
  campaignType: CampaignType,
  platform: Platform,
  placeholders: Record<string, string>
): Promise<string> {
  try {
    const prompt = `
      Create a social media post for ${platform} based on this template:
      
      "${template}"
      
      This is for a ${campaignType} campaign about ${placeholders.description}.
      Post type: ${postType}
      Target audience: ${placeholders.targetAudience}
      Campaign goals: ${placeholders.goals}
      
      Replace any placeholder values like {productName} with appropriate content about ${placeholders.productName}.
      Make the post engaging, authentic, and optimized for ${platform}.
      
      Return only the final post content with no explanations.
    `;

    const response = await deepseekClient.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a professional social media marketing expert specializing in creating engaging campaign content.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating post content:', error);
    // Provide a fallback if AI generation fails
    return template.replace(/\{(\w+)\}/g, (_, key) => placeholders[key] || key);
  }
}

/**
 * Generate campaign ideas based on business type and goal
 */
export async function generateCampaignIdeas(
  businessType: string,
  campaignGoal: string,
  platforms: Platform[]
): Promise<Array<{ title: string; description: string; type: CampaignType }>> {
  try {
    const prompt = `
      Generate 3 unique marketing campaign ideas for a ${businessType} 
      with the main goal of ${campaignGoal}.
      These campaigns should be optimized for the following platforms: ${platforms.join(', ')}.
      
      For each campaign idea, provide:
      1. A catchy, engaging campaign title (max 10 words)
      2. A brief description explaining the campaign concept (30-50 words)
      3. The most suitable campaign type from this list: product-launch, event-promotion, content-series, seasonal, awareness, general
      
      Format the response as a JSON array with objects containing title, description, and type fields.
    `;

    const response = await callDeepSeekAPI(prompt);
    
    try {
      // Try to parse the JSON from the response
      const jsonStart = response.indexOf('[');
      const jsonEnd = response.lastIndexOf(']') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = response.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonStr);
      }
      
      // If we couldn't find JSON array notation, try object notation
      const altJsonStart = response.indexOf('{');
      const altJsonEnd = response.lastIndexOf('}') + 1;
      
      if (altJsonStart >= 0 && altJsonEnd > altJsonStart) {
        const jsonStr = response.substring(altJsonStart, altJsonEnd);
        const parsed = JSON.parse(jsonStr);
        
        // Check if we got an object with campaigns property
        if (parsed.campaigns && Array.isArray(parsed.campaigns)) {
          return parsed.campaigns;
        }
        
        // If we just got a single campaign object
        if (parsed.title && parsed.description && parsed.type) {
          return [parsed];
        }
      }
      
      // Fallback to mock data if JSON parsing fails
      throw new Error('Failed to parse response');
    } catch (err) {
      console.error('Failed to parse campaign ideas from API response:', err);
      return getMockCampaignIdeas(businessType, campaignGoal);
    }
  } catch (error) {
    console.error('Error generating campaign ideas:', error);
    return getMockCampaignIdeas(businessType, campaignGoal);
  }
}

/**
 * Generate mock campaign ideas (fallback)
 */
function getMockCampaignIdeas(
  businessType: string,
  campaignGoal: string
): Array<{ title: string; description: string; type: CampaignType }> {
  const ideas = [
    {
      title: `${businessType} Launch: Next Level`,
      description: `A product launch campaign showcasing how ${businessType} helps customers achieve ${campaignGoal} with innovative features and solutions.`,
      type: 'product-launch' as CampaignType
    },
    {
      title: `${campaignGoal} Challenge`,
      description: `A content series that engages your audience with daily tips and challenges related to ${campaignGoal}, positioning your ${businessType} as the expert solution.`,
      type: 'content-series' as CampaignType
    },
    {
      title: `${businessType} Awareness Month`,
      description: `An awareness campaign highlighting how your ${businessType} addresses important industry issues and contributes to ${campaignGoal}.`,
      type: 'awareness' as CampaignType
    }
  ];
  
  return ideas;
}

/**
 * Analyze campaign performance and provide recommendations
 * @param campaign The campaign to analyze
 * @returns Analysis and recommendations
 */
export async function analyzeCampaignPerformance(campaign: Campaign): Promise<{
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> {
  try {
    // Prepare campaign metrics for analysis
    const metrics = campaign.metrics || { impressions: 0, engagement: 0, clicks: 0, conversions: 0 };
    const engagementRate = metrics.impressions > 0 ? (metrics.engagement / metrics.impressions) * 100 : 0;
    const clickThroughRate = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
    const conversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
    
    const prompt = `
      Analyze this social media campaign and provide recommendations:
      
      Campaign: "${campaign.name}"
      Type: ${campaign.type}
      Platforms: ${campaign.platforms.join(', ')}
      Duration: ${new Date(campaign.startDate).toLocaleDateString()} to ${new Date(campaign.endDate).toLocaleDateString()}
      
      Performance Metrics:
      - Impressions: ${metrics.impressions}
      - Engagement: ${metrics.engagement} (${engagementRate.toFixed(2)}% engagement rate)
      - Clicks: ${metrics.clicks} (${clickThroughRate.toFixed(2)}% CTR)
      - Conversions: ${metrics.conversions} (${conversionRate.toFixed(2)}% conversion rate)
      
      Post Count: ${campaign.posts.length}
      
      Provide:
      1. A brief analysis (3-4 sentences)
      2. 3 key strengths
      3. 3 areas for improvement
      4. 4 specific recommendations for future campaigns
      
      Format your response with these headings:
      Analysis:
      Strengths:
      - [strength 1]
      - [strength 2]
      - [strength 3]
      Areas for Improvement:
      - [area 1]
      - [area 2]
      - [area 3]
      Recommendations:
      - [recommendation 1]
      - [recommendation 2]
      - [recommendation 3]
      - [recommendation 4]
    `;

    const response = await deepseekClient.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a social media analytics expert who specializes in campaign performance analysis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const content = response.data.choices[0].message.content;
    
    // Parse the response
    const analysisMatch = content.match(/Analysis:(.*?)(?=Strengths:|$)/s);
    const strengthsMatch = content.match(/Strengths:(.*?)(?=Areas for Improvement:|$)/s);
    const weaknessesMatch = content.match(/Areas for Improvement:(.*?)(?=Recommendations:|$)/s);
    const recommendationsMatch = content.match(/Recommendations:(.*?)(?=$)/s);
    
    const analysis = analysisMatch ? analysisMatch[1].trim() : 'Campaign performance analysis not available.';
    
    const strengths = strengthsMatch 
      ? strengthsMatch[1].split('-').filter(s => s.trim().length > 0).map(s => s.trim())
      : ['Good campaign structure', 'Clear targeting', 'Consistent messaging'];
    
    const weaknesses = weaknessesMatch
      ? weaknessesMatch[1].split('-').filter(s => s.trim().length > 0).map(s => s.trim())
      : ['Engagement rate could be improved', 'Limited cross-platform optimization', 'Insufficient testing'];
    
    const recommendations = recommendationsMatch
      ? recommendationsMatch[1].split('-').filter(s => s.trim().length > 0).map(s => s.trim())
      : [
          'Increase post frequency during high engagement times',
          'Test different content formats',
          'Implement A/B testing for captions',
          'Add more platform-specific optimizations'
        ];
    
    return {
      analysis,
      strengths,
      weaknesses,
      recommendations
    };
  } catch (error) {
    console.error('Error analyzing campaign performance:', error);
    // Return fallback analysis
    return {
      analysis: 'Unable to generate AI analysis due to an error. Please check the campaign metrics manually.',
      strengths: ['Campaign successfully completed', 'Multiple posts created', 'Multi-platform approach'],
      weaknesses: ['Performance metrics need review', 'Further optimization possible', 'Additional tracking recommended'],
      recommendations: [
        'Review campaign goals and alignment with results',
        'Consider adjusting content strategy for better engagement',
        'Test different posting times',
        'Implement more precise tracking mechanisms'
      ]
    };
  }
} 