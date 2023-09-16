var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
function getRepoTech(owner, repo, access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        const languagesResponse = yield axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
            headers: {
                'Authorization': `token ${access_token}`,
                'User-Agent': 'GitHub-Repo-Data-Requester'
            }
        });
        return languagesResponse.data;
    });
}
function getRepo_owner_name(repo_id, access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        const repo_data = yield axios.get(`https://api.github.com/repositories/${repo_id}`, {
            headers: {
                'Authorization': `token ${access_token}`,
                'User-Agent': 'GitHub-Repo-Data-Requester'
            }
        });
        return repo_data;
    });
}
function getRepoInfo(owner, repo, access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repoInfoResponse = yield axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    'Authorization': `token ${access_token}`,
                    'User-Agent': 'GitHub-Repo-Data-Requester'
                }
            });
            return repoInfoResponse.data;
        }
        catch (error) {
            console.error('Error fetching repository info:', error.message);
            throw error;
        }
    });
}
function getRepositorypull_request_count(owner, repo, access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pullRequestsResponse = yield axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, {
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
        }
        catch (error) {
            console.error('Error fetching pull request counts:', error.message);
            throw error;
        }
    });
}
function getPRCountsForMultipleRepos(repositories, access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promises = repositories.map((repo) => __awaiter(this, void 0, void 0, function* () {
                const owner = repo.owner;
                const name = repo.repo;
                const [techStacks, repoInfo, pull_request_count] = yield Promise.all([
                    getRepoTech(owner, name, access_token),
                    getRepoInfo(owner, name, access_token),
                    getRepositorypull_request_count(owner, name, access_token),
                ]);
                repo.pull_request_count = pull_request_count;
                repo.avatar_url = repoInfo.owner.avatar_url;
                repo.techStacks = Object.keys(techStacks);
                repo.description = repoInfo.description;
                repo.starCounts = repoInfo.stargazers_count;
                return repo.save();
            }));
            yield Promise.all(promises);
        }
        catch (error) {
            console.error("Error fetching pull request counts:", error.message);
        }
    });
}
export default { getPRCountsForMultipleRepos, getRepoInfo, getRepo_owner_name };
