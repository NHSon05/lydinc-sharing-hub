'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface DepartmentEmptyStateProps {
  isSearch: boolean;
  isAdmin: boolean;
  onOpenCreateModal: () => void;
}

export function DepartmentEmptyState({
  isSearch,
  isAdmin,
  onOpenCreateModal,
}: DepartmentEmptyStateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
      <div className="w-12 h-12 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 mb-4">
        {isSearch ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-bold text-white mb-1">
        {isSearch ? 'Không tìm thấy phòng ban' : 'Chưa có phòng ban'}
      </h3>

      <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {isSearch
          ? 'Không có phòng ban nào phù hợp với từ khóa tìm kiếm.'
          : 'Hãy tạo phòng ban đầu tiên để bắt đầu tổ chức người dùng và dự án.'}
      </p>

      {isSearch ? (
        <button
          type="button"
          onClick={handleClearFilter}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          Xóa bộ lọc
        </button>
      ) : (
        isAdmin && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all duration-200 cursor-pointer active:scale-98"
          >
            + Thêm phòng ban
          </button>
        )
      )}
    </div>
  );
}
