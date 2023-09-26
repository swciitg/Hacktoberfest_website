import { useEffect, useState } from "react";
import Card from "../components/Card/Card"
import axios from "axios";
import { BACKEND_API } from "../api";
import { useCookies } from "react-cookie";
import profile from './profile.svg';

const AllRepos = () => {
    const [iitgRepos, setIitgRepos] = useState();
    const [nonIitgRepos, setNonIitgRepos] = useState();
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
    return (
        <div className="bg-[#2a303c] w-full h-full">
             <div className="absolute top-[8px] right-2 z-10 text-white">
                <a className=" p-[15px] rounded-md transition-all hover:scale-105" href="/hacktoberfest/profile">
                    <img src={profile} width = {35}></img>
                </a>
            </div>
            <div className="absolute top-[40px] right-20 z-10 text-white">
                <a className="bg-[#ffffff26] text-white font-[20px] p-[15px] rounded-md transition-all hover:scale-105" href ="/leaderboard">Leaderboard</a>
            </div>
            <div className="flex flex-col items-center">
                <div className="h-2/5 w-full bg-[#170f1e] flex flex-col items-center">
                    <div className="items-center p-6">
                            <span className="text-white font-bold text-[38.4px]">All Repos</span>
                            <hr color="white"></hr>
                    </div>
                    <div>
                        <div className="pt-24 pb-48">
                            <img src="/Images/swc_hacktober.svg" width={800}></img>
                        </div>
                    </div>
                </div>
            </div>
            <div className="md:pl-24 pl-24 bg-[#170f1e]">
                <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {iitgRepos?.map(row => (
                <Card row={row} key={row.index}/>
                ))}
                </div>
            </div>
            <p className="text-white pt-5 pl-20 bg-[#170f1e] text-[20px]">If you wish to make a contribution to another repository, please complete this form. </p>
            <p className="text-white pb-5 pl-20 bg-[#170f1e] text-[20px]">If your submission is deemed valid, we will gladly accept it:</p>
        </div>
    );
}

export default AllRepos;