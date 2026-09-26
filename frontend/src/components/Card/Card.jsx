import { Link } from 'react-router-dom';
import styles from './Card.module.css';


const Card = (props) => {
    return (
        <Link to={`/repos/${props.row.owner}/${props.row.repo}`} className='no-underline'>
            <div className='bg-[rgba(31,36,45,1)] w-[90%] mobile:mx-auto px-4 mobile:px-6 py-12 rounded-3xl flex flex-col sm:gap-4 gap-2 shadow-2xl sm:mx-0 mx-4 hover:opacity-90 transition-opacity'>
                <div className={styles.CardImage}>
                    <img src={props.row.avatar_url} alt={props.row.owner} />
                </div>
                <div className={styles.CardUser}>
                    <span>{props.row.repo}</span>
                </div>
                <div className={styles.CardDetail}> {props.row.owner}
                </div>
                <div className={styles.CardTags}>
                    {props.row.techStacks?.map((tech) => (
                        <div className={styles.Tags} key={tech}>  <span>{tech}</span> </div>
                    ))}
                </div>
                <div className={styles.CardDetail}> Total Pull requests: {props.row.pullRequestCount}
                </div>
                <div className={styles.CardDetail}> Merged Pull requests: {props.row.mergedPullRequestCount}
                </div>
            </div>
        </Link>
    );
}

export default Card;