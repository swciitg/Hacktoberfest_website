import Leaderboard from "../components/Leaderboard/Leaderboard";
import Confetti from "react-confetti";
import React, { useState, useRef, useEffect } from "react";
import swclogo from '../components/LandingPage/hacktober_logo.svg';
import profile from './profile.svg';
import axios from "axios";
import { BACKEND_API } from "../api";

const LeaderPage = () => {
    const [leaderboard, setLeaderboard] = useState();
    const [name, setName] = useState();
    useEffect(() => {
        axios
          .get(`${BACKEND_API}/api/leaderboard`, {
            withCredentials: true,
          })
          .then((response) => {
            const data = response.data.map((row, index) => {
                return {
                  ...row,
                  index: index + 1,
                };
              });
              setLeaderboard(data);
          })
          .catch((error) => {
            console.log(error);
          });

          axios
          .get(`${BACKEND_API}/api/profile`, {
            withCredentials: true,
          })
          .then((response) => {
            const data = response.data;
              setName(data.userData.login);
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

    return(
        <div ref={confetiRef}>
            <Confetti numberOfPieces={150} width={width} height={height} />
            <div className="absolute top-[8px] right-2 z-10 text-white">
                <a className=" p-[15px] rounded-md transition-all hover:scale-105" href="/hacktoberfest/profile">
                    <img src={profile} width = {35}></img>
                </a>
            </div>
            <div className="absolute top-[40px] right-20 z-10 text-white">
                <a className="bg-[#ffffff26] text-white font-[20px] p-[15px] rounded-md transition-all hover:scale-105" href ="/hacktoberfest/repos">All Repos</a>
            </div>
            <div className="flex flex-col items-center">
                <div className="h-2/5 w-full bg-[#170f1e] flex flex-col items-center">
                    <div className="items-center p-6">
                            <span className="text-white font-bold text-[38.4px]">Welcome to Leaderboard</span>
                            <hr color="white"></hr>
                    </div>
                    <div>
                        <div className="pt-24 pb-48">
                            <img src={swclogo} width={800}></img>
                        </div>
                    </div>
                </div>
                <div className="absolute w-3/4 top-2/3">
                    <Leaderboard data={leaderboard} name={name}></Leaderboard>
                </div>
            </div>
        </div>

    );
}

export default LeaderPage;