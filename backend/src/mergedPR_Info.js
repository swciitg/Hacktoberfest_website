import axios from 'axios';
import AdminControl from '../models/adminControl.js';
import moment from 'moment-timezone';

// Default start and end dates
let hacktoberfestStartDate = new Date('2024-10-05T00:00:00Z');
let hacktoberfestEndDate = new Date('2024-10-31T23:59:59Z');

// Get the start and end date from the database
const adminControl = await AdminControl.findOne({});

if (adminControl) {
    // convert the dates to IST
    hacktoberfestStartDate = moment(adminControl.hacktoberFestStartDate).tz('Asia/Kolkata').toDate();
    hacktoberfestEndDate = moment(adminControl.hacktoberFestEndDate).tz('Asia/Kolkata').toDate();
    console.log("Setting Hacktoberfest start and end date from database in IST");
    // display dates in IST
    console.log("Hacktoberfest start date (IST): ", hacktoberfestStartDate.toLocaleString());
    console.log("Hacktoberfest end date (IST): ", hacktoberfestEndDate.toLocaleString());
} else {
    console.log("Setting Hacktoberfest start and end date from default values");
    // display dates in IST
    console.log("Hacktoberfest start date (IST): ", hacktoberfestStartDate.toLocaleString());
    console.log("Hacktoberfest end date (IST): ", hacktoberfestEndDate.toLocaleString());
}

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
