import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './RegistrationForm.module.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/footer';
import useProfile from '../../hooks/useProfile';
import { BACKEND_API } from '../../api';
import { asset as A } from '../../utils/asset';
import { loginWithGithub } from '../../utils/auth';

const YEAR_OPTIONS = ['Freshman', 'Sophomore', 'Pre-Final Yearite', 'Final Yearite'];
const PROGRAMME_OPTIONS = [
  'B.Tech', 'M.Tech', 'Ph.D', 'M.Sc', 'B.Des', 'M.Des',
  'M.S.(R)', 'M.A.', 'MBA', 'MTech+PhD', 'M.S. (Engineering) + PhD',
];

// Positions taken from the 1440px-wide Figma frame.
const CLOUDS = [
  { src: 'reg-cloud-6.svg',      left: 32,   top: 768,  width: 303 },
  { src: 'reg-cloud-5.svg',      left: 521,  top: 794,  width: 183 },
  { src: 'reg-cloud-7.svg',      left: 507,  top: 869,  width: 183 },
  { src: 'reg-cloud-1.svg',      left: 1257, top: 745,  width: 215 },
  { src: 'reg-cloud-4.svg',      left: 959,  top: 802,  width: 183, flip: true },
  { src: 'reg-cloud-2.svg',      left: 108,  top: 957,  width: 183, flip: true },
  { src: 'reg-cloud-3.svg',      left: 1134, top: 972,  width: 117, flip: true },
  { src: 'reg-cloud-double.svg', left: 654,  top: 956,  width: 266, flip: true },
];

const TEXT_FIELDS = [
  { name: 'roll_no',       label: 'Roll number',   type: 'text',  placeholder: 'e.g. 220102035', minLength: 9, maxLength: 9 },
  { name: 'outlook_email', label: 'Outlook Email', type: 'email', placeholder: 'yourname@iitg.ac.in' },
];

const WIDE_FIELDS = [
  { name: 'department', label: 'Department', placeholder: 'e.g. Computer Science and Engineering' },
  { name: 'hostel',     label: 'Hostel',     placeholder: 'e.g. Kameng' },
];

const SELECT_FIELDS = [
  { name: 'year_of_study', label: 'Year',      placeholder: 'Select year',      options: YEAR_OPTIONS },
  { name: 'programme',     label: 'Programme', placeholder: 'Select programme', options: PROGRAMME_OPTIONS },
];

const RegistrationForm = () => {
  const { isLoggedIn, profile, loaded } = useProfile();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  // Checked once on mount; reacting to later changes would hijack logout's redirect.
  const loggedInOnMount = useRef(isLoggedIn);

  useEffect(() => {
    if (!loggedInOnMount.current) loginWithGithub();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const updatedData = Object.fromEntries(new FormData(formRef.current));
    axios
      .put(`${BACKEND_API}/api/profile`, updatedData, { withCredentials: true })
      .then(() => navigate('/leaderboard'))
      .catch((err) => {
        setError(err.response?.data?.error || 'Something went wrong. Please check your details and try again.');
        setSubmitting(false);
      });
  };

  return (
    <div className={styles.page}>
      <img src={A('stars.svg')} alt="" className={styles.starsBg} aria-hidden="true" />
      <img src={A('stars-blue.svg')} alt="" className={styles.starsBlue} aria-hidden="true" />
      <div className={styles.clouds} aria-hidden="true">
        {CLOUDS.map(({ src, left, top, width, flip }) => (
          <img
            key={`${src}-${left}`}
            src={A(src)}
            alt=""
            className={flip ? styles.flipped : undefined}
            style={{ left, top, width }}
          />
        ))}
      </div>

      <Navbar isLoggedIn={isLoggedIn} username={profile?.github_username} />

      <section className={styles.hero}>
        <img src={A('reg-invader-hero.svg')} alt="" className={styles.heroInvader} aria-hidden="true" />
        <p className={styles.eyebrow}>REGISTER</p>
        <h1 className={styles.heroTitle}>FILL OUT BELOW DETAILS TO REGISTER</h1>
        <p className={styles.heroSubtitle}>
          Register once so your merged pull requests count on the leaderboard.
        </p>
      </section>

      <main className={styles.main}>
        <div className={styles.card}>
          <img src={A('reg-card-frame.svg')} alt="" className={styles.cardFrame} aria-hidden="true" />
          {/* Remount once the profile arrives so defaultValues pick up saved details */}
          <form
            key={loaded ? 'loaded' : 'loading'}
            ref={formRef}
            className={styles.cardContent}
            onSubmit={handleSubmit}
          >
            <div className={styles.formGrid}>
              {TEXT_FIELDS.map(({ name, label, ...inputProps }) => (
                <label key={name} className={styles.field}>
                  <span>{label}</span>
                  <input name={name} defaultValue={profile?.[name] ?? ''} required {...inputProps} />
                </label>
              ))}

              {SELECT_FIELDS.map(({ name, label, placeholder, options }) => (
                <label key={name} className={styles.field}>
                  <span>{label}</span>
                  <span className={styles.selectWrap}>
                    <select name={name} defaultValue={profile?.[name] ?? ''} required>
                      <option value="" disabled hidden>{placeholder}</option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <span className={styles.selectArrow}>&#9662;</span>
                  </span>
                </label>
              ))}

              {WIDE_FIELDS.map(({ name, label, placeholder }) => (
                <label key={name} className={`${styles.field} ${styles.fieldWide}`}>
                  <span>{label}</span>
                  <input name={name} type="text" defaultValue={profile?.[name] ?? ''} placeholder={placeholder} required />
                </label>
              ))}
            </div>

            {error && <p className={styles.errorText} role="alert">{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              <img src={A('btn-primary.svg')} alt="" className={styles.submitBtnBg} />
              <span>{submitting ? 'Submitting…' : 'Submit'}</span>
            </button>
          </form>
        </div>

        <div className={styles.cityscape} aria-hidden="true">
          <img src={A('city-base.svg')} alt="" className={styles.cityBase} />
          <img src={A('city-right.svg')} alt="" className={styles.cityR} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegistrationForm;
