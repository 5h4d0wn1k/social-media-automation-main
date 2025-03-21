import { Octokit } from '@octokit/rest';
import { Platform } from '../store';

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

export async function postToGitHub(content: string, imageUrl?: string): Promise<string> {
  try {
    // Create a new repository or use an existing one
    const repoName = process.env.GITHUB_REPO_NAME || 'social-posts';
    const owner = process.env.GITHUB_USERNAME;

    // Create a new file in the repository
    const fileName = `posts/${Date.now()}.md`;
    const fileContent = `${content}\n\n${imageUrl ? `![Image](${imageUrl})` : ''}`;

    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: fileName,
      message: 'New social post',
      content: Buffer.from(fileContent).toString('base64'),
    });

    return response.data.content.sha;
  } catch (error) {
    console.error('Error posting to GitHub:', error);
    throw new Error('Failed to post to GitHub');
  }
}

export async function getGitHubAnalytics(postId: string) {
  try {
    // Note: GitHub's API doesn't provide direct analytics for repository content
    // This is a simplified version that returns basic repository stats
    const owner = process.env.GITHUB_USERNAME;
    const repo = process.env.GITHUB_REPO_NAME || 'social-posts';

    const [repoResponse, viewsResponse] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.repos.getViews({ owner, repo }),
    ]);

    const stats = repoResponse.data;
    const views = viewsResponse.data.views[viewsResponse.data.views.length - 1];

    return {
      likes: stats.stargazers_count || 0,
      comments: 0, // Comments are not tracked in this context
      shares: 0, // Shares are not tracked in this context
      views: views.count || 0,
      engagement: calculateEngagement(stats, views),
    };
  } catch (error) {
    console.error('Error fetching GitHub analytics:', error);
    throw new Error('Failed to fetch GitHub analytics');
  }
}

function calculateEngagement(stats: any, views: any): number {
  if (!stats || !views) return 0;
  const totalEngagements = stats.stargazers_count || 0;
  const totalViews = views.count || 1;
  return (totalEngagements / totalViews) * 100;
} 