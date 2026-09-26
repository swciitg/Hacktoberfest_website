import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_API } from '../api';

const useRepos = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BACKEND_API}/api/repo`, { withCredentials: true })
      .then((res) => setRepos(res.data))
      .catch(() => setRepos([]))
      .finally(() => setLoading(false));
  }, []);

  return { repos, loading };
};

export default useRepos;
