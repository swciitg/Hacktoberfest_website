import { BACKEND_API } from '../api';

export const loginWithGithub = () => {
  window.location.href = `${BACKEND_API}/auth/github`;
};

// The backend has no logout route; the session lives in client-readable cookies.
export const logout = () => {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  window.location.href = process.env.PUBLIC_URL || '/';
};
