import styles from './Card.module.css';


const Card = (props) => {
    return (
        <div className={styles.Card}>
        <div className={styles.CardImage}>
            <img src={props.row.avatar_url}/>
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
    </div>
    );
}

export default Card;