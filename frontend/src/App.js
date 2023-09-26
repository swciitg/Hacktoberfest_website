import './App.css';
import LeaderPage from './Views/LeaderPage';
import LandingPage from './components/LandingPage/LandingPage';
import RegistrationForm from './components/RegistrationForm/RegistrationForm';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { useCookies } from "react-cookie";
import AllRepos from './Views/AllRepos'
import { BACKEND_API } from './api';

function App() {
  const [cookies] = useCookies(["access_token"]);
  console.log(cookies.access_token);
  if (!cookies.access_token) {
    window.location.href = BACKEND_API + "/auth/github";
  }
  return (
    <BrowserRouter basename='/hacktoberfest'>
      <CookiesProvider>
        <Routes>
          <Route path='/' Component={LandingPage}></Route>
          <Route path='/profile' Component={RegistrationForm}></Route>
          <Route path='/leaderboard' Component={LeaderPage}></Route>
          <Route path='/repos' Component={AllRepos}></Route>
        </Routes>
      </CookiesProvider>
    </BrowserRouter>
  );
}

export default App;