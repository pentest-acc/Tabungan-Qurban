import { useEffect, useMemo, useState } from 'react';

// Search + filter + pagination sisi klien untuk daftar data.
export default function useTableControls(items, { searchFields = [], filterFn = null, pageSize = 8 } = {}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const list = useMemo(() => (Array.isArray(items) ? items : items?.data ?? []), [items]);

  const filtered = useMemo(() => {
    let result = list;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((item) =>
        searchFields.some((field) => String(item?.[field] ?? '').toLowerCase().includes(q))
      );
    }
    if (filter && filterFn) {
      result = result.filter((item) => filterFn(item, filter));
    }
    return result;
  }, [list, search, filter, searchFields, filterFn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  return {
    search,
    setSearch,
    filter,
    setFilter,
    page,
    setPage,
    totalPages,
    totalItems: filtered.length,
    pageItems,
  };
}
