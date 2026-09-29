export const BACKEND_API =
  process.env.REACT_APP_APIURL ||
  (process.env.NODE_ENV === "production"
    ? "/hacktoberfest"
    : "http://localhost:4000/hacktoberfest");
  