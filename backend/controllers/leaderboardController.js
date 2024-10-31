import UserLeaderboard from '../models/leaderboardModel.js';
import User from '../models/userModel.js';

const getLeaderboard = async (req, res) => {
  try {
    console.log("Fetching leaderboard data...");

    // Fetch all entries from the UserLeaderboard collection
    const leaderboardEntries = await UserLeaderboard.find({}).exec();
    console.log("Leaderboard entries:", leaderboardEntries);

    const leaderboardData = [];
    
    // Iterate through each leaderboard entry
    for (const entry of leaderboardEntries) {
      const github_id = entry.github_id;
      const total_points = entry.points;

      // Fetch user data based on github_id
      const userData = await User.findOne({ github_id });
      if (userData) {
        const { avatar_url, github_username: username } = userData;
        const total_pr_merged = entry.pull_requests_merged;

        // Push the relevant data to the leaderboardData array
        leaderboardData.push({
          username,
          avatar_url,
          total_pr_merged,
          total_points,
        });
      }
    }

    // Sort leaderboard data by total PRs merged in descending order
    leaderboardData.sort((a, b) => b.total_pr_merged - a.total_pr_merged);
    console.log("Sorted leaderboard data:", leaderboardData);

    // Send the sorted leaderboard data as the response
    res.send(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({ error: `Internal server error: ${error.toString()}` });
  }
};


async function updateLeaderboard() {
    const tokens = await UserTokenInfo.find({}).exec();
    const repoArray = [];
    const repos = await HacktoberRepo.find({}).exec();
    try {
      const tokenArray = tokens.map(token => token.access_token);
      const randomIndex = Math.floor(Math.random() * tokenArray.length);
      for (const repo of repos) {
        const repo_name_owner = await getRepo.getRepo_owner_name(repo.repo_id, tokenArray[randomIndex]);
        repo.owner = repo_name_owner.data.owner.login;
        repo.repo = repo_name_owner.data.name;
        const repoObject = {
          name: repo_name_owner.data.name,
          owner: repo_name_owner.data.owner.login,
        };
        repoArray.push(repoObject);
        await repo.save();
      }
      await getRepo.getPRCountsForMultipleRepos(repos, tokenArray[randomIndex]);
      for (const access_token of tokenArray) {
        const userInfo = await UserTokenInfo.findOne({ access_token: access_token });
        const userData = await getUserInfo(access_token);
        if (userData === undefined) { // token invalid
          continue;
        }
        //console.log(userData);
        User.findOne({ github_id: userInfo.github_id })
          .exec()
          .then((existingUser) => {
            if (existingUser) {
              existingUser.github_username = userData.login;
              existingUser.avatar_url = userData.avatar_url;
              return existingUser.save();
            }
          });
        const labels = await githubLabels.find({}).exec();
        const username = userData.login;
        let total_pr_merged = 0;
        let points = 0;
        for (const repo of repoArray) {
          const [merged_pr_Data] = await countPullRequestsForUserAndRepo(username, repo, access_token, labels);
          console.log(merged_pr_Data);
          repo.repo_mergedPR_counts = merged_pr_Data.count;
          total_pr_merged += merged_pr_Data.total_count;
          
          // for (const pr of merged_pr_Data) {
          //   for (const label of pr.labels) {
          //     if (label.name === 'easy') {
          //       points += 5;
          //     } else if (label.name === 'medium') {
          //       points += 10;
          //     } else if (label.name === 'hard') {
          //       points += 20;
          //     }
          //   }
          // }
        }
  
        UserLeaderboard.findOne({ github_id: userInfo.github_id })
          .exec()
          .then((existingLeaderboardData) => {
            if (existingLeaderboardData) {
              existingLeaderboardData.pull_requests_merged = total_pr_merged;
              existingLeaderboardData.points = points;
              return existingLeaderboardData.save();
            } else {
              const leaderboardData = new UserLeaderboard({
                github_id: userInfo.github_id,
                pull_requests_merged: total_pr_merged,
                points: points
              });
              return leaderboardData.save();
            }
          })
          .then(() => {
            console.log("Leaderboard data saved successfully");
          });
      }
    }
    catch (err) {
      //updateLeaderboard(); // again call -> with diff random index
      console.error("Error while saving leaderboard data:", err);
    }
  };


  async function createLeaderboardEntry(github_id) {
    let leaderboardEntry = await UserLeaderboard.findOne({ github_id });
    console.log(leaderboardEntry);
    if (!leaderboardEntry) {
      leaderboardEntry = new UserLeaderboard({ github_id });
      await leaderboardEntry.save();
    }
  };

// Corrected export statement
export { getLeaderboard, updateLeaderboard, createLeaderboardEntry};
