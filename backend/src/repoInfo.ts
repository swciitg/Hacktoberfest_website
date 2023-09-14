import axios from 'axios';

async function getRepoTech(owner, repo, accessToken) {
  const languagesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
    headers: {
      'Authorization': `token ${accessToken}`,
      'User-Agent': 'GitHub-Repo-Data-Requester'
    }
  });
  return languagesResponse.data;
}

async function getRepo_owner_name(repo_id,accessToken){
const repo_data=await axios.get(`https://api.github.com/repositories/${repo_id}`, {
  headers: {
    'Authorization': `token ${accessToken}`,
    'User-Agent': 'GitHub-Repo-Data-Requester'
  }
});
return repo_data;

}

async function getRepoInfo(owner, repo, accessToken) {
  try {
    const repoInfoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'GitHub-Repo-Data-Requester'
      }
    });

    return repoInfoResponse.data;
  } catch (error) {
    console.error('Error fetching repository info:', error.message);
    throw error;
  }
}

async function getRepositoryPullRequestCounts(owner, repo, accessToken) {
  try {
    const pullRequestsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'GitHub-Repo-Data-Requester'
      }
    });

    const mergedPullRequests = pullRequestsResponse.data.filter(pr => pr.state === 'closed' || pr.merged);

    return {
      pullRequestCount: pullRequestsResponse.data.length,
      mergedPullRequestCount: mergedPullRequests.length,
    };
  } catch (error) {
    console.error('Error fetching pull request counts:', error.message);
    throw error;
  }
}

async function getPRCountsForMultipleRepos(repositories, accessToken) {
  const pullRequestCountsArray = [];

  for (const repo of repositories) {
    const owner = repo.owner;
    const name = repo.name;

    try {
      const techStacks = Object.keys(await getRepoTech(owner, name, accessToken));
      const repoInfo = await getRepoInfo(owner, name, accessToken);
        console.log(repoInfo);
      const pullRequestCounts = await getRepositoryPullRequestCounts(owner, name, accessToken);
      pullRequestCountsArray.push({
        owner,
        repo: name,
        ownerProfileImage: repoInfo.owner.avatar_url,
        techStacks,
        starsCount: repoInfo.stargazers_count,
        description: repoInfo.description,
        pullRequestCounts,
      });
    } catch (error) {
      console.error(`Error fetching pull request counts for repository ${owner}/${name}:`, error.message);
    }
  }

  return pullRequestCountsArray;
}

export default {getPRCountsForMultipleRepos,getRepoInfo,getRepo_owner_name};
