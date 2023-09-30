import { useState, useEffect } from "react";

const useTable = (data, page, rowsPerPage) => {
  const [tableRange, setTableRange] = useState([]);
  const [slice, setSlice] = useState([]);

  useEffect(() => {
    const range = [];
    const num = Math.ceil(data?.length / rowsPerPage);
    for (let i = 1; i <= num; i++) {
      range.push(i);
    }
    setTableRange(range);
    setSlice(data?.slice((page - 1) * rowsPerPage, page * rowsPerPage));
  }, [data, page, rowsPerPage]);

  return { tableRange, slice };
};

export default useTable;
