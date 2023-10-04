import Leaderboard from "../components/Leaderboard/Leaderboard";
import Confetti from "react-confetti";
import React, { useState, useRef, useEffect } from "react";
import swclogo from '../components/LandingPage/hacktober_logo.svg';
import profile from './profile.svg';
import axios, { all } from "axios";
import { BACKEND_API } from "../api";
import { useCookies } from "react-cookie";
import logout from "./logout.svg"

const LeaderPage = () => {
  const [leaderboard, setLeaderboard] = useState(null);
  const [name, setName] = useState('');
  const [userRankInfo, setUserRankInfo] = useState(null);

  const [cookies, setCookie, removeCookie] = useCookies(['access_token']);

  const [allCookies, , removeAllCookie] = useCookies();


  useEffect(() => {
    axios
      .get(`${BACKEND_API}/api/leaderboard`, {
        withCredentials: true,
      })
      .then((response) => {
        const leaderboardData = response.data.map((row, index) => {
          return {
            ...row,
            index: index + 1,
          };
        });
        setLeaderboard(leaderboardData);
        console.log(leaderboardData);
        console.log(cookies.access_token);
        if (cookies.access_token) {
          console.log("FOUND COOKIE");
          axios
            .get(`${BACKEND_API}/api/profile`, {
              withCredentials: true,
            })
            .then((response) => {
              const {data} = response;
              console.log(data);
              setName(data.userData.github_username);
              let userRank = 0;
              const userRankInfo = leaderboardData.find((e, i) => {
                console.log(e);
                if (data.userData.github_username === e.username) {
                  userRank = i + 1;
                  return true;
                }
                return false;
              });
              console.log(userRankInfo);
              if (userRankInfo) {
                userRankInfo.rank = userRank;
                console.log(userRankInfo);
                setUserRankInfo(userRankInfo);
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  const [height, setHeight] = useState(null);
  const [width, setWidth] = useState(null);
  const confetiRef = useRef(null);

  useEffect(() => {
    setHeight(confetiRef.current.clientHeight);
    setWidth(confetiRef.current.clientWidth);
  }, []);

  const handleLogout = () => {
    Object.keys(allCookies).forEach(cookieName => {
      removeCookie(cookieName, { path: '/' });
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;           });
      window.location.href = '/hacktoberfest';
  }

  return (
    <div ref={confetiRef}>
      <Confetti numberOfPieces={150} width={width} height={height} />
      <div className="absolute flex items-center top-[8px] right-2 z-10 text-white">
      <a className="bg-[#ffffff26] text-white font-[20px] p-4 rounded-md transition-all hover:scale-105" href="/hacktoberfest/repos">All Repos</a>

        <a className=" p-[15px] rounded-md transition-all hover:scale-105" href="/hacktoberfest/profile">
          <img src={profile} width={35}></img>
        </a>
        {
         cookies.access_token ? <button onClick={handleLogout}>
          <img src={logout} width={40}></img>
        </button> : null
        }
     
      </div>
      <div className="flex bg-[#170f1e] h-[200vh] flex-col sm:min-w-screen items-center">
        <div className=" flex flex-col items-center">
          <div className="items-center md:p-6 md:mt-0 mt-24 md:mx-0">
            <span className="text-white font-bold sm:p-0 md:text-[38.4px] text-2xl">Welcome to Leaderboard</span>
            <hr color="white"></hr>
          </div>
          <div>
            <div className="sm:pt-24 pt-8 pb-12 md:mx-0 mx-8">
              <img src={swclogo} width={800}></img>
            </div>
          </div>
          <div className="items-center pb-24 md:mx-0 mx-12">
            <span className="text-white font-bold sm:text-[38.4px] text-2xl">{userRankInfo !== null ? `Your rank: ${userRankInfo.rank} | Total Points : ${userRankInfo.total_points}` : <a href='/hacktoberfest/profile'>Click to Register</a>}</span>
            <hr color="white"></hr>
          </div>
        </div>
        <div className="sm:w-3/4 w-[90vw] -m-12 sm:mx-0 mx-4">
          <Leaderboard data={leaderboard} name={name}></Leaderboard>
        </div>
      </div>
    </div>

  );
}

export default LeaderPage;