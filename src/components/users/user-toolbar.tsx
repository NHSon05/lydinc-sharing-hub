'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { DepartmentOption } from './user-ui.types';

interface UserToolbarProps {
  departments: DepartmentOption[];
}

export function UserToolbar({ departments }: UserToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') || '';
  const currentRole = searchParams.get('role') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentDept = searchParams.get('departmentId') || '';

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  // Sync state during render if URL parameter changes externally
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setSearchTerm(currentSearch);
  }

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm === currentSearch) return;

      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '1');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, currentSearch, pathname, router, searchParams]);

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

  const handleClearFilters = () => {
    setSearchTerm('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const isFiltered =
    !!currentSearch || !!currentRole || !!currentStatus || !!currentDept;

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-lg">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          aria-label="Tìm kiếm người dùng"
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Role filter */}
        <select
          value={currentRole}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          aria-label="Lọc theo vai trò"
          className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị viên</option>
          <option value="MANAGER">Quản lý</option>
          <option value="MEMBER">Thành viên</option>
        </select>

        {/* Status filter */}
        <select
          value={currentStatus}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          aria-label="Lọc theo trạng thái"
          className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="INACTIVE">Không hoạt động</option>
          <option value="LOCKED">Bị khóa</option>
        </select>

        {/* Department filter */}
        <select
          value={currentDept}
          onChange={(e) => handleFilterChange('departmentId', e.target.value)}
          aria-label="Lọc theo phòng ban"
          className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors max-w-45 truncate"
        >
          <option value="">Tất cả phòng ban</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Clear Filters CTA */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
