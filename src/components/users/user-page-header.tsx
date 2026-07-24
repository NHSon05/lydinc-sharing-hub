'use client';

import React from 'react';

interface UserPageHeaderProps {
  isAdmin: boolean;
  onOpenCreateModal: () => void;
}

export function UserPageHeader({
  isAdmin,
  onOpenCreateModal,
}: UserPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Quản lý người dùng
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Quản lý tài khoản, vai trò, trạng thái và phòng ban của người dùng trong hệ thống.
        </p>
      </div>

      {isAdmin && (
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all duration-200 cursor-pointer shrink-0 active:scale-98"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm người dùng
        </button>
      )}
    </div>
  );
}
