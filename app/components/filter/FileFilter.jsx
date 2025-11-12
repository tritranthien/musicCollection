import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Calendar, FileType, User, GraduationCap } from 'lucide-react';

export const FileFilter = ({ onFilterChange, initialFilters = {}, disabledFilters = [] }) => {
  const [filters, setFilters] = useState({
    search: '',
    types: [], // Thay đổi từ type sang types (array)
    classes: [], // Thêm filter lớp
    dateFrom: '',
    dateTo: '',
    ownerName: '',
    minSize: '',
    maxSize: '',
    ...initialFilters
  });
  const isFirstRender = useRef(true);
  const isDisabled = (field) => disabledFilters.includes(field);
  const [isExpanded, setIsExpanded] = useState(false);

  // File types phổ biến
  const fileTypes = [
    { value: 'image', label: 'Hình ảnh' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'raw', label: 'Tài liệu' },
  ];

  // Danh sách lớp (có thể thay đổi theo nhu cầu)
  const classes = [
    { value: 1, label: 'Lớp 1' },
    { value: 2, label: 'Lớp 2' },
    { value: 3, label: 'Lớp 3' },
    { value: 4, label: 'Lớp 4' },
    { value: 5, label: 'Lớp 5' },
    { value: 6, label: 'Lớp 6' },
    { value: 7, label: 'Lớp 7' },
    { value: 8, label: 'Lớp 8' },
    { value: 9, label: 'Lớp 9' },
    { value: 10, label: 'Lớp 10' },
    { value: 11, label: 'Lớp 11' },
    { value: 12, label: 'Lớp 12' },
  ];

  useEffect(() => {
    // Debounce để tránh call API quá nhiều
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeoutId = setTimeout(() => {
      onFilterChange(filters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleChange = (field, value) => {
    if (isDisabled(field)) return;
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayFilter = (field, value) => {
    setFilters(prev => {
      const currentArray = prev[field] || [];
      const isSelected = currentArray.includes(value);

      return {
        ...prev,
        [field]: isSelected
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };
  const clearFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      if (isDisabled(key)) {
        acc[key] = filters[key]; // giữ nguyên filter bị disable
      } else {
        // reset các filter khác
        if (Array.isArray(filters[key])) acc[key] = [];
        else acc[key] = '';
      }
      return acc;
    }, {});
    setFilters(clearedFilters);
  };

  const hasActiveFilters = () => {
    return filters.search !== '' ||
      filters.types.length > 0 ||
      filters.classes.length > 0 ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.ownerName !== '' ||
      filters.minSize !== '' ||
      filters.maxSize !== '';
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.types.length > 0) count++;
    if (filters.classes.length > 0) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.ownerName) count++;
    if (filters.minSize) count++;
    if (filters.maxSize) count++;
    return count;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Header với Search chính */}
      <div className="flex gap-3 items-center mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên file, mô tả..."
            value={filters.search}
            disabled={isDisabled('search')}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm ${isExpanded || hasActiveFilters()
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">Lọc</span>
          {hasActiveFilters() && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {getActiveFilterCount()}
            </span>
          )}
        </button>

        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-all text-sm"
          >
            <X className="w-4 h-4" />
            <span className="font-medium">Xóa</span>
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          {/* Row 1: Loại file và Lớp (Multiple Select) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Loại file - Multiple */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <FileType className="w-3.5 h-3.5" />
                Loại file
              </label>
              <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {fileTypes.map(type => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type.value)}
                        onChange={() => toggleArrayFilter('types', type.value)}
                        disabled={isDisabled('types')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {filters.types.length > 0 && (
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  Đã chọn: {filters.types.length} loại
                </div>
              )}
            </div>

            {/* Lớp - Multiple */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                Lớp
              </label>
              <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {classes.map(cls => (
                    <label key={cls.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded">
                      <input
                        type="checkbox"
                        checked={filters.classes.includes(cls.value)}
                        onChange={() => toggleArrayFilter('classes', cls.value)}
                        disabled={isDisabled('classes')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{cls.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {filters.classes.length > 0 && (
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  Đã chọn: {filters.classes.length} lớp
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Các filter khác */}
          <div className="flex flex-wrap items-end gap-3">
            {/* Người tạo */}
            <div className="w-48">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <User className="w-3.5 h-3.5" />
                Người tạo
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên..."
                value={filters.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                disabled={isDisabled('ownerName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Từ ngày */}
            <div className="w-40">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Từ ngày
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
                disabled={isDisabled('dateFrom')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Đến ngày */}
            <div className="w-40">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Đến ngày
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleChange('dateTo', e.target.value)}
                disabled={isDisabled('dateTo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Size min */}
            <div className="w-32">
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Size min (MB)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minSize ? formatFileSize(filters.minSize) : ''}
                onChange={(e) => handleChange('minSize', e.target.value ? e.target.value * 1024 * 1024 : '')}
                disabled={isDisabled('minSize')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Size max */}
            <div className="w-32">
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Size max (MB)
              </label>
              <input
                type="number"
                placeholder="∞"
                value={filters.maxSize ? formatFileSize(filters.maxSize) : ''}
                onChange={(e) => handleChange('maxSize', e.target.value ? e.target.value * 1024 * 1024 : '')}
                disabled={isDisabled('maxSize')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Tìm: "{filters.search}"
                  {!isDisabled('search') && (
                    <button onClick={() => handleChange('search', '')} className="hover:bg-blue-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              )}
              {filters.types.map(type => (
                <span key={type} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  {fileTypes.find(t => t.value === type)?.label}
                  {!isDisabled('types') && (
                    <button onClick={() => toggleArrayFilter('types', type)} className="hover:bg-purple-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}

              {filters.classes.map(cls => (
                <span key={cls} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {classes.find(c => c.value === cls)?.label}
                  {!isDisabled('classes') && (
                    <button onClick={() => toggleArrayFilter('classes', cls)} className="hover:bg-green-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {filters.ownerName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                  Người tạo: {filters.ownerName}
                  {!isDisabled('ownerName') && (
                    <button onClick={() => handleChange('ownerName', '')} className="hover:bg-amber-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              )}
              {filters.dateFrom && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                  Từ ngày: {new Date(filters.dateFrom).toLocaleDateString('vi-VN')}
                  {!isDisabled('dateFrom') && (
                    <button
                      onClick={() => handleChange('dateFrom', '')}
                      className="hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              )}

              {filters.dateTo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                  Đến ngày: {new Date(filters.dateTo).toLocaleDateString('vi-VN')}
                  {!isDisabled('dateTo') && (
                    <button
                      onClick={() => handleChange('dateTo', '')}
                      className="hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
