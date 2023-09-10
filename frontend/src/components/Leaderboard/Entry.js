
const Entry = (props) => {
    return (
        <div className="p-4 grid grid-cols-4 gap-4 text-lg text-center transition-all hover:scale-105">
            <span className="">{props.row.userID}</span>
            <span className="">{props.row.Name}</span>
            <span className="">{props.row.git_hub_id}</span>
            <span className="">{props.row.score}</span>
      </div>
    );
}

export default Entry;