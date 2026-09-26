import { Link } from 'react-router-dom';
import styles from './ProjectCard.module.css';
import { asset as A } from '../../utils/asset';

const ProjectCard = ({ repo }) => (
    <div className={styles.card}>
        <img src={A('module.svg')} alt="" className={styles.cardFrame} aria-hidden="true" />
        <div className={styles.cardContent}>
            <p className={styles.cardName}>{repo.repo}</p>
            <p className={styles.cardDesc}>
                {repo.description || `A project by ${repo.owner}. Open it to find issues where help is needed.`}
            </p>
            <div className={styles.cardTags}>
                {(repo.techStacks || []).slice(0, 3).map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                ))}
            </div>
            <img src={A('card-divider.svg')} alt="" className={styles.cardDivider} aria-hidden="true" />
            <Link to={`/repos/${repo.owner}/${repo.repo}`} className={styles.cardLink}>
                <span>View Project</span>
                <span>&rarr;</span>
            </Link>
        </div>
    </div>
);

export default ProjectCard;
