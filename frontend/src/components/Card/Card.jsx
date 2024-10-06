import styles from './Card.module.css';


const Card = (props) => {
    return (
        <div className='bg-[rgba(31,36,45,1)] w-[90%] mobile:mx-auto px-4 mobile:px-6 py-12 rounded-3xl flex flex-col sm:gap-4 gap-2 shadow-2xl sm:mx-0 mx-4'>
            <div className={styles.CardImage}>
                <img src={props.row.avatar_url} />
            </div>
            <div className={styles.CardUser}>
                <a href={`https://github.com/${props.row.owner}/${props.row.repo}`}>{props.row.repo}</a>

            </div>
            <div className={styles.CardDetail}> {props.row.owner}
            </div>
            <div className={styles.CardTags}>
                {props.row.techStacks?.map((row) => (
                    <div className={styles.Tags} key={row.index}>  <a href={`https://github.com/topics/${row}`}>{row}</a> </div>
                ))}
            </div>
            <div className={styles.CardDetail}> Total Pull requests: {props.row.pullRequestCount}
            </div>
            <div className={styles.CardDetail}> Merged Pull requests: {props.row.mergedPullRequestCount}
            </div>
        </div>
    );
}

export default Card;