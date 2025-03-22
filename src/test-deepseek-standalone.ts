// Standalone test for DeepSeek API without Vite dependency
import axios from 'axios';

async function testDeepSeekConnection(): Promise<string> {
  // Load directly from .env file values
  const API_KEY = 'sk-90e48d82820a44ecad06ef4e0a1b01b1'; // Your actual API key
  const API_URL = 'https://api.deepseek.com/v1';
  const MODEL = 'deepseek-chat';
  
  try {
    console.log('Testing DeepSeek API connection...');
    console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 5)}...` : 'Not configured');
    console.log('API URL:', API_URL);
    console.log('Model:', MODEL);
    
    const client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    const prompt = "Say hello in one word.";
    const response = await client.post('/chat/completions', {
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 10
    });
    
    console.log('DeepSeek API response status:', response.status);
    console.log('DeepSeek API response data:', response.data);
    
    if (response.status === 200) {
      return `Connection successful! Response: ${response.data.choices[0].message.content}`;
    } else {
      return `Unexpected status code: ${response.status}`;
    }
  } catch (error) {
    console.error('DeepSeek connection test failed:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return 'Authentication failed: Invalid API key. Please check your DeepSeek API key.';
      } else if (error.response) {
        return `API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        return 'No response received from DeepSeek API. Check network or API endpoint URL.';
      }
    }
    
    return `Error testing connection: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function runTest() {
  console.log('Starting standalone DeepSeek connection test...');
  try {
    const result = await testDeepSeekConnection();
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test immediately
runTest(); 