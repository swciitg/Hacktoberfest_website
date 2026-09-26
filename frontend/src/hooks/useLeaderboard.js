import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_API } from '../api';

const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BACKEND_API}/api/leaderboard`, { withCredentials: true })
      .then((res) => setLeaderboard(res.data))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false));
  }, []);

  return { leaderboard, loading };
};

export default useLeaderboard;
