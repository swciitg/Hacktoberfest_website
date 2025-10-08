import { useState,useEffect,useRef } from "react";
const Footer = () => {
    const [margin, setmargin] = useState()

window.addEventListener('resize',()=>{
    setmargin(window.innerWidth)
})

    function getCurrentYear () {
        return new Date().getFullYear();
    }
  
    return (
        <div className="bg-[#170f1e] text-white flex flex-col bg-specialgrey mb-0  bottom-0">
            <div className=" flex flex-col lg:flex-row justify-evenly  pt-8">
                <div className=" flex flex-col  basis-1 lg:basis-1/3">
                    <div className="font-Inter text-2xl md:text-6xl xl:text-6xl leading-tight md:text-center mx-auto">Get in touch! <p className="hidden lg:inline">&nbsp;</p></div>
                    <div className={`flex my-4  ${window.innerWidth < 420 ? `mx-[15px] justify-between` : 'mx-5 justify-around'}`}>
                        <div className="flex flex-col ">
                            <div className="flex text-greyuse">SWC, New SAC</div>
                            <div className="flex text-greyuse">IIT Guwahati</div>
                            <div className="flex text-greyuse">Assam 781039</div>
                        </div>
                        <div className="flex flex-col pr-0 "> 
                            <div className="flex text-greyuse"> <a href='mailto:swc@iitg.ac.in'> swc@iitg.ac.in </a></div>
                            <div className="flex text-greyuse">+91 6264241367</div>
                        </div>
                    </div>
                </div>
                <div className="lg:border-l-[1px] lg:border-white"></div>
                <div  className="justify-around lg:basis-2/5 flex ml-4 md:ml-0">
                    <div className="flex flex-col">
                        <div className="flex font-Inter text-1xl font-bold leading-6 tracking-wider mb-3">Important Links</div>
                        <a href="https://github.com/swciitg" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">Github</a>
                        <a href="/swc/team" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">Team</a>
                        <a href="/swc/products" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">Products</a>
                        {/* <a href="/swc/hiring" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">Apply Now!</a> */}
                    </div>
                   
                    <div className="flex flex-col">
                        <a href="" className="flex font-Inter text-1xl font-bold leading-6 tracking-wider mb-3">Gymkhana Sites</a>
                        <a href="https://www.iitg.ac.in/stud/gymkhana/" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">Gymkhana Portal</a>
                        <a href="https://intranet.iitg.ac.in/saportal/" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">SA Portal</a>
                        <a href="https://swc.iitg.ac.in/hab/" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">HAB Portal</a>
                        <a href="https://swc.iitg.ac.in/sports-board/" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">Sports Board</a>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex font-Inter text-1xl font-bold leading-6 tracking-wider mb-3">Our Products</div>
                        <a href="https://iitg.ac.in/placements/" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">Placement Portal</a>
                        <a href="https://swc.iitg.ac.in/election_portal/" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">Election Portal</a>
                        <a href="https://play.google.com/store/apps/details?id=com.swciitg.onestop2" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">One Stop</a>
                        {/* <a href="https://swc.iitg.ac.in/journeys/" className="flex text-greyuse sm:text-sm text-xs font-normal leading-6 hover:underline">Journeys</a> */}
                    </div>
                    {/* <div className="flex flex-col">
                        <div className="flex font-Inter text-lg sm:text-xl font-bold leading-6 tracking-wider mb-3">Teams</div>
                        <div className="flex text-greyuse sm:text-sm text-xs font-normal leading-6">Frontend</div>
                        <div className="flex text-greyuse sm:text-sm text-xs font-normal leading-6">Backend</div>
                        <div className="flex text-greyuse sm:text-sm text-xs font-normal leading-6">Design</div>
                        <div className="flex text-greyuse sm:text-sm text-xs font-normal leading-6">App</div>
                        <div className="flex text-greyuse sm:text-sm text-xs font-normal leading-6">Growth</div>
                        <div className="flex text-greyuse sm:text-sm text-xs font-normal leading-6">Management</div>
                    </div> */}
                </div>
            </div>
            <div className="flex justify-center basis-1/3 mt-8 mb-6">
                <div className="flex justify-between w-4/5  border-t border-greyuse">
                    <div className="flex pl-3 pt-4 font-Inter font-normal text-xs leading-4 text-greyuse">@ {getCurrentYear()} Students Web Committee</div>
                    <div className="flex pt-4">
                        <div className="flex mr-3">
                            <a href='https://www.facebook.com/swciitg/' target="_blank">
                            <img src="Images/Facebook.png"
                                width={15}
                                height={15}
                                alt="Icon not found" />
                                </a>
                        </div>
                        <div className="flex mr-3">
                            <a href='https://www.instagram.com/swc_iitg/' target="_blank">
                            <img src="Images/Instagram.png"
                                width={15}
                                height={15}
                                alt="Icon not found" />
                                </a>
                        </div>
                        <div className="flex mr-3">
                            <a href='https://in.linkedin.com/company/student-s-web-committee-iitg' target="_blank">
                            <img src="Images/LinkedIn.png"
                                width={15}
                                height={15}
                                alt="Icon not found" />
                                </a>
                        </div>
                        <div className="flex">
                            <a href='https://twitter.com/swciitghy' target="_blank">
                            <img src="Images/Twitter.png"
                                width={15}
                                height={15}
                                alt="Icon not found" />
                                </a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Footer;