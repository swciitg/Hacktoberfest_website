import { asset as A } from '../../utils/asset';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="relative z-[2] bg-[#08080a] text-[#f8f8f8]">
            <img src={A('divider-line.svg')} alt="" className="block w-full h-px" aria-hidden="true" />
            <div className="flex flex-col lg:flex-row justify-between px-8 lg:px-[120px] pt-16 pb-8 gap-10">
                {/* Branding col */}
                <div className="flex flex-col gap-4 max-w-[200px]">
                    <div className="flex items-center gap-3">
                        <img src={A('invader-footer.svg')} alt="Hacktober" className="w-9 h-7" />
                        <span className="font-['Pixelify_Sans',monospace] font-semibold text-xl tracking-[1.32px]">
                            HACKTOBER
                        </span>
                    </div>
                    <p className="text-sm leading-[22px] text-[#f8f8f8]">
                        A month-long coding competition by the Students&apos; Web Committee, IIT Guwahati.
                    </p>
                </div>

                {/* Links cols */}
                <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 text-[16px] tracking-[2.88px]">
                    {/* Contact */}
                    <div className="flex flex-col gap-6 text-[#f8f8f8]">
                        <p>SWC New Sac</p>
                        <p>IIT GUWAHATI</p>
                        <p>Assam 781039</p>
                        <a href="mailto:swc@iitg.ac.in" className="hover:underline">swc@iitg.ac.in</a>
                        <p>+91 6264241367</p>
                    </div>

                    {/* Important Links */}
                    <div className="flex flex-col gap-6">
                        <p className="font-bold">IMPORTANT LINKS</p>
                        <a href="https://github.com/swciitg" target="_blank" rel="noreferrer" className="font-normal hover:underline">Github</a>
                        <a href="/swc/team" className="font-normal hover:underline">Team</a>
                        <a href="/swc/products" className="font-normal hover:underline">Products</a>
                    </div>

                    {/* Gymkhana */}
                    <div className="flex flex-col gap-6">
                        <p className="font-bold">GYMKHANA SITES</p>
                        <a href="https://www.iitg.ac.in/stud/gymkhana/" target="_blank" rel="noreferrer" className="font-normal hover:underline">Gymkhana portal</a>
                        <a href="https://intranet.iitg.ac.in/saportal/" target="_blank" rel="noreferrer" className="font-normal hover:underline">SA Portal</a>
                        <a href="https://swc.iitg.ac.in/hab/" target="_blank" rel="noreferrer" className="font-normal hover:underline">HAB Portal</a>
                        <a href="https://swc.iitg.ac.in/sports-board/" target="_blank" rel="noreferrer" className="font-normal hover:underline">Sports Board</a>
                    </div>

                    {/* Products */}
                    <div className="flex flex-col gap-6">
                        <p className="font-bold">OUR PRODUCTS</p>
                        <a href="https://iitg.ac.in/placements/" target="_blank" rel="noreferrer" className="font-normal hover:underline">Placement Portal</a>
                        <a href="https://swc.iitg.ac.in/election_portal/" target="_blank" rel="noreferrer" className="font-normal hover:underline">Election Portal</a>
                        <a href="https://play.google.com/store/apps/details?id=com.swciitg.onestop2" target="_blank" rel="noreferrer" className="font-normal hover:underline">One Stop</a>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/20 mx-8 lg:mx-[120px] mt-4 pt-6 pb-8 flex justify-between items-center gap-4 flex-wrap">
                <p className="text-sm tracking-[3.6px] text-[#f8f8f8]">@ {year} Students Web Committee</p>
                <div className="flex gap-4 items-center">
                    <a href="https://www.facebook.com/swciitg/" target="_blank" rel="noreferrer">
                        <img src={A('social-fb.svg')} alt="Facebook" className="w-[35px] h-[35px]" />
                    </a>
                    <a href="https://www.instagram.com/swc_iitg/" target="_blank" rel="noreferrer">
                        <img src={A('social-ig.svg')} alt="Instagram" className="w-[35px] h-[35px]" />
                    </a>
                    <a href="https://in.linkedin.com/company/student-s-web-committee-iitg" target="_blank" rel="noreferrer">
                        <img src={A('social-li.svg')} alt="LinkedIn" className="w-[35px] h-[35px]" />
                    </a>
                    <a href="https://twitter.com/swciitghy" target="_blank" rel="noreferrer">
                        <img src={A('social-tw.svg')} alt="Twitter" className="w-[35px] h-[35px]" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
