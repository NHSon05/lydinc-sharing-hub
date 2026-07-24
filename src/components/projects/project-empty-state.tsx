'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ProjectEmptyStateProps {
  isFiltered: boolean;
  canCreate: boolean;
  onOpenCreateModal: () => void;
}

export function ProjectEmptyState({
  isFiltered,
  canCreate,
  onOpenCreateModal,
}: ProjectEmptyStateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const handleClearFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
      <div className="w-12 h-12 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 mb-4">
        {isFiltered ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-bold text-white mb-1">
        {isFiltered ? 'Không tìm thấy dự án' : 'Chưa có dự án'}
      </h3>

      <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {isFiltered
          ? 'Không có dự án nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.'
          : 'Hãy tạo dự án đầu tiên để bắt đầu tổ chức và phân quyền các nhiệm vụ.'}
      </p>

      {isFiltered ? (
        <button
          type="button"
          onClick={handleClearFilters}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          Xóa bộ lọc
        </button>
      ) : (
        canCreate && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all duration-200 cursor-pointer active:scale-98"
          >
            + Tạo dự án
          </button>
        )
      )}
    </div>
  );
}
