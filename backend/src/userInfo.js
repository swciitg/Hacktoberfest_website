import axios from 'axios';
async function getUserInfo(access_token) {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });

    if (response.status === 200) {
      const userData = response.data;
      return userData;
    } else {
      console.error(`Failed to fetch GitHub profile data. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Looks up a GitHub account by its numeric id, which stays the same across username changes.
async function getUserById(githubId, accessToken) {
  try {
    const headers = { 'User-Agent': 'Hacktoberfest-Leaderboard-Sync' };
    if (accessToken) headers.Authorization = `token ${accessToken}`;
    const response = await axios.get(`https://api.github.com/user/${encodeURIComponent(githubId)}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch GitHub user ${githubId}:`, error.response?.status || error.message);
    return null;
  }
}

export { getUserById };
export default getUserInfo;