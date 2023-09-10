import Leaderboard from "../components/Leaderboard/Leaderboard";
import Confetti from "react-confetti";
import React, { useState, useRef, useEffect } from "react";
import RegistrationForm from "../components/RegistrationForm/RegistrationForm";

const LeaderPage = () => {
    var data = [
        {
            userID:1,
            Name:'KodudulaAshish',
            git_hub_id:'Ashish',
            score:10
        }
    ]

    const [height, setHeight] = useState(null);
    const [width, setWidth] = useState(null);
    const confetiRef = useRef(null);

    useEffect(() => {
        console.log(confetiRef)
        setHeight(confetiRef.current.clientHeight);
        setWidth(confetiRef.current.clientWidth);
    }, []);

    return(
        <div ref={confetiRef}>
            <Confetti numberOfPieces={150} width={width} height={height} />
            <div className="absolute top-[8px] right-2 z-10 text-white">
                <a className=" p-[15px] rounded-md transition-all hover:scale-105" href="/register">
                    <img src="profile.svg" width = {35}></img>
                </a>
            </div>
            <div className="absolute top-[40px] right-20 z-10 text-white">
                <a className="bg-[#ffffff26] text-white font-[20px] p-[15px] rounded-md transition-all hover:scale-105" href ="/allRepos">All Repos</a>
            </div>
            <div className="flex flex-col items-center">
                <div className="h-2/5 w-full bg-[#170f1e] flex flex-col items-center">
                    <div className="items-center p-6">
                            <span className="text-white font-bold text-[38.4px]">Welcome to Leaderboard</span>
                            <hr color="white"></hr>
                    </div>
                    <div>
                        <div className="pt-24 pb-48">
                            <img src="Images\swc_hacktober.svg" width={800}></img>
                        </div>
                    </div>
                </div>
                <div className="absolute w-3/4 top-2/3">
                    <Leaderboard data={data}></Leaderboard>
                </div>
            </div>
        </div>

    );
}

export default LeaderPage;