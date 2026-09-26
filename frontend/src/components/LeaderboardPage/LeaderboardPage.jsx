import { useMemo, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import styles from './LeaderboardPage.module.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/footer';
import useProfile from '../../hooks/useProfile';
import useLeaderboard from '../../hooks/useLeaderboard';
import useTable from '../../hooks/useTable';
import { asset as A } from '../../utils/asset';

const ROWS_PER_PAGE = 10;

const RANK_STYLES = {
    1: 'rankGold',
    2: 'rankSilver',
    3: 'rankBronze',
};

const paginationSx = {
    '& .MuiPaginationItem-root': {
        color: '#f8f8f8',
        fontFamily: "'Inter', sans-serif",
        borderColor: 'rgba(255,255,255,0.2)',
    },
    '& .MuiPaginationItem-root:hover': {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    '& .Mui-selected': {
        backgroundColor: 'rgba(139, 207, 240, 0.24) !important',
        color: '#8bcff0',
    },
};

const LeaderboardPage = () => {
    const { isLoggedIn, profile } = useProfile();
    const { leaderboard, loading } = useLeaderboard();
    const [page, setPage] = useState(1);
    const { tableRange, slice } = useTable(leaderboard, page, ROWS_PER_PAGE);

    const myRank = useMemo(() => {
        if (!profile?.github_username) return null;
        const idx = leaderboard.findIndex((r) => r.username === profile.github_username);
        return idx === -1 ? null : { ...leaderboard[idx], rank: idx + 1 };
    }, [leaderboard, profile]);

    return (
        <div className={styles.page}>
            <img src={A('stars.svg')} alt="" className={styles.starsBg} aria-hidden="true" />

            <Navbar isLoggedIn={isLoggedIn} username={profile?.github_username} />

            <main className={styles.main}>
                <section className={styles.header}>
                    <img src={A('projects-invader.svg')} alt="" className={styles.headerInvader} aria-hidden="true" />
                    <h1 className={styles.title}>LEADERBOARD</h1>
                    <p className={styles.subtitle}>Top contributors ranked by merged pull requests.</p>
                </section>

                {myRank && (
                    <div className={styles.myRankCard}>
                        <img src={myRank.avatar_url} alt={myRank.username} className={styles.myRankAvatar} />
                        <div className={styles.myRankInfo}>
                            <span className={styles.myRankLabel}>Your rank</span>
                            <span className={styles.myRankUsername}>{myRank.username}</span>
                        </div>
                        <div className={styles.myRankStats}>
                            <span className={styles.myRankNumber}>#{myRank.rank}</span>
                            <span className={styles.myRankPr}>{myRank.total_pr_merged} PRs merged</span>
                        </div>
                    </div>
                )}

                {loading && <p className={styles.statusText}>Loading leaderboard&hellip;</p>}
                {!loading && leaderboard.length === 0 && (
                    <p className={styles.statusText}>
                        No contributions yet. {!isLoggedIn && <>Log in and open a PR to appear here!</>}
                    </p>
                )}

                {!loading && leaderboard.length > 0 && (
                    <div className={styles.tableCard}>
                        <div className={styles.tableHead}>
                            <span className={styles.colRank}>Rank</span>
                            <span className={styles.colContributor}>Contributor</span>
                            <span className={styles.colPr}>PRs Merged</span>
                        </div>

                        <div className={styles.tableBody}>
                            {slice?.map((row, i) => {
                                const rank = (page - 1) * ROWS_PER_PAGE + i + 1;
                                const isMe = profile?.github_username === row.username;
                                const rankClass = RANK_STYLES[rank] ? styles[RANK_STYLES[rank]] : '';
                                return (
                                    <div
                                        key={row.username}
                                        className={`${styles.row} ${isMe ? styles.rowActive : ''}`}
                                    >
                                        <span className={`${styles.colRank} ${styles.rankNumber} ${rankClass}`}>
                                            {rank}
                                        </span>
                                        <div className={styles.colContributor}>
                                            <img src={row.avatar_url} alt={row.username} className={styles.avatar} />
                                            <span className={styles.username}>{row.username}</span>
                                        </div>
                                        <span className={styles.colPr}>{row.total_pr_merged}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {tableRange.length > 1 && (
                            <div className={styles.paginationWrap}>
                                <Pagination
                                    count={tableRange.length}
                                    page={page}
                                    onChange={(_, value) => setPage(value)}
                                    shape="rounded"
                                    sx={paginationSx}
                                />
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default LeaderboardPage;
