import axios from 'axios';
import AdminControl from '../models/adminControl.js';
import moment from 'moment-timezone';

/**
 * Dynamically retrieves Hacktoberfest start and end dates from the database.
 * Falls back to default dates if not configured.
 */
async function getHacktoberfestDates() {
  try {
    const adminControl = await AdminControl.findOne({});
    if (adminControl && adminControl.hacktoberFestStartDate && adminControl.hacktoberFestEndDate) {
      const startDate = moment(adminControl.hacktoberFestStartDate).tz('Asia/Kolkata').toDate();
      const endDate = moment(adminControl.hacktoberFestEndDate).tz('Asia/Kolkata').toDate();
      return { startDate, endDate };
    }
  } catch (error) {
    console.error("Error retrieving Hacktoberfest dates from database:", error.message);
  }

  // Fallback defaults (defaults to Hacktoberfest 2025 event dates)
  return {
    startDate: new Date('2025-10-01T00:00:00Z'),
    endDate: new Date('2025-10-31T23:59:59Z')
  };
}

/**
 * Fetches all merged PRs for a given repository within the Hacktoberfest date window.
 * Uses pagination (per_page=100) to ensure all merged PRs are fetched.
 * Optionally filters by approved labels in JavaScript (OR logic) if configured.
 *
 * @param {string} owner - Repository owner (e.g. 'swciitg')
 * @param {string} repo - Repository name (e.g. 'Hacktoberfest_website')
 * @param {string} [accessToken] - GitHub token (server PAT or user token)
 * @param {Array} [labels] - Optional list of approved labels
 * @param {Date} [customStartDate] - Optional override start date
 * @param {Date} [customEndDate] - Optional override end date
 * @returns {Promise<Array>} Array of PR objects from GitHub
 */
async function fetchMergedPRsForRepo(owner, repo, accessToken = null, labels = [], customStartDate = null, customEndDate = null) {
  try {
    let startDate = customStartDate;
    let endDate = customEndDate;

    if (!startDate || !endDate) {
      const dates = await getHacktoberfestDates();
      startDate = dates.startDate;
      endDate = dates.endDate;
    }

    const startIso = startDate instanceof Date ? startDate.toISOString() : new Date(startDate).toISOString();
    const endIso = endDate instanceof Date ? endDate.toISOString() : new Date(endDate).toISOString();

    const headers = {
      'User-Agent': 'Hacktoberfest-Leaderboard-Sync',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    }

    const mergedPRs = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const query = `is:pr is:merged repo:${owner}/${repo} created:${startIso}..${endIso}`;
      const url = 'https://api.github.com/search/issues';

      const response = await axios.get(url, {
        params: {
          q: query,
          per_page: perPage,
          page: page
        },
        headers: headers
      });

      if (response.status === 200 && response.data && response.data.items) {
        mergedPRs.push(...response.data.items);

        // Terminate loop once all items are collected or last page reached
        if (mergedPRs.length >= response.data.total_count || response.data.items.length < perPage) {
          break;
        }
        page += 1;
      } else {
        console.warn(`Unexpected response fetching merged PRs for ${owner}/${repo}: status ${response.status}`);
        break;
      }
    }

    // If labels are configured in the database, filter PRs having at least one approved label (OR logic)
    if (labels && labels.length > 0) {
      const approvedLabelNames = new Set(
        labels.map(l => (typeof l === 'string' ? l : l.label_type || l.name || '').toLowerCase()).filter(Boolean)
      );
      if (approvedLabelNames.size > 0) {
        return mergedPRs.filter(pr =>
          Array.isArray(pr.labels) && pr.labels.some(l => approvedLabelNames.has((l.name || '').toLowerCase()))
        );
      }
    }

    return mergedPRs;
  } catch (error) {
    console.error(`Error fetching merged PRs for ${owner}/${repo}:`, error.response?.data?.message || error.message);
    return [];
  }
}

/**
 * Legacy helper for backwards compatibility.
 */
async function countPullRequestsForUserAndRepo(username, repo, accessToken, labels = []) {
  try {
    const dates = await getHacktoberfestDates();
    const repoOwner = repo.owner;
    const repoName = repo.repo || repo.name;
    const allRepoPRs = await fetchMergedPRsForRepo(repoOwner, repoName, accessToken, labels, dates.startDate, dates.endDate);
    const userPRs = allRepoPRs.filter(pr => pr.user && pr.user.login?.toLowerCase() === username.toLowerCase());

    return [{
      total_count: userPRs.length,
      count: userPRs.length,
      items: userPRs
    }];
  } catch (error) {
    console.error(`Error in countPullRequestsForUserAndRepo for ${username}:`, error.message);
    return [{
      total_count: 0,
      count: 0,
      items: []
    }];
  }
}

export { fetchMergedPRsForRepo, getHacktoberfestDates, countPullRequestsForUserAndRepo };
export default countPullRequestsForUserAndRepo;
