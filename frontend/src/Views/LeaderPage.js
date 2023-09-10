import Leaderboard from "../components/Leaderboard/Leaderboard";
import Confetti from "react-confetti";
import React, { useState, useRef, useEffect } from "react";

const LeaderPage = () => {
    var data = [
        {
            userID:1,
            Name:'aaaaa'
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
                <button className=" p-[15px] rounded-md transition-all hover:scale-105">
                    <img src="profile.svg" width = {35}></img>
                </button>
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