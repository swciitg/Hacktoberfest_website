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
    const pullRequests = [];
    const perPage = 100;
    let page = 1;

    // GitHub returns 30 pull requests by default. Keep requesting pages so the
    // numbers shown on the site represent the repository's complete history.
    while (true) {
      const pullRequestsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        params: {
          state: 'all',
          per_page: perPage,
          page,
        },
        headers: {
          'Authorization': `token ${access_token}`,
          'User-Agent': 'GitHub-Repo-Data-Requester'
        }
      });

      pullRequests.push(...pullRequestsResponse.data);

      if (pullRequestsResponse.data.length < perPage) {
        break;
      }

      page += 1;
    }

    // The list-pull-requests API identifies merged PRs with merged_at. The
    // `merged` boolean is only guaranteed by the single-PR endpoint.
    const mergedPullRequests = pullRequests.filter(pr => pr.merged_at != null);
    return {
      pullRequestCount: pullRequests.length,
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

      repo.pullRequestCount = pull_request_count.pullRequestCount;
      repo.mergedPullRequestCount = pull_request_count.mergedPullRequestCount;
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
