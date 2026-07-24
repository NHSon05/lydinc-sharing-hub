'use client';

import React from 'react';
import Link from 'next/link';
import type { TaskItem } from './task-ui.types';
import { TaskStatusBadge } from './task-status-badge';
import { TaskPriorityBadge } from './task-priority-badge';

interface TaskTableRowProps {
  index: number;
  task: TaskItem;
  userId: string;
  userRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
  onEdit: (task: TaskItem) => void;
  onChangeStatus: (task: TaskItem) => void;
  onChangeAssignee: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
}

export function TaskTableRow({
  index,
  task,
  userId,
  userRole,
  onEdit,
  onChangeStatus,
  onChangeAssignee,
  onDelete,
}: TaskTableRowProps) {
  const formatDate = (dateInput: string | Date | null): string => {
    if (!dateInput) return '-';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isProjectManager = task.project ? task.project.managerId === userId : false;
  const isAssignee = task.assignee?.id === userId;

  const canManageAssignee = userRole === 'ADMIN' || isProjectManager;
  const canDelete = userRole === 'ADMIN' || isProjectManager;
  const canUpdate = userRole === 'ADMIN' || isProjectManager || isAssignee;

  // Compute overdue display state
  const isTaskOverdue = task.isOverdue;

  return (
    <tr className="border-b border-zinc-800/60 hover:bg-zinc-900/40 transition-colors">
      {/* STT */}
      <td className="px-6 py-3.5 text-xs text-zinc-400 font-mono w-12 text-center">
        {index}
      </td>

      {/* Nhiệm vụ */}
      <td className="px-6 py-3.5 text-xs font-semibold text-white min-w-[200px]">
        <Link
          href={`/tasks/${task.id}`}
          className="hover:text-purple-400 hover:underline transition-colors block line-clamp-1"
          title={task.title}
        >
          {task.title}
        </Link>
      </td>

      {/* Dự án */}
      <td className="px-6 py-3.5 text-xs text-zinc-300 min-w-[140px] whitespace-nowrap">
        <span className="font-mono text-purple-400 font-semibold mr-1.5 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
          {task.project.code}
        </span>
        <span className="text-zinc-200">{task.project.name}</span>
      </td>

      {/* Người thực hiện */}
      <td className="px-6 py-3.5 text-xs text-zinc-300 min-w-[150px] whitespace-nowrap">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 shrink-0 text-[10px]">
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
            <span className="truncate max-w-[110px]" title={task.assignee.name}>
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-zinc-600 italic">Chưa giao</span>
        )}
      </td>

      {/* Độ ưu tiên */}
      <td className="px-6 py-3.5 text-xs whitespace-nowrap">
        <TaskPriorityBadge priority={task.priority} />
      </td>

      {/* Tiến độ */}
      <td className="px-6 py-3.5 text-xs min-w-[130px] whitespace-nowrap">
        <div className="flex items-center gap-3 w-28">
          <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {task.progress}%
          </span>
        </div>
      </td>

      {/* Trạng thái */}
      <td className="px-6 py-3.5 text-xs whitespace-nowrap">
        <TaskStatusBadge status={task.status} />
      </td>

      {/* Thời hạn */}
      <td className="px-6 py-3.5 text-xs font-mono whitespace-nowrap">
        <div className="flex flex-col">
          <span className={isTaskOverdue ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
            {formatDate(task.dueDate)}
          </span>
          {isTaskOverdue && (
            <span className="text-[9px] text-rose-500 font-semibold uppercase tracking-wider mt-0.5 animate-pulse">
              Quá hạn
            </span>
          )}
        </div>
      </td>

      {/* Thao tác */}
      <td className="px-6 py-3.5 text-xs text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/tasks/${task.id}`}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Chi tiết
          </Link>

          {canUpdate && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Sửa
            </button>
          )}

          <button
            type="button"
            onClick={() => onChangeStatus(task)}
            className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-700 text-zinc-300 border border-zinc-750 text-xs font-medium transition-colors cursor-pointer"
          >
            Trạng thái
          </button>

          {canManageAssignee && (
            <button
              type="button"
              onClick={() => onChangeAssignee(task)}
              className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-purple-950/40 hover:border-purple-700/50 hover:text-purple-300 border border-zinc-750 text-zinc-400 text-xs font-medium transition-colors cursor-pointer"
            >
              Giao việc
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors cursor-pointer"
            >
              Xóa
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
