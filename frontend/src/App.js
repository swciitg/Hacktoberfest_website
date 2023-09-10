import logo from './logo.svg';
import './App.css';
import LeaderPage from './Views/LeaderPage';
import LandingPage from './components/LandingPage/LandingPage';
import RegistrationForm from './components/RegistrationForm/RegistrationForm';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllRepos from './Views/AllRepos'

function App() {

  var data = [
    {
        userID:1,
        git_hub_id:'kafof',
        Name:'aaaaaaa',
        score:11,
    },
    {
        userID:1,
        git_hub_id:'afao f',
        Name:'aagjlr f',
        score:22,
    }
]

  return (
    <BrowserRouter >
          <Routes>
        <Route path='/' Component={LandingPage}></Route>
        <Route path='/register' Component = {RegistrationForm}></Route>
        <Route path='/leaderboard' Component = {LeaderPage}></Route>
        <Route path='/AllRepos' Component={AllRepos}></Route>
      </Routes>
    </BrowserRouter>


  );
}

export default App;
