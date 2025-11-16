import { useState, useEffect, useRef } from "react";
import { useFetcherWithReset } from "./useFetcherWithReset";
import { deepEqual } from "../helper/dataHelper";

export default function useFilter(
  initialData = null,
  endpoint = null,
  initialPage = 1,
  initialLimit = 20,
  initialFilters = {},
  key = ""
) {
  const fetcher = useFetcherWithReset();

  // initData là bản gốc (loader)
  const [initData, setInitData] = useState(initialData);

  // data là bản hiển thị (sẽ cập nhật khi fetcher có dữ liệu mới)
  const [data, setData] = useState(initialData);

  const [activeFilters, setActiveFilters] = useState({
    search: initialFilters.search || "",
    types: initialFilters.types || [],
    classes: initialFilters.classes || [],
    dateFrom: initialFilters.dateFrom || "",
    dateTo: initialFilters.dateTo || "",
    owner: initialFilters.owner || "",
    category: initialFilters.category || "",
    minSize: initialFilters.minSize || "",
    maxSize: initialFilters.maxSize || "",
  });

  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
  });

  const isLoading = fetcher.state !== "idle";
  
  // ⚡ Khi initialData thay đổi (VD: điều hướng Remix)
  useEffect(() => {
    setInitData(initialData);
    setData(initialData);
  }, [key]);

  // ✅ Khi fetcher có data mới -> cập nhật vào state + reset fetcher
  useEffect(() => {    
    if (fetcher.data !== undefined && fetcher.data !== null) {
      setData(fetcher.data);
      fetcher.reset();
    }
  }, [fetcher]);

  // 🔎 Gửi request filter lên server
  const filter = (filters, resetPage = true) => {
    if (!endpoint) return console.warn("No endpoint provided for filter");
    const newFilters = { ...activeFilters, ...filters };
    
    if (deepEqual(newFilters, initialFilters)) {
      setData(initialData);
      setActiveFilters(newFilters);
      return;
    }

    setActiveFilters(newFilters);

    const newPagination = resetPage
      ? { page: 1, limit: pagination.limit }
      : pagination;

    if (resetPage) setPagination(newPagination);

    fetcher.submit(
      {
        intent: "filter",
        ...newFilters,
        page: newPagination.page,
        limit: newPagination.limit,
        classes: JSON.stringify(newFilters.classes),
        types: JSON.stringify(newFilters.types),
      },
      { method: "post", action: endpoint }
    );
  };

  // 📄 Pagination helpers
  const goToPage = (page) => {
    if (!endpoint) return;
    setPagination((prev) => ({ ...prev, page }));
    fetcher.submit(
      {
        intent: "filter",
        ...activeFilters,
        page,
        limit: pagination.limit,
        classes: JSON.stringify(activeFilters.classes),
        types: JSON.stringify(activeFilters.types),
      },
      { method: "post", action: endpoint }
    );
  };

  const changeLimit = (limit) => {
    if (!endpoint) return;
    setPagination({ page: 1, limit });
    fetcher.submit(
      {
        intent: "filter",
        ...activeFilters,
        page: 1,
        limit,
        classes: JSON.stringify(activeFilters.classes),
        types: JSON.stringify(activeFilters.types),
      },
      { method: "post", action: endpoint }
    );
  };

  const nextPage = () => {
    const totalPages = Math.ceil((data?.total || 0) / pagination.limit);
    if (pagination.page < totalPages) goToPage(pagination.page + 1);
  };

  const previousPage = () => {
    if (pagination.page > 1) goToPage(pagination.page - 1);
  };

  // 🧹 Reset filters
  const resetFilters = () => {
    if (!endpoint) return;

    const emptyFilters = {
      search: "",
      types: [],
      classes: [],
      dateFrom: null,
      dateTo: null,
      owner: "",
      category: "",
      minSize: "",
      maxSize: "",
    };

    if (deepEqual(activeFilters, emptyFilters)) return;

    setActiveFilters(emptyFilters);
    setPagination({ page: 1, limit: pagination.limit });

    fetcher.submit(
      {
        intent: "filter",
        ...emptyFilters,
        page: 1,
        limit: pagination.limit,
        classes: JSON.stringify([]),
        types: JSON.stringify([]),
      },
      { method: "post", action: endpoint }
    );
  };

  const hasActiveFilters = () => {
    const empty = {
      search: "",
      types: [],
      classes: [],
      dateFrom: null,
      dateTo: null,
      owner: "",
      category: "",
      minSize: "",
      maxSize: "",
    };
    return !deepEqual(activeFilters, empty);
  };
  const reFetch = () => {
    fetcher.submit(
      {
        intent: "filter",
        ...activeFilters,
        page: pagination.page,
        limit: pagination.limit,
        classes: JSON.stringify(activeFilters.classes),
        types: JSON.stringify(activeFilters.types),
      },
      { method: "post", action: endpoint }
    );
  };
  // 📊 Pagination info
  const totalPages = Math.ceil((data?.total || 0) / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPreviousPage = pagination.page > 1;
  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, data?.total || 0);
  return {
    filter,
    resetFilters,
    initData, // 🔹 giữ nguyên để debug/so sánh khi cần
    filterResult: data?.files || [],
    filtering: isLoading,
    error: data?.error || null,
    activeFilters,
    hasActiveFilters: hasActiveFilters(),
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
