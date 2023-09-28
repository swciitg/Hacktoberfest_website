import { useEffect, useState } from "react";
import Card from "../components/Card/Card"
import axios from "axios";
import { BACKEND_API } from "../api";
import { useCookies } from "react-cookie";
import profile from './profile.svg';
import swclogo from '../components/LandingPage/hacktober_logo.svg';
import logout from "./logout.svg"
const AllRepos = () => {
    const [iitgRepos, setIitgRepos] = useState();
    const [nonIitgRepos, setNonIitgRepos] = useState();
    const [cookies, setCookie, removeCookie] = useCookies();

    useEffect(() => {
        axios
          .get(`${BACKEND_API}/api/repo`, {
            withCredentials: true,
          })
          .then((response) => {
            console.log(response.data);
            let iitgData = response.data.filter((row,index) => {
                return row.type==="IITG";
            })
            setIitgRepos(iitgData.map((row, index) => {
                return {
                  ...row,
                  index: index + 1,
                };
              }));
            let nonIitgData = response.data.filter((row,index) => {
                return row.type!=="IITG";
            })
            setNonIitgRepos(nonIitgData.map((row, index) => {
                return {
                  ...row,
                  index: index + 1,
                };
              }));
          })
          .catch((error) => {
            console.log(error);
          });
    
      }, []);
      
      const handleLogout = () => {
        Object.keys(cookies).forEach(cookieName => {
            removeCookie(cookieName, { path: '/' }); // Remove React cookie
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;           });
        window.location.href = '/hacktoberfest';
        // console.log(cookies.access_token)
      }

  return (
    <div className="bg-[#2a303c] w-full h-full">
      <div className="absolute flex items-center top-[8px] right-2 z-10 text-white">
        <a className="bg-[#ffffff26] text-white font-[20px] p-[15px] rounded-md transition-all hover:scale-105" href="/hacktoberfest/leaderboard">Leaderboard</a>

        <a className=" p-[15px] rounded-md transition-all hover:scale-105" href="/hacktoberfest/profile">
          <img src={profile} width={35}></img>
        </a>
        <button onClick={handleLogout}>
          <img src={logout} width={40}></img>
        </button>
      </div>
      <div className="flex flex-col items-center">
        <div className="h-2/5 w-full bg-[#170f1e] flex flex-col items-center">
          <div className="items-center p-6">
            <span className="text-white font-bold text-[38.4px]">All Repos</span>
            <hr color="white"></hr>
          </div>
          <div>
            <div className="pt-24 pb-24">
              <img src={swclogo} width={800}></img>
            </div>
          </div>
        </div>
      </div>
      <p className="text-white pt-5 pl-20 bg-[#170f1e] text-[20px] pb-16">If you find any more repo suitable to be included here then, fill out this <a href="https://forms.office.com/r/YzX1rQPs2b" className="text-cyan-500">form</a></p>
      <div className="md:pl-24 pl-24 bg-[#170f1e]">
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {iitgRepos?.map(row => (
            <Card row={row} key={row.index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AllRepos;