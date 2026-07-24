'use client';

import React from 'react';
import Link from 'next/link';
import type { TaskItem } from './task-ui.types';
import { TaskStatusBadge } from './task-status-badge';
import { TaskPriorityBadge } from './task-priority-badge';

interface TaskCardProps {
  task: TaskItem;
  userId: string;
  userRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
  onEdit: (task: TaskItem) => void;
  onChangeStatus: (task: TaskItem) => void;
  onChangeAssignee: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
}

export function TaskCard({
  task,
  userId,
  userRole,
  onEdit,
  onChangeStatus,
  onChangeAssignee,
  onDelete,
}: TaskCardProps) {
  const isProjectManager = task.project ? task.project.managerId === userId : false;
  const isAssignee = task.assignee?.id === userId;

  const canManageAssignee = userRole === 'ADMIN' || isProjectManager;
  const canDelete = userRole === 'ADMIN' || isProjectManager;
  const canUpdate = userRole === 'ADMIN' || isProjectManager || isAssignee;

  const formatDate = (dateInput: string | Date | null): string => {
    if (!dateInput) return '-';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md space-y-4">
      {/* Top Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
            {task.project.code}
          </span>
          <Link
            href={`/tasks/${task.id}`}
            className="block text-sm font-semibold text-white hover:text-purple-400 hover:underline transition-colors mt-1"
          >
            {task.title}
          </Link>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </div>
      </div>

      {/* Progress & Description */}
      {task.description && (
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <span>Tiến độ</span>
          <span className="font-mono">{task.progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Metadata Info */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-zinc-800/40">
        <div>
          <span className="block text-[10px] text-zinc-500">Người thực hiện</span>
          {task.assignee ? (
            <span className="font-medium text-zinc-200">{task.assignee.name}</span>
          ) : (
            <span className="text-zinc-600 italic">Chưa giao</span>
          )}
        </div>
        <div>
          <span className="block text-[10px] text-zinc-500">Thời hạn</span>
          <span className={task.isOverdue ? 'font-bold text-rose-400' : 'text-zinc-300 font-mono'}>
            {formatDate(task.dueDate)}
            {task.isOverdue && ' (Quá hạn)'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-800/40">
        <Link
          href={`/tasks/${task.id}`}
          className="flex-1 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors text-center"
        >
          Chi tiết
        </Link>
        {canUpdate && (
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="flex-1 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Sửa
          </button>
        )}
        <button
          type="button"
          onClick={() => onChangeStatus(task)}
          className="px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-750 text-zinc-300 border border-zinc-850 text-xs font-semibold transition-colors cursor-pointer"
        >
          Trạng thái
        </button>
        {canManageAssignee && (
          <button
            type="button"
            onClick={() => onChangeAssignee(task)}
            className="px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-purple-950/40 hover:border-purple-700/50 hover:text-purple-300 border border-zinc-750 text-zinc-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            Giao việc
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            Xóa
          </button>
        )}
      </div>
    </div>
  );
}
