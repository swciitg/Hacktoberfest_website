import { useState } from 'react';
import styles from './AllReposPage.module.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/footer';
import ProjectCard from '../ProjectCard/ProjectCard';
import useProfile from '../../hooks/useProfile';
import useRepos from '../../hooks/useRepos';
import { asset as A } from '../../utils/asset';

const matchesQuery = (repo, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [repo.repo, repo.owner, repo.description, ...(repo.techStacks || [])]
        .some((field) => field && field.toLowerCase().includes(q));
};

const AllReposPage = () => {
    const [query, setQuery] = useState('');
    const { isLoggedIn, profile } = useProfile();
    const { repos, loading } = useRepos();

    const filtered = repos.filter((r) => matchesQuery(r, query));
    const iitgRepos = filtered.filter((r) => r.type === 'IITG');
    const externalRepos = filtered.filter((r) => r.type !== 'IITG');

    return (
        <div className={styles.page}>
            <img src={A('stars.svg')} alt="" className={styles.starsBg} aria-hidden="true" />

            <Navbar isLoggedIn={isLoggedIn} username={profile?.github_username} />

            <main className={styles.main}>
                <section className={styles.header}>
                    <img src={A('projects-invader.svg')} alt="" className={styles.headerInvader} aria-hidden="true" />
                    <h1 className={styles.title}>ALL REPOSITORIES</h1>
                    <p className={styles.subtitle}>Every project taking part in Hacktoberfest. Pick one and start contributing.</p>

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
                </section>

                {loading && <p className={styles.statusText}>Loading repositories&hellip;</p>}

                {!loading && (
                    <>
                        <section className={styles.repoSection}>
                            <h2 className={styles.sectionTitle}>IITG Projects</h2>
                            <div className={styles.cardsRow}>
                                {iitgRepos.map((repo) => (
                                    <ProjectCard key={`${repo.owner}/${repo.repo}`} repo={repo} />
                                ))}
                                {iitgRepos.length === 0 && (
                                    <p className={styles.emptyText}>No projects match your search.</p>
                                )}
                            </div>
                        </section>

                        <section className={styles.repoSection}>
                            <h2 className={styles.sectionTitle}>External Projects</h2>
                            <div className={styles.cardsRow}>
                                {externalRepos.map((repo) => (
                                    <ProjectCard key={`${repo.owner}/${repo.repo}`} repo={repo} />
                                ))}
                                {externalRepos.length === 0 && (
                                    <p className={styles.emptyText}>No projects match your search.</p>
                                )}
                            </div>
                        </section>
                    </>
                )}

                <p className={styles.formNote}>
                    Know a repo that belongs here? Suggest it via this{' '}
                    <a
                        href="https://forms.office.com/r/YzX1rQPs2b"
                        target="_blank"
                        rel="noreferrer"
                        className={styles.formLink}
                    >
                        form
                    </a>.
                </p>
            </main>

            <Footer />
        </div>
    );
};

export default AllReposPage;
