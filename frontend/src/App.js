import './App.css';
import LeaderboardPage from './components/LeaderboardPage/LeaderboardPage';
import LandingPage from './components/LandingPage/LandingPage';
import RegistrationForm from './components/RegistrationForm/RegistrationForm';
import LoginPage from './components/LoginPage/LoginPage';
import RepoDetailPage from './components/RepoDetailPage/RepoDetailPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import AllReposPage from './components/AllReposPage/AllReposPage'

function App() {
  return (
    <BrowserRouter basename='/hacktoberfest'>
      <CookiesProvider>
        <Routes>
          <Route path='/' Component={LandingPage}></Route>
          <Route path='/login' Component={LoginPage}></Route>
          <Route path='/profile' Component={RegistrationForm}></Route>
          <Route path='/leaderboard' Component={LeaderboardPage}></Route>
          <Route path='/repos' Component={AllReposPage}></Route>
          <Route path='/repos/:owner/:repo' Component={RepoDetailPage}></Route>
        </Routes>
      </CookiesProvider>
    </BrowserRouter>
  );
}

export default App;