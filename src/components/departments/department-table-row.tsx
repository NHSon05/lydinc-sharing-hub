'use client';

import React from 'react';
import type { DepartmentItem } from './department-ui.types';

interface DepartmentTableRowProps {
  index: number;
  department: DepartmentItem;
  isAdmin: boolean;
  onEdit: (department: DepartmentItem) => void;
  onDelete: (department: DepartmentItem) => void;
}

export function DepartmentTableRow({
  index,
  department,
  isAdmin,
  onEdit,
  onDelete,
}: DepartmentTableRowProps) {
  const userCount = department.counts?.users ?? department._count?.users ?? 0;
  const projectCount =
    department.counts?.projects ?? department._count?.projects ?? 0;

  const formatDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <tr className="border-b border-zinc-800/60 hover:bg-zinc-900/40 transition-colors">
      {/* STT */}
      <td className="px-4 py-3.5 text-xs text-zinc-400 font-mono w-12 text-center">
        {index}
      </td>

      {/* Tên phòng ban */}
      <td className="px-4 py-3.5 text-xs font-semibold text-white">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
          <span
            className="truncate max-w-50 sm:max-w-70"
            title={department.name}
          >
            {department.name}
          </span>
        </div>
      </td>

      {/* Mô tả */}
      <td className="px-4 py-3.5 text-xs text-zinc-400 max-w-xs">
        <span
          className="line-clamp-2 leading-relaxed"
          title={department.description || 'Chưa có mô tả'}
        >
          {department.description || (
            <span className="text-zinc-600 italic">Chưa có mô tả</span>
          )}
        </span>
      </td>

      {/* Số nhân sự */}
      <td className="px-4 py-3.5 text-xs text-center font-medium">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
          {userCount}
        </span>
      </td>

      {/* Số dự án */}
      <td className="px-4 py-3.5 text-xs text-center font-medium">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
          {projectCount}
        </span>
      </td>

      {/* Ngày tạo */}
      <td className="px-4 py-3.5 text-xs text-zinc-400 font-mono">
        {formatDate(department.createdAt)}
      </td>

      {/* Thao tác (Chỉ dành cho ADMIN) */}
      {isAdmin && (
        <td className="px-4 py-3.5 text-xs text-right space-x-2">
          <button
            type="button"
            onClick={() => onEdit(department)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            aria-label={`Chỉnh sửa phòng ban ${department.name}`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Sửa
          </button>

          <button
            type="button"
            onClick={() => onDelete(department)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors cursor-pointer"
            aria-label={`Xóa phòng ban ${department.name}`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Xóa
          </button>
        </td>
      )}
    </tr>
  );
}
