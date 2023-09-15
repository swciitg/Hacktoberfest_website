import Entry from './Entry.js'

const Leaderboard = ({data, name}) =>
{
    return(
        <div className='shadow-md'>
            <div className='p-4 rounded-t-3xl bg-white shadow-md'>
                <div className="grid grid-cols-3 gap-4 font-bold text-md text-center">
                    <div className="">
                        <span>Sr. No</span>
                    </div>
                    <div className="">
                        <span>Contributor</span>
                    </div>
                    <div className="">
                        <span>Total PRs Merged</span>
                    </div>
                </div>
            </div>
            <div className='bg-white'>
            {data?.map(row => (
                <Entry row={row} key={row.index} name={name} />
                ))}
            </div>
        </div>
    );
}

export default Leaderboard;