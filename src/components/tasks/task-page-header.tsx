'use client';

import React from 'react';

interface TaskPageHeaderProps {
  canCreate: boolean;
  onCreateClick: () => void;
}

export function TaskPageHeader({ canCreate, onCreateClick }: TaskPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Quản lý nhiệm vụ
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Theo dõi, phân công và cập nhật tiến độ các nhiệm vụ trong dự án.
        </p>
      </div>

      {canCreate && (
        <button
          type="button"
          onClick={onCreateClick}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/10 transition-all duration-200 hover:shadow-purple-600/20 active:scale-98 cursor-pointer shrink-0"
        >
          + Tạo nhiệm vụ mới
        </button>
      )}
    </div>
  );
}
