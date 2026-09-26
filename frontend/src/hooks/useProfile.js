import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_API } from '../api';

const useProfile = () => {
  const [cookies] = useCookies(['access_token']);
  const isLoggedIn = Boolean(cookies.access_token);
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(!isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;
    axios
      .get(`${BACKEND_API}/api/profile`, { withCredentials: true })
      .then((res) => setProfile(res.data.userData || null))
      .catch(() => setProfile(null))
      .finally(() => setLoaded(true));
  }, [isLoggedIn]);

  return { isLoggedIn, profile, loaded };
};

export default useProfile;
