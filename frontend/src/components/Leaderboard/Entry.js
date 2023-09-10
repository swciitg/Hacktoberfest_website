
const Entry = (props) => {
    return (
        <div className="p-4 grid grid-cols-4 gap-4 text-lg text-center transition-all hover:scale-105">
            <span className="">{props.row.userID}</span>
            <div className="flex space-x-5">
                <img src="https://avatars.githubusercontent.com/u/93438420?s=96&v=4" className="rounded-full" width={40}></img>
                <span>{props.row.Name}</span>
            </div>
            <span className="">{props.row.git_hub_id}</span>
            <span className="">{props.row.score}</span>
      </div>
    );
}

export default Entry;