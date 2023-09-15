import './App.css';
import LeaderPage from './Views/LeaderPage';
import LandingPage from './components/LandingPage/LandingPage';
import RegistrationForm from './components/RegistrationForm/RegistrationForm';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllRepos from './Views/AllRepos'

function App() {
  return (
    <BrowserRouter >
          <Routes>
        <Route path='/hacktoberfest' Component={LandingPage}></Route>
        <Route path='/hacktoberfest/register' Component = {RegistrationForm}></Route>
        <Route path='/hacktoberfest/leaderboard' Component = {LeaderPage}></Route>
        <Route path='/hacktoberfest/repos' Component={AllRepos}></Route>
      </Routes>
    </BrowserRouter>


  );
}

export default App;
