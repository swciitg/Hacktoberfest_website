import Entry from './Entry.js';
import useTable from '../../hooks/useTable.js';
import { useState } from 'react'; 
import Pagination from '@mui/material/Pagination';

const Leaderboard = ({ data, name }) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10; // Define how many rows per page you want
  const { tableRange, slice } = useTable(data, page, rowsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <div className='shadow-md'>
      <div className='p-4 rounded-t-3xl bg-white shadow-md'>
        <div className="flex justify-between gap-4 font-bold text-md ">
          <div className="w-2/12 mobile:w-1/3">
            <span>Sr. No</span>
          </div>
          <div className="w-5/12 mobile:w-1/3 text-left">
            <span>Contributor</span>
          </div>
          <div className="w-5/12 mobile:w-1/3 text-center">
            <span>Total PRs Merged</span>
          </div>
        </div>
      </div>
      <div className='bg-white'>
        {slice?.map(row => (
          <Entry row={row} key={row.index} name={name} />
        ))}
        <div className='flex items-center justify-center py-4'>
        <Pagination className='flex items-center' count={tableRange?.length} page={page} onChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
