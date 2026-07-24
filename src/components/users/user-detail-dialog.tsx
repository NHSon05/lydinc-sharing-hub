'use client';

import React from 'react';
import type { UserItem } from './user-ui.types';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';

interface UserDetailDialogProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailDialog({
  user,
  isOpen,
  onClose,
}: UserDetailDialogProps) {
  if (!isOpen || !user) return null;

  const formatDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-detail-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 id="user-detail-dialog-title" className="text-base font-bold text-white">
            Thông tin người dùng
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Đóng dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-lg font-bold text-purple-400 shrink-0">
            {initialLetter}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
            <p className="text-xs text-zinc-400 font-mono truncate">{user.email}</p>
          </div>
        </div>

        {/* Profile Details List */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40">
            <span className="text-zinc-400 font-medium">Phòng ban</span>
            <span className="font-semibold text-white">{user.department?.name || 'Chưa phân phòng'}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40">
            <span className="text-zinc-400 font-medium">Vai trò</span>
            <UserRoleBadge role={user.role} />
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40">
            <span className="text-zinc-400 font-medium">Trạng thái</span>
            <UserStatusBadge status={user.status} />
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40">
            <span className="text-zinc-400 font-medium">Ngày tạo</span>
            <span className="font-mono text-zinc-300">{formatDate(user.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-zinc-400 font-medium">Cập nhật lần cuối</span>
            <span className="font-mono text-zinc-300">{formatDate(user.updatedAt)}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
