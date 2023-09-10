import Entry from './Entry.js'

const Leaderboard = (props) =>
{
    return(
        <div className='shadow-md'>
            <div className='p-4 rounded-t-3xl bg-white shadow-md'>
                <div className="grid grid-cols-4 gap-4 font-bold text-sm text-center">
                    <div className="">
                        <span>Rank</span>
                    </div>
                    <div className="">
                        <span>Contributor</span>
                    </div>
                    <div className="">
                        <span>Total PRs</span>
                    </div>
                    <div className="">
                        <span>Merged Prs</span>
                    </div>
                </div>
            </div>
            <div className='bg-white'>
            {props.data.map(row => (
                <Entry row={row} key={row.userID} />
                ))}
            </div>
        </div>
    );
}

export default Leaderboard;