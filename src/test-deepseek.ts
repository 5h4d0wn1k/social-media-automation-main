import { generateContent, generateImagePrompt } from './lib/ai';
import { Platform } from './lib/store';
import { testDeepSeekConnection } from './lib/api/deepseek';

// Test function to verify DeepSeek integration
async function testDeepSeekIntegration() {
  console.log('Testing DeepSeek Integration...');
  
  try {
    // Test content generation
    console.log('Testing content generation...');
    const content = await generateContent({
      topic: 'Social media automation tools',
      platform: 'twitter' as Platform,
      tone: 'professional',
      length: 'medium'
    });
    
    console.log('Generated content:', content);
    
    // Test image prompt generation
    console.log('\nTesting image prompt generation...');
    const imagePrompt = await generateImagePrompt('Social media dashboard');
    
    console.log('Generated image prompt:', imagePrompt);
    
    console.log('\nTests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Test script for DeepSeek API
async function runTest() {
  console.log('Starting DeepSeek connection test...');
  try {
    const result = await testDeepSeekConnection();
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testDeepSeekIntegration();
runTest();

// Export the test function for possible reuse
export { testDeepSeekIntegration }; 