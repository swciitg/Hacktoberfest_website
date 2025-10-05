import { useEffect, useState } from "react";
import Card from "../components/Card/Card"
import axios from "axios";
import { BACKEND_API } from "../api";
import { useCookies } from "react-cookie";
import profile from './profile.svg';
import swclogo from '../components/LandingPage/hacktober_logo.svg';
import logout from "./logout.svg"
import Footer from "../components/Footer/footer";
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
    <>
    <div className="bg-[#170f1e] w-full min-h-screen">
      <div className="absolute flex items-center top-[8px] right-2 z-10 text-white">
        <a className="bg-[#ffffff26] text-white font-[20px] p-[15px] rounded-md transition-all hover:scale-105" href="/hacktoberfest/leaderboard">Leaderboard</a>

        <a className=" p-[15px] rounded-md transition-all hover:scale-105" href="/hacktoberfest/profile">
          <img src={profile} width={35}></img>
        </a>
        {
         cookies.access_token ? <button onClick={handleLogout}>
          <img src={logout} width={40}></img>
        </button> : null
        }
      </div>
      <div className="flex flex-col items-center">
        <div className="h-2/5 w-full  flex flex-col items-center">
          <div className="items-center sm:p-6 pt-24 pb-4">
            <span className="text-white font-bold sm:text-[38.4px] text-2xl">All Repos</span>
            <hr color="white"></hr>
          </div>
          <div>
            <div className="sm:pt-24 sm:pb-24 pb-12 mx-8">
              <img src='https://hacktoberfest.com/_next/static/media/heroicon-animation.dd8cd700.gif' width={400}></img>
            </div>
          </div>
        </div>
      </div>
      <div className="">
      <div className="text-white font-bold sm:text-[38.4px] text-2xl my-5 px-4 mobile:px-12">Our Selected Repos</div>
        <div className="md:grid flex flex-col md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 py-10 sm:mx-12">
          {iitgRepos?.map(row => (
            <Card row={row} key={row.index} />
          ))}
        </div>
      </div>
      <div className=" text-center sm:text-start">
      <div className="text-white font-bold sm:text-[38.4px] text-2xl mt-5 my-5 sm:px-12">External Repos</div>
        <div className="md:grid flex flex-col md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 py-10 sm:mx-12">
          {nonIitgRepos?.map(row => (
            <Card row={row} key={row.index} />
          ))}
        </div>
      </div>
      <p className="text-white sm:text-start sm:px-0 px-2 text-center pt-5 sm:pl-20 bg-[#170f1e] sm:text-[20px] text-lg pb-16">If you find any more repo suitable to be included here then, fill out this <a href="https://forms.office.com/r/YzX1rQPs2b" className="text-cyan-500">form</a></p>
    </div>
    <Footer/>
    </>
  );
}

export default AllRepos;
