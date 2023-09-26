import axios from 'axios';

async function getRepoTech(owner, repo, access_token) {
  const languagesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
    headers: {
      'Authorization': `token ${access_token}`,
      'User-Agent': 'GitHub-Repo-Data-Requester'
    }
  });
  return languagesResponse.data;
}

async function getRepo_owner_name(repo_id,access_token){
const repo_data=await axios.get(`https://api.github.com/repositories/${repo_id}`, {
  headers: {
    'Authorization': `token ${access_token}`,
    'User-Agent': 'GitHub-Repo-Data-Requester'
  }
});
return repo_data;

}

async function getRepoInfo(owner, repo, access_token) {
  try {
    const repoInfoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${access_token}`,
        'User-Agent': 'GitHub-Repo-Data-Requester'
      }
    });

    return repoInfoResponse.data;
  } catch (error) {
    console.error('Error fetching repository info:', error.message);
    throw error;
  }
}

async function getRepositorypull_request_count(owner, repo, access_token) {
  try {
    const pullRequestsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, {
      headers: {
        'Authorization': `token ${access_token}`,
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

async function getPRCountsForMultipleRepos(repositories, access_token) {
  try {
    const promises = repositories.map(async (repo) => {
      const owner = repo.owner;
      const name = repo.repo;

      const [techStacks, repoInfo, pull_request_count] = await Promise.all([
        getRepoTech(owner, name, access_token),
        getRepoInfo(owner, name, access_token),
        getRepositorypull_request_count(owner, name, access_token),
      ]);

      repo.pull_request_count = pull_request_count;
      repo.avatar_url = repoInfo.owner.avatar_url;
      repo.techStacks = Object.keys(techStacks);
      repo.description = repoInfo.description;
      repo.starCounts=repoInfo.stargazers_count;
      
      return repo.save();
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error fetching pull request counts:", error.message);
  }
}


export default {getPRCountsForMultipleRepos,getRepoInfo,getRepo_owner_name};