import { useParams, Link } from 'react-router-dom';
import styles from './RepoDetailPage.module.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/footer';
import useProfile from '../../hooks/useProfile';
import useRepos from '../../hooks/useRepos';
import { asset as A } from '../../utils/asset';

const MORE_REPOS_COUNT = 6;

const CONTRIBUTE_STEPS = [
    'Find an open issue that interests you.',
    'Fork the repository and clone it locally.',
    'Submit a pull request with your changes.',
];

const REPO_LINKS = [
    { label: 'Issues',        path: '/issues' },
    { label: 'Pull Requests', path: '/pulls' },
    { label: 'Actions',       path: '/actions' },
    { label: 'Branches',      path: '/branches' },
    { label: 'Code',          path: '' },
];

const CITY_LAYERS = [
    { src: 'city-base.svg',          cls: styles.cityBase },
    { src: 'city-right.svg',         cls: styles.cityR },
    { src: 'rd-landscape-arch.svg',  cls: styles.cityArch },
    { src: 'rd-landscape-r2.svg',    cls: styles.cityR2 },
    { src: 'rd-landscape-l.svg',     cls: styles.cityL },
    { src: 'rd-landscape-bl.svg',    cls: styles.cityBl },
    { src: 'rd-landscape-sm.svg',    cls: styles.citySm },
];

const RepoDetailPage = () => {
    const { owner, repo } = useParams();
    const { isLoggedIn, profile } = useProfile();
    const { repos, loading } = useRepos();

    const isCurrent = (r) => r.owner === owner && r.repo === repo;
    const repoData = repos.find(isCurrent);
    const moreRepos = repos.filter((r) => !isCurrent(r)).slice(0, MORE_REPOS_COUNT);
    const ghBase = `https://github.com/${owner}/${repo}`;

    const stats = repoData ? [
        { label: 'Total PRs',  value: repoData.pullRequestCount ?? 0 },
        { label: 'Merged PRs', value: repoData.mergedPullRequestCount ?? 0 },
        { label: 'Stars',      value: repoData.starCounts ?? 0 },
    ] : [];

    return (
        <div className={styles.page}>
            <img src={A('stars-blue.svg')} alt="" className={styles.starsBlue} aria-hidden="true" />
            <img src={A('stars.svg')}      alt="" className={styles.stars}     aria-hidden="true" />

            <Navbar isLoggedIn={isLoggedIn} username={profile?.github_username} />

            <main className={styles.main}>
                <Link to="/repos" className={styles.backLink}>&larr;&nbsp;All Repos</Link>

                {loading && <p className={styles.statusText}>Loading…</p>}
                {!loading && !repoData && <p className={styles.statusText}>Repository not found.</p>}

                {repoData && (
                    <div className={styles.twoCol}>
                        {/* ── Left card ── */}
                        <div className={styles.leftCard}>
                            <img src={A('rd-card-main.svg')} alt="" className={styles.cardFrame} aria-hidden="true" />
                            <div className={styles.leftContent}>
                                <div className={styles.repoHeader}>
                                    <img
                                        src={repoData.avatar_url || A('projects-invader.svg')}
                                        alt={repoData.owner}
                                        className={styles.repoAvatar}
                                    />
                                    <div className={styles.repoMeta}>
                                        <a href={ghBase} target="_blank" rel="noreferrer" className={styles.repoName}>
                                            {repoData.owner}/{repoData.repo}
                                        </a>
                                        <p className={styles.repoDesc}>
                                            {repoData.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <img src={A('projects-invader.svg')} alt="" className={styles.headerInvader} aria-hidden="true" />
                                </div>

                                {repoData.techStacks?.length > 0 && (
                                    <div className={styles.techTags}>
                                        {repoData.techStacks.map((t) => (
                                            <span key={t} className={styles.techTag}>{t}</span>
                                        ))}
                                    </div>
                                )}

                                <div className={styles.statsRow}>
                                    {stats.map(({ label, value }) => (
                                        <div key={label} className={styles.statBox}>
                                            <img src={A('rd-stat-frame.svg')} alt="" className={styles.statFrame} aria-hidden="true" />
                                            <div className={styles.statInner}>
                                                <span className={styles.statValue}>{value}</span>
                                                <span className={styles.statLabel}>{label}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.listRows}>
                                    {REPO_LINKS.map(({ label, path }) => (
                                        <a
                                            key={label}
                                            href={`${ghBase}${path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.listRow}
                                        >
                                            <img src={A('rd-issue.svg')} alt="" className={styles.listIcon} aria-hidden="true" />
                                            <span className={styles.listLabel}>{label}</span>
                                            <span className={styles.listArrow}>&rarr;</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Right column ── */}
                        <div className={styles.rightCol}>
                            <div className={styles.contributeCard}>
                                <img src={A('rd-card-contribute.svg')} alt="" className={styles.cardFrame} aria-hidden="true" />
                                <div className={styles.contributeContent}>
                                    <h2 className={styles.cardHeading}>START CONTRIBUTING</h2>
                                    <ol className={styles.stepsList}>
                                        {CONTRIBUTE_STEPS.map((step, i) => (
                                            <li key={step} className={styles.stepItem}>
                                                <span className={styles.stepNum}>{i + 1}</span>
                                                <span className={styles.stepText}>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    <a href={`${ghBase}/issues`} target="_blank" rel="noreferrer" className={styles.startBtn}>
                                        <img src={A('btn-primary.svg')} alt="" className={styles.startBtnBg} />
                                        <span>Start</span>
                                    </a>
                                </div>
                            </div>

                            <div className={styles.moreCard}>
                                <img src={A('rd-card-more.svg')} alt="" className={styles.cardFrame} aria-hidden="true" />
                                <img src={A('rd-landscape-more.svg')} alt="" className={styles.moreCardLandscape} aria-hidden="true" />
                                <div className={styles.moreContent}>
                                    <h2 className={styles.cardHeading}>MORE REPOS</h2>
                                    <div className={styles.moreList}>
                                        {moreRepos.map((r) => (
                                            <Link
                                                key={`${r.owner}/${r.repo}`}
                                                to={`/repos/${r.owner}/${r.repo}`}
                                                className={styles.moreRow}
                                            >
                                                <span className={styles.moreRepoName}>{r.owner}/{r.repo}</span>
                                                <span className={styles.morePrCount}>{r.pullRequestCount ?? 0} PRs</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.cityscape} aria-hidden="true">
                    {CITY_LAYERS.map(({ src, cls }) => (
                        <img key={src} src={A(src)} alt="" className={cls} />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default RepoDetailPage;
