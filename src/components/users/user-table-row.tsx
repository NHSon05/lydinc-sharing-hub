'use client';

import React from 'react';
import type { UserItem } from './user-ui.types';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';

interface UserTableRowProps {
  index: number;
  user: UserItem;
  isAdmin: boolean;
  onViewDetail: (user: UserItem) => void;
  onEdit: (user: UserItem) => void;
  onChangeStatus: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
}

export function UserTableRow({
  index,
  user,
  isAdmin,
  onViewDetail,
  onEdit,
  onChangeStatus,
  onResetPassword,
}: UserTableRowProps) {
  const formatDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <tr className="border-b border-zinc-800/60 hover:bg-zinc-900/40 transition-colors">
      {/* STT */}
      <td className="px-4 py-3.5 text-xs text-zinc-400 font-mono w-12 text-center">
        {index}
      </td>

      {/* Người dùng */}
      <td className="px-4 py-3.5 text-xs font-semibold text-white min-w-45">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 shrink-0">
            {initialLetter}
          </div>
          <span className="truncate max-w-35 block" title={user.name}>
            {user.name}
          </span>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3.5 text-xs text-zinc-400 font-mono min-w-40">
        <span className="truncate max-w-35 block" title={user.email}>
          {user.email}
        </span>
      </td>

      {/* Phòng ban */}
      <td className="px-4 py-3.5 text-xs text-zinc-300 min-w-30">
        {user.department?.name || (
          <span className="text-zinc-600 italic">Chưa phân phòng</span>
        )}
      </td>

      {/* Vai trò */}
      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
        <UserRoleBadge role={user.role} />
      </td>

      {/* Trạng thái */}
      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
        <UserStatusBadge status={user.status} />
      </td>

      {/* Ngày tạo */}
      <td className="px-4 py-3.5 text-xs text-zinc-400 font-mono whitespace-nowrap">
        {formatDate(user.createdAt)}
      </td>

      {/* Thao tác */}
      <td className="px-4 py-3.5 text-xs text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onViewDetail(user)}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            aria-label={`Xem chi tiết ${user.name}`}
          >
            Chi tiết
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => onEdit(user)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                aria-label={`Chỉnh sửa ${user.name}`}
              >
                Sửa
              </button>

              <button
                type="button"
                onClick={() => onChangeStatus(user)}
                className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-amber-950/40 hover:border-amber-700/50 hover:text-amber-300 border border-zinc-750 text-zinc-400 text-xs font-medium transition-colors cursor-pointer"
                aria-label={`Đổi trạng thái ${user.name}`}
              >
                Trạng thái
              </button>

              <button
                type="button"
                onClick={() => onResetPassword(user)}
                className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-purple-950/40 hover:border-purple-700/50 hover:text-purple-300 border border-zinc-750 text-zinc-400 text-xs font-medium transition-colors cursor-pointer"
                aria-label={`Reset mật khẩu ${user.name}`}
              >
                Reset mật khẩu
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
