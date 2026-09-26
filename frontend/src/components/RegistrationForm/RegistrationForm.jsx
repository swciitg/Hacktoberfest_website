import styles from './RegistrationForm.module.css';
import hacktoberlogo from './hacktober_logo.svg';
import swclogo from './swc_logo.png';
import { BACKEND_API } from '../../api';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import InputField from '../input/CustomInput';
import { Navigate, redirect, useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";
import Footer from '../Footer/footer';

const RegistrationForm = (props) => {
  const [profile, setProfile] = useState();
  const roll_ref = useRef();
  const mail_ref = useRef();
  const mobile_ref = useRef();
  const college_ref = useRef();
  const year_ref = useRef();
  const programme_ref = useRef();
  const navigate = useNavigate();

  const [cookies] = useCookies(["access_token"]);
  console.log(cookies.access_token);
  if (!cookies.access_token) {
    window.location.href = BACKEND_API + "/auth/github";
  }

  useEffect(() => {
    axios
      .get(`${BACKEND_API}/api/profile`, {
        withCredentials: true,
      })
      .then((response) => {
        const data = response.data;
        console.log(data);
        setProfile(data.userData);
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  const handleSubmit = (e) => {

    e.preventDefault();
    const updatedData = {
      roll_no: roll_ref.current.value,
      email: mail_ref.current.value,
      mobile_number: mobile_ref.current.value,
      college: college_ref.current.value,
      year_of_study: year_ref.current.value,
      programme: programme_ref.current.value
    }
    console.log(updatedData);
    axios
      .put(`${BACKEND_API}/api/profile`, updatedData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((response) => {
        navigate("/leaderboard");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  console.log(profile?.avatar_url)

  return (
    <>
      <div className={styles.landingPage}>
        <div className={styles.SwcLogo}>
          <img src={swclogo} alt="" />
        </div>
        <div className={styles.FormSection}>
          <div className={styles.UserName}>
            {
              profile !== null ? <div className='flex gap-2 mobile:mt-10 items-center sm:text-4xl text-2xl '>
                Hello <img src={profile?.avatar_url} width={60} className='rounded-full'></img> <p className='sm:block'> {profile?.github_username}</p>
              </div> : <div>Fill out below details to register</div>
            }
          </div>
          <form action="" className='flex flex-col items-center w-full' >
            <div className={styles.Form}>
              <div className={styles.FormInput}>
                <InputField
                  inputRef={roll_ref}
                  type={"text"}
                  label={"Roll Number"}
                  value={profile?.roll_no ?? ""}
                />
              </div>

              <div className={styles.FormInput}>
                <InputField
                  inputRef={mail_ref}
                  type={"text"}
                  label={"Email"}
                  value={profile?.email || profile?.outlook_email || ""}
                />
              </div>

              <div className={styles.FormInput}>
                <InputField
                  inputRef={mobile_ref}
                  type={"text"}
                  label={"Mobile Number"}
                  value={profile?.mobile_number ?? ""}
                />
              </div>

              <div className={styles.FormInput}>
                <InputField
                  inputRef={college_ref}
                  type={"text"}
                  label={"College"}
                  value={profile?.college ?? ""}
                />
              </div>

            <div className={styles.FormInput}>
              <div><label htmlFor="Year">Year</label></div>
              <div>  <select name="Year" value={profile?.year_of_study} ref={year_ref}>
                <option value="0" selected hidden></option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Pre-Final Yearite">Pre-Final Yearite</option>
                <option value="Final Yearite">Final Yearite</option>
              </select></div>
            </div>
            <div className={styles.FormInput}>
              <div><label htmlFor="Programme">Programme</label></div>
              <div>  <select name="Programme" value={profile?.programme} ref={programme_ref}>
                <option value="none" selected hidden></option>
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="Ph.D">Ph.D</option>
                <option value="M.Sc">M.Sc</option>
                <option value="B.Des">B.Des</option>
                <option value="M.Des">M.Des</option>
                <option value="M.S.(R)">M.S.(R)</option>
                <option value="M.A.">M.A.</option>
                <option value="MBA">MBA</option>
                <option value="MTech+PhD">MTech+PhD</option>
                <option value="M.S. (Engineering) + PhD">M.S. (Engineering) + PhD</option>
              </select></div>
            </div>

            </div>
            <div className='w-4/5'>
              <button type="submit" className={styles.FormSectionButton} onClick={handleSubmit}>
                Submit</button>
            </div>
          </form>
        </div>
        <div className={styles.HacktoberLogo}>
          <img src='https://hacktoberfest.com/_next/static/media/logo-hacktoberfest-11--footer.cc639da3.svg' alt="" />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RegistrationForm;