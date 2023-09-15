import styles from './Card.module.css';


const Card = (props) => {
    return (
        <div className={styles.Card}>
        <div className={styles.CardImage}>
            <img src={props.row.ownerProfileImage}/>
        </div>
        <div className={styles.CardUser}>
        <a href={`https://github.com/${props.row.owner}/${props.row.repo}`}>{props.row.repo}</a>

        </div>
        <div className={styles.CardDetail}> {props.row.description}

        </div>
        <div className={styles.CardTags}>
        {props.row.techStacks?.map((row) => (
            <div className={styles.Tags} key={row.index}>  <a href={`https://github.com/topics/${row}`}>{row}</a> </div>
            ))}
        </div>
        <div className={styles.Forks}>
            <div className={styles.ForksDetail}>
                <div className={styles.Stars}> <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 14 16"
                        height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z">
                        </path>
                    </svg> PR Raised</div>
                <div className={styles.StarsCount}> {props.row.pullRequestCounts.pullRequestCount}</div>
            </div>
            <div className={styles.ForksDetail}>
                <div className={styles.Stars}> <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 10 16"
                        height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M8 1a1.993 1.993 0 0 0-1 3.72V6L5 8 3 6V4.72A1.993 1.993 0 0 0 2 1a1.993 1.993 0 0 0-1 3.72V6.5l3 3v1.78A1.993 1.993 0 0 0 5 15a1.993 1.993 0 0 0 1-3.72V9.5l3-3V4.72A1.993 1.993 0 0 0 8 1zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3 10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3-10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z">
                        </path>
                    </svg> PR Merged</div>
                <div className={styles.StarsCount}> {props.row.pullRequestCounts.mergedPullRequestCount}</div>
            </div>
        </div>

    </div>
    );
}

export default Card;