import { useFetcher } from 'react-router';
import { useState, useRef } from 'react';

export default function useFilter(
  initialData = null, 
  endpoint = null, 
  initialPage = 1, 
  initialLimit = 20,
  initialFilters = {}
) {
  const fetcher = useFetcher();
  const [activeFilters, setActiveFilters] = useState({
    search: initialFilters.search || '',
    types: initialFilters.types || [], // Changed to array
    classes: initialFilters.classes || [],
    dateFrom: initialFilters.dateFrom || null,
    dateTo: initialFilters.dateTo || null,
    owner: initialFilters.owner || '',
    category: initialFilters.category || '',
  });
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
  });
  const preFilters = useRef(activeFilters);
  // Determine data source: fetcher data or initial data
  const data = fetcher.data || initialData;
  const isLoading = fetcher.state !== 'idle';

  // Submit filter request to server với pagination
  const filter = (filters, resetPage = true) => {
    if (!endpoint) {
      console.warn('No endpoint provided for filter');
      return;
    }
    const newFilters = {
      ...activeFilters,
      ...filters
    };
    if (JSON.stringify(newFilters) === JSON.stringify(preFilters.current)) return;
    setActiveFilters(newFilters);
    preFilters.current = newFilters;
    const newPagination = resetPage 
      ? { page: 1, limit: pagination.limit }
      : pagination;
    
    if (resetPage) {
      setPagination(newPagination);
    }

    // Gửi request lên server
    fetcher.submit(
      {
        intent: 'filter',
        ...newFilters,
        page: newPagination.page,
        limit: newPagination.limit,
        classes: JSON.stringify(newFilters.classes),
        types: JSON.stringify(newFilters.types),
      },
      {
        method: 'post',
        action: endpoint,
      }
    );
  };

  // Change page
  const goToPage = (page) => {
    if (!endpoint) return;

    setPagination(prev => ({ ...prev, page }));
    fetcher.submit(
      {
        intent: 'filter',
        ...activeFilters,
        page,
        limit: pagination.limit,
        classes: JSON.stringify(activeFilters.classes),
      },
      {
        method: 'post',
        action: endpoint,
      }
    );
  };

  // Change limit
  const changeLimit = (limit) => {
    if (!endpoint) return;

    setPagination({ page: 1, limit });
    fetcher.submit(
      {
        intent: 'filter',
        ...activeFilters,
        page: 1,
        limit,
        classes: JSON.stringify(activeFilters.classes),
      },
      {
        method: 'post',
        action: endpoint,
      }
    );
  };

  // Next page
  const nextPage = () => {
    const totalPages = Math.ceil((data?.total || 0) / pagination.limit);
    if (pagination.page < totalPages) {
      goToPage(pagination.page + 1);
    }
  };

  // Previous page
  const previousPage = () => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  };

  // Reset filters
  const resetFilters = () => {
    if (!endpoint) return;

    const emptyFilters = {
      search: '',
      types: '',
      classes: [],
      dateFrom: null,
      dateTo: null,
      owner: '',
      category: '',
    };
    setActiveFilters(emptyFilters);
    setPagination({ page: 1, limit: pagination.limit });
    
    fetcher.submit(
      {
        intent: 'filter',
        ...emptyFilters,
        page: 1,
        limit: pagination.limit,
        classes: JSON.stringify([]),
      },
      {
        method: 'post',
        action: endpoint,
      }
    );
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return activeFilters.search !== '' ||
           activeFilters.types.length > 0 ||
           (activeFilters.classes && activeFilters.classes.length > 0) ||
           activeFilters.dateFrom !== null ||
           activeFilters.dateTo !== null ||
           activeFilters.owner !== '' ||
           activeFilters.category !== '';
  };

  // Calculate pagination info
  const totalPages = Math.ceil((data?.total || 0) / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPreviousPage = pagination.page > 1;
  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, data?.total || 0);

  return {
    filter,
    resetFilters,
    filterResult: data?.files || [],
    filtering: isLoading,
    error: data?.error || null,
    activeFilters,
    hasActiveFilters: hasActiveFilters(),
    
    // Pagination
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: data?.total || 0,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      startIndex,
      endIndex,
    },
    goToPage,
    nextPage,
    previousPage,
    changeLimit,
  };
}