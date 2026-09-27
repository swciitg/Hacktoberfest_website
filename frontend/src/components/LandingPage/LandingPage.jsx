import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/footer';
import ProjectCard from '../ProjectCard/ProjectCard';
import useProfile from '../../hooks/useProfile';
import useRepos from '../../hooks/useRepos';
import { asset as A } from '../../utils/asset';

const CYCLE_WORDS = ['Learn?', 'Grow?', 'Create?', 'Level Up?', 'Imagine?'];
const FEATURED_COUNT = 4;

const matchesQuery = (repo, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [repo.repo, repo.owner, repo.description, ...(repo.techStacks || [])]
        .some((field) => field && field.toLowerCase().includes(q));
};

const LandingPage = () => {
    const [cycleWord, setCycleWord] = useState('');
    const [satelliteClicked, setSatelliteClicked] = useState(false);
    const [query, setQuery] = useState('');
    const { isLoggedIn, profile } = useProfile();
    const { repos, loading } = useRepos();

    const featuredRepos = repos.filter((r) => matchesQuery(r, query)).slice(0, FEATURED_COUNT);
    const startPath = isLoggedIn ? '/leaderboard' : '/login';

    useEffect(() => {
        let charIdx = 0;
        let deleting = false;
        let wordIdx = 0;
        let timer;

        const tick = () => {
            const word = CYCLE_WORDS[wordIdx];
            if (!deleting) {
                charIdx++;
                setCycleWord(word.slice(0, charIdx));
                if (charIdx === word.length) {
                    deleting = true;
                    timer = setTimeout(tick, 1400);
                    return;
                }
            } else {
                charIdx--;
                setCycleWord(word.slice(0, charIdx));
                if (charIdx === 0) {
                    deleting = false;
                    wordIdx = (wordIdx + 1) % CYCLE_WORDS.length;
                }
            }
            timer = setTimeout(tick, deleting ? 60 : 90);
        };
        timer = setTimeout(tick, 400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={styles.page}>
            <img src={A('stars.svg')} alt="" className={styles.starsBg} aria-hidden="true" />
            <img src={A('glow-l.svg')} alt="" className={styles.glowL} aria-hidden="true" />
            <img src={A('ellipse-glow.svg')} alt="" className={styles.ellipseGlow} aria-hidden="true" />

            <Navbar isLoggedIn={isLoggedIn} username={profile?.github_username} />

            {/* ── Hero ── */}
            <section className={styles.hero} id="about">
                <div className={styles.satelliteWrap}>
                    <img
                        src={A('satellite.svg')}
                        alt="satellite"
                        className={`${styles.satellite} ${satelliteClicked ? styles.satelliteClicked : ''}`}
                    />
                    <img
                        src={A('astronaut-rope.svg')}
                        alt="astronaut on rope"
                        className={`${styles.astronautRope} ${satelliteClicked ? styles.astronautReached : ''}`}
                    />
                    <img src={A('astronaut-btn.png')} alt="" className={styles.astronautBtn} aria-hidden="true" />
                </div>

                <div className={styles.heroContent}>
                    <img src={A('hero-invader.svg')} alt="" className={styles.heroInvader} aria-hidden="true" />
                    <h1 className={styles.heroTitle}>What is Hacktoberfest?</h1>
                    <p className={styles.heroDesc}>
                        Hacktoberfest is a month-long coding competition organised by the Students&rsquo; Web Committee, IIT Guwahati.
                    </p>
                    <p className={styles.heroSubtitle}>LEARN &nbsp;·&nbsp; PRACTICE &nbsp;·&nbsp; QUIZ &nbsp;·&nbsp; PROGRESS</p>
                    <a
                        href="#projects"
                        className={styles.btnExplore}
                        onClick={() => setSatelliteClicked(true)}
                    >
                        <img src={A('btn-primary.svg')} alt="" className={styles.btnBg} />
                        <span>Explore projects</span>
                    </a>
                </div>
            </section>

            {/* ── Projects Section ── */}
            <section className={styles.projectsSection} id="projects">
                <img src={A('projects-invader.svg')} alt="" className={styles.sectionInvader} aria-hidden="true" />
                <h2 className={styles.sectionTitle}>EXPLORE PROJECTS &amp; START CONTRIBUTING</h2>
                <p className={styles.sectionSubtitle}>Pick a repository, find an open issue, and start earning XP.</p>

                <div className={styles.searchRow}>
                    <div className={styles.searchBox}>
                        <img src={A('search-border.svg')} alt="" className={styles.searchBorder} />
                        <img src={A('search-icon.svg')} alt="" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search projects"
                            className={styles.searchInput}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.cardsRow}>
                    {featuredRepos.map((repo) => (
                        <ProjectCard key={`${repo.owner}/${repo.repo}`} repo={repo} />
                    ))}
                    {!loading && featuredRepos.length === 0 && (
                        <p className={styles.emptyText}>No projects match your search.</p>
                    )}
                </div>

                <Link to="/repos" className={styles.btnViewAll}>View all</Link>
            </section>

            {/* ── CTA Section ── */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaContent}>
                    <p className={styles.ctaText}>
                        Are you ready to&nbsp;<span className={styles.ctaWord}>{cycleWord}<span className={styles.cursor}>|</span></span>
                    </p>
                    <Link to={startPath} className={styles.btnGetStarted}>
                        <img src={A('btn-getstarted.svg')} alt="" className={styles.btnBg} />
                        <span>Get started</span>
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
