import Image from 'next/image';
const Entry = (props) => {
    console.log(props);
    let style;
    if (props.name === props.row.username) {
        style = "p-4 flex justify-between gap-4 text-lg text-center transition-all hover:scale-105 bg-blue-100"
    }
    else{
        style = "p-4 flex justify-between gap-4 text-lg text-center transition-all hover:scale-105 bg-white"
    }
    return (
        
        <div className={style}>
            <span className="w-1/12 mobile:w-1/3 text-left">{props.row.index}</span>
            <div className="flex space-x-3 w-2/3 mobile:w-1/3 ">
                <Image src={props.row.avatar_url} className="rounded-full" width={40} height={40} alt="Contributor avatar" />
                <span className="text-bold mobile:text-md ">{props.row.username}</span>
            </div>
            <span className="w-1/3 flex justify-center">{props.row.total_pr_merged}</span>
            {/* <span className="">{props.row.total_points}</span> */}
      </div>
    );
}

export default Entry;
