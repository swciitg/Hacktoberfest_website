import logo from './logo.svg';
import './App.css';
import LeaderPage from './Views/LeaderPage';

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
    // <Router>
    //   <Routes>
    //     <Route path='/' element = {/LeaderPage}></Route>
    //   </Routes>
    // </Router>
    <LeaderPage/>
  );
}

export default App;
