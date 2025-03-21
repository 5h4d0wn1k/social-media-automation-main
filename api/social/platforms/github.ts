import { NextApiRequest, NextApiResponse } from 'next';
import { githubConfig } from '../../config';

const GITHUB_API_BASE = 'https://api.github.com';

async function makeGitHubRequest(endpoint: string, method: string = 'GET', body?: any) {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `token ${githubConfig.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

export async function handleGitHubPost(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { content, repository, title } = data;
    
    if (!repository) {
      return res.status(400).json({ error: 'Repository name is required' });
    }

    // Create a new issue
    const response = await makeGitHubRequest(`/repos/${repository}/issues`, 'POST', {
      title,
      body: content,
      labels: ['social-post'],
    });

    return res.status(200).json({ postId: response.number });
  } catch (error) {
    console.error('GitHub Post Error:', error);
    return res.status(500).json({ error: 'Failed to post to GitHub' });
  }
}

export async function handleGitHubAnalytics(req: NextApiRequest, res: NextApiResponse, data: any) {
  try {
    const { postId, repository } = data;

    if (!repository) {
      return res.status(400).json({ error: 'Repository name is required' });
    }

    // Get issue details
    const issue = await makeGitHubRequest(`/repos/${repository}/issues/${postId}`);

    return res.status(200).json({
      likes: issue.reactions['+1'] || 0,
      comments: issue.comments || 0,
      shares: 0, // Not available in GitHub API
      views: 0, // Not available in GitHub API
      engagement: calculateEngagement({
        likes: issue.reactions['+1'] || 0,
        comments: issue.comments || 0,
      }),
    });
  } catch (error) {
    console.error('GitHub Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to fetch GitHub analytics' });
  }
}

function calculateEngagement(metrics: any): number {
  if (!metrics) return 0;
  const totalEngagements = metrics.likes + metrics.comments;
  // Since GitHub doesn't provide view counts, we'll use a default value
  const totalImpressions = 100;
  return (totalEngagements / totalImpressions) * 100;
} 