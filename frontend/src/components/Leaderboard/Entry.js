
const Entry = (props) => {
    console.log(props);
    let style;
    if (props.name === props.row.username) {
        style = "p-4 grid grid-cols-4 gap-4 text-lg text-center transition-all hover:scale-105 bg-blue-100"
    }
    else{
        style = "p-4 grid grid-cols-4 gap-4 text-lg text-center transition-all hover:scale-105 bg-white"
    }
    return (
        
        <div className={style}>
            <span className="">{props.row.index}</span>
            <div className="flex space-x-5">
                <img src={props.row.avatar_url} className="rounded-full" width={40}></img>
                <span>{props.row.username}</span>
            </div>
            <span className="">{props.row.total_pr_merged}</span>
            <span className="">{props.row.total_points}</span>
      </div>
    );
}

export default Entry;