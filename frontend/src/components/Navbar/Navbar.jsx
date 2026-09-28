import { Link } from 'react-router-dom';
import { asset } from '../../utils/asset';
import { logout } from '../../utils/auth';
import styles from './Navbar.module.css';

const Navbar = ({ isLoggedIn, username }) => (
  <>
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <img src={asset('invader.svg')} alt="" width={38} />
        <span className={styles.brand}>HACKTOBERFEST</span>
      </Link>

      {isLoggedIn ? (
        <>
          <div className={styles.links}>
            <Link to="/repos">All Repos</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <button type="button" className={styles.linkButton} onClick={logout}>Logout</button>
          </div>
          <Link to="/profile" className={styles.profileChip}>
            <img src={asset('invader-mini.svg')} alt="" width={22} />
            <span>{username || 'Profile'}</span>
          </Link>
        </>
      ) : (
        <>
          <div className={styles.links}>
            <a href={`${process.env.PUBLIC_URL}#about`}>About</a>
            <a href={`${process.env.PUBLIC_URL}#projects`}>Projects</a>
          </div>
          <Link to="/login" className={styles.loginButton}>
            <img src={asset('btn-login.svg')} alt="" />
            <span>Login</span>
          </Link>
        </>
      )}
    </nav>
    <img src={asset('divider-line.svg')} alt="" className={styles.divider} aria-hidden="true" />
  </>
);

export default Navbar;
