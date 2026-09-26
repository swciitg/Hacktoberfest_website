import { Link } from 'react-router-dom';
import styles from './LoginPage.module.css';
import Navbar from '../Navbar/Navbar';
import useProfile from '../../hooks/useProfile';
import { asset as A } from '../../utils/asset';
import { loginWithGithub } from '../../utils/auth';

const CITY_SVGS = [
    { src: 'login-city-8.svg', cls: styles.city8 },
    { src: 'login-city-2.svg', cls: styles.city2 },
    { src: 'login-city-3.svg', cls: styles.city3 },
    { src: 'login-city-4.svg', cls: styles.city4 },
    { src: 'login-city-5.svg', cls: styles.city5 },
    { src: 'login-city-6.svg', cls: styles.city6 },
    { src: 'login-city-7.svg', cls: styles.city7 },
    { src: 'login-city-1.svg', cls: styles.city1 },
];

const LoginPage = () => {
    const { isLoggedIn, profile } = useProfile();

    return (
        <div className={styles.page}>
            <img src={A('stars-blue.svg')} alt="" className={styles.starsBlue} aria-hidden="true" />
            <img src={A('stars.svg')} alt="" className={styles.stars} aria-hidden="true" />
            <img src={A('login-glow-l.svg')} alt="" className={styles.glowL} aria-hidden="true" />

            <Navbar isLoggedIn={isLoggedIn} username={profile?.github_username} />

            <main className={styles.main}>
                <div className={styles.card}>
                    <img src={A('login-card-frame.svg')} alt="" className={styles.cardFrame} aria-hidden="true" />
                    <div className={styles.cardContent}>
                        <h1 className={styles.cardTitle}>Login</h1>
                        <p className={styles.cardDesc}>
                            Sign in with your Github account to see the repos, raise pull requests and climb the leaderboard.
                        </p>

                        <button type="button" className={styles.btnGithub} onClick={loginWithGithub}>
                            <img src={A('login-btn-github.svg')} alt="" className={styles.btnGithubBg} />
                            <span>Continue with Github</span>
                        </button>

                        <p className={styles.registerLine}>
                            <span className={styles.registerText}>New to Hacktober?&nbsp;</span>
                            <Link to="/profile" className={styles.registerLink}>
                                Fill out your details to register
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <div className={styles.cityscape} aria-hidden="true">
                {CITY_SVGS.map(({ src, cls }) => (
                    <img key={src} src={A(src)} alt="" className={cls} />
                ))}
            </div>
        </div>
    );
};

export default LoginPage;
