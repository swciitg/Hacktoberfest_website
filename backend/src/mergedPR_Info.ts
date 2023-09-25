import axios from 'axios';

const hacktoberfestStartDate = new Date('2023-10-01T00:00:00Z');
const hacktoberfestEndDate = new Date('2023-10-31T23:59:59Z');

async function fetchPullRequests(url, access_token) {
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

async function countPullRequestsForUserAndRepo(username, repo, access_token, labels = []) {
  const mergedPullRequestsUrl = `https://api.github.com/search/issues?q=is:pr+is:merged+author:${username}+created:${hacktoberfestStartDate.toISOString()}..${hacktoberfestEndDate.toISOString()}+repo:${repo.owner}/${repo.name}+${labels.map(label => `label:${label.label_type}`).join('+')}`;

  const [mergedPullRequestsData] = await Promise.all([
    fetchPullRequests(mergedPullRequestsUrl, access_token),
  ]);

  if (mergedPullRequestsData) {
    return [mergedPullRequestsData];
  }
}

export default countPullRequestsForUserAndRepo;
