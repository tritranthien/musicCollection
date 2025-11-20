import { useEffect, useRef, useState } from "react";
import { useCategories } from "../../context/CategoryContext";
import styles from "./DocumentFilter.module.css";

export default function DocumentFilterAdvanced({
    activeFilters,
    onFilterChange = () => { },
    onReset = () => { },
    hasActiveFilters = false,
    activeFilterCount = 0,
    isLoading = false,
    disabledFilters = []
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState(activeFilters.searchText || "");
    const searchInputRef = useRef(null);
    const { customCategories } = useCategories();
    const categoryTemps = customCategories.map((category) => {
        if (category.rootPath === '/thong-tin-suu-tam') {
            return {
                value: category.id,
                label: category.name,
            };
        }
        return null;
    }).filter((category) => category !== null);
    const categories = [{ value: 'all', label: 'Tất cả' }, ...categoryTemps];
    const isDisabled = (filter) => {
        return isLoading || disabledFilters.includes(filter);
    };
    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);
    useEffect(() => {
        const handler = setTimeout(() => {
            onFilterChange({
                ...activeFilters,
                searchText: searchValue,
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [searchValue]);

    const checkActiveFilterCount = () => {
        let count = 0;
        if (activeFilters.searchText.trim() && !disabledFilters.includes('searchText')) count++;
        if (activeFilters.category && !disabledFilters.includes('category')) count++;
        if (activeFilters.dateRange !== "all" && !disabledFilters.includes('dateRange')) count++;
        if (activeFilters.dateFrom || activeFilters.dateTo && !disabledFilters.includes('dateFrom') && !disabledFilters.includes('dateTo')) count++;
        if (activeFilters.sortBy !== "createdAt-desc" && !disabledFilters.includes('sortBy')) count++;
        if (activeFilters.owner && !disabledFilters.includes('owner')) count++;
        if (activeFilters.tags && activeFilters.tags.length > 0 && !disabledFilters.includes('tags')) count++;
        return count;
    };
    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterHeader}>
                <div className={styles.filterHeaderLeft}>
                    <button
                        className={styles.toggleButton}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? "▼" : "▶"} Bộ lọc
                        {activeFilterCount > 0 && (
                            <span className={styles.activeCount}>{activeFilterCount}</span>
                        )}
                    </button>

                    <div className={styles.searchWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Tìm kiếm tài liệu..."
                            value={searchValue}
                            onChange={handleSearchChange}
                        />
                        {activeFilters.searchText && (
                            <button
                                className={styles.clearSearch}
                                onClick={() => setSearchValue("")}
                                disabled={isDisabled('searchText')}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {checkActiveFilterCount() > 0 && (
                    <button
                        className={styles.resetButton}
                        onClick={onReset}
                        disabled={isDisabled('reset')}
                    >
                        🔄 Đặt lại bộ lọc
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className={styles.filterBody}>
                    <div className={styles.filterGrid}>
                        {/* Loại tài liệu */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>📑 Loại tài liệu</label>
                            <select
                                className={styles.filterSelect}
                                value={activeFilters.categoryId || "all"}
                                onChange={(e) => onFilterChange({ ...activeFilters, categoryId: e.target.value })}
                                disabled={isDisabled('category')}
                            >
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Khoảng thời gian */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>📅 Khoảng thời gian</label>
                            <select
                                className={styles.filterSelect}
                                value={activeFilters.dateRange || "all"}
                                onChange={(e) => onFilterChange({ ...activeFilters, dateRange: e.target.value })}
                                disabled={isDisabled('dateRange')}
                            >
                                <option value="all">Tất cả thời gian</option>
                                <option value="today">Hôm nay</option>
                                <option value="week">7 ngày qua</option>
                                <option value="month">30 ngày qua</option>
                                <option value="3months">3 tháng qua</option>
                                <option value="year">1 năm qua</option>
                            </select>
                        </div>

                        {/* Sắp xếp */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>↕️ Sắp xếp theo</label>
                            <select
                                className={styles.filterSelect}
                                value={activeFilters.sortBy || "createdAt-desc"}
                                onChange={(e) => onFilterChange({ ...activeFilters, sortBy: e.target.value })}
                                disabled={isDisabled('sortBy')}
                            >
                                <option value="createdAt-desc">Mới nhất trước</option>
                                <option value="createdAt-asc">Cũ nhất trước</option>
                                <option value="updatedAt-desc">Cập nhật gần đây</option>
                                <option value="title-asc">Tên A → Z</option>
                                <option value="title-desc">Tên Z → A</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className={styles.loadingIndicator}>
                    🔄 Đang lọc dữ liệu...
                </div>
            )}
        </div>
    );
}