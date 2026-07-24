'use client';

import React from 'react';

interface TaskEmptyStateProps {
  isFiltered: boolean;
  canCreate: boolean;
  onCreateClick: () => void;
  onClearFilters: () => void;
}

export function TaskEmptyState({
  isFiltered,
  canCreate,
  onCreateClick,
  onClearFilters,
}: TaskEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 min-h-80">
        <div className="w-12 h-12 rounded-2xl bg-zinc-850 flex items-center justify-center text-zinc-500 mb-4 border border-zinc-800">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-zinc-200">Không tìm thấy nhiệm vụ</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">
          Không có nhiệm vụ nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-98"
        >
          Xóa bộ lọc
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 min-h-80">
      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 border border-purple-500/20 animate-pulse">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-zinc-200">Chưa có nhiệm vụ</h3>
      <p className="text-xs text-zinc-500 mt-1 max-w-sm">
        Hãy tạo nhiệm vụ đầu tiên để bắt đầu quản lý và phân chia công việc trong dự án.
      </p>
      {canCreate && (
        <button
          type="button"
          onClick={onCreateClick}
          className="mt-5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/10 transition-all duration-200 hover:shadow-purple-600/20 active:scale-98 cursor-pointer"
        >
          + Tạo nhiệm vụ
        </button>
      )}
    </div>
  );
}
