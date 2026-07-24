'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface UserEmptyStateProps {
  isFiltered: boolean;
  isAdmin: boolean;
  onOpenCreateModal: () => void;
}

export function UserEmptyState({
  isFiltered,
  isAdmin,
  onOpenCreateModal,
}: UserEmptyStateProps) {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-bold text-white mb-1">
        {isFiltered ? 'Không tìm thấy người dùng' : 'Chưa có người dùng'}
      </h3>

      <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {isFiltered
          ? 'Không có người dùng nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.'
          : 'Hãy tạo tài khoản đầu tiên để bắt đầu phân quyền và tổ chức nhân sự trong hệ thống.'}
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
        isAdmin && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all duration-200 cursor-pointer active:scale-98"
          >
            + Thêm người dùng
          </button>
        )
      )}
    </div>
  );
}
