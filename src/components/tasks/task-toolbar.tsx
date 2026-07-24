'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { ProjectOption } from './task-ui.types';

interface TaskToolbarProps {
  projects: ProjectOption[];
  currentSearch: string;
  currentStatus: string;
  currentPriority: string;
  currentProjectId: string;
  currentOverdue: string;
}

export function TaskToolbar({
  projects,
  currentSearch,
  currentStatus,
  currentPriority,
  currentProjectId,
  currentOverdue,
}: TaskToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Debounce search term update
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set('search', searchTerm);
      } else {
        params.delete('search');
      }
      params.set('page', '1');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const isFiltered =
    !!currentSearch ||
    !!currentStatus ||
    !!currentPriority ||
    !!currentProjectId ||
    currentOverdue === 'true';

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between p-4 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md shadow-lg">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tiêu đề nhiệm vụ..."
          aria-label="Tìm kiếm nhiệm vụ"
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Project Select */}
        <select
          value={currentProjectId}
          onChange={(e) => handleFilterChange('projectId', e.target.value)}
          aria-label="Lọc theo dự án"
          className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors max-w-[180px] truncate"
        >
          <option value="">Tất cả dự án</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.name}
            </option>
          ))}
        </select>

        {/* Status Select */}
        <select
          value={currentStatus}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          aria-label="Lọc theo trạng thái"
          className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="TODO">Chưa thực hiện</option>
          <option value="IN_PROGRESS">Đang thực hiện</option>
          <option value="REVIEW">Chờ đánh giá</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>

        {/* Priority Select */}
        <select
          value={currentPriority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          aria-label="Lọc theo độ ưu tiên"
          className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">Tất cả mức độ</option>
          <option value="LOW">Thấp</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HIGH">Cao</option>
          <option value="URGENT">Khẩn cấp</option>
        </select>

        {/* Overdue Select */}
        <select
          value={currentOverdue}
          onChange={(e) => handleFilterChange('overdue', e.target.value)}
          aria-label="Lọc theo thời hạn"
          className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">Tất cả thời hạn</option>
          <option value="true">Quá hạn</option>
          <option value="false">Trong hạn</option>
        </select>

        {/* Reset Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer border border-zinc-700/50"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
