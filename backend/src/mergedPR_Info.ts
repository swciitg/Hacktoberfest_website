const hacktoberfestStartDate = new Date('2023-10-01T00:00:00Z');
const hacktoberfestEndDate = new Date('2023-10-31T23:59:59Z');
import axios from 'axios';

async function fetchPullRequests(url,access_token) {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error(`Failed to fetch pull requests. Status code: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('An error occurred while fetching pull requests:', error.message);
    return null;
  }
}

async function countPullRequestsForUserAndRepo(username, repo,access_token) {
  const pullRequestsUrl = `https://api.github.com/search/issues?q=is:pr+is:closed+author:${username}+created:${hacktoberfestStartDate.toISOString()}..${hacktoberfestEndDate.toISOString()}+repo:${repo.owner}/${repo.name}`;
  const mergedPullRequestsUrl = `https://api.github.com/search/issues?q=is:pr+is:merged+author:${username}+created:${hacktoberfestStartDate.toISOString()}..${hacktoberfestEndDate.toISOString()}+repo:${repo.owner}/${repo.name}`;

  const [pullRequestsData, mergedPullRequestsData] = await Promise.all([
    fetchPullRequests(pullRequestsUrl,access_token),
    fetchPullRequests(mergedPullRequestsUrl,access_token),
  ]);

  if (pullRequestsData && mergedPullRequestsData) {
    
   return [pullRequestsData,mergedPullRequestsData];
    
  }
}

export default countPullRequestsForUserAndRepo;
