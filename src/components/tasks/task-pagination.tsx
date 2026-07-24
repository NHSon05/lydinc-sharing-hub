'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { TaskPagination } from './task-ui.types';

interface TaskPaginationProps {
  pagination: TaskPagination;
  onPageChange?: (page: number) => void;
}

export function TaskPagination({ pagination, onPageChange }: TaskPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    if (onPageChange) {
      onPageChange(newPage);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', newSize.toString());
    params.set('page', '1');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <span>Hiển thị</span>
        <select
          value={pagination.pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors"
          aria-label="Kích thước trang"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>dòng mỗi trang</span>
      </div>

      {/* Pages Info */}
      <div className="text-xs text-zinc-400">
        Từ <span className="font-semibold text-zinc-200">{(pagination.page - 1) * pagination.pageSize + 1}</span>{' '}
        đến{' '}
        <span className="font-semibold text-zinc-200">
          {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}
        </span>{' '}
        trong tổng số{' '}
        <span className="font-semibold text-zinc-200">{pagination.totalItems}</span> kết quả
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-zinc-950 disabled:hover:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Trang trước"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
          .filter((p) => Math.abs(p - pagination.page) <= 1 || p === 1 || p === pagination.totalPages)
          .map((p, idx, arr) => {
            const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
            return (
              <React.Fragment key={p}>
                {showEllipsis && <span className="px-2 text-zinc-650 text-xs">...</span>}
                <button
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-colors cursor-pointer ${
                    p === pagination.page
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 text-zinc-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        <button
          type="button"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-zinc-950 disabled:hover:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Trang sau"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
