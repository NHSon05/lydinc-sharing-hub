'use client';

import React from 'react';
import Link from 'next/link';
import type { ProjectItem } from './project-ui.types';
import { ProjectStatusBadge } from './project-status-badge';
import { ProjectProgress } from './project-progress';

interface ProjectTableRowProps {
  index: number;
  project: ProjectItem;
  canManage: boolean;
  onEdit: (project: ProjectItem) => void;
  onChangeStatus: (project: ProjectItem) => void;
  onDelete: (project: ProjectItem) => void;
}

export function ProjectTableRow({
  index,
  project,
  canManage,
  onEdit,
  onChangeStatus,
  onDelete,
}: ProjectTableRowProps) {
  const formatDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const totalTasks = project.taskSummary?.total ?? 0;
  const completedTasks = project.taskSummary?.completed ?? 0;

  // Progress formula = completed / total task ratio or db progress if available
  const calculatedProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <tr className="border-b border-zinc-800/60 hover:bg-zinc-900/40 transition-colors">
      {/* STT */}
      <td className="px-4 py-3.5 text-xs text-zinc-400 font-mono w-12 text-center">
        {index}
      </td>

      {/* Mã dự án */}
      <td className="px-4 py-3.5 text-xs font-mono font-semibold text-purple-400 whitespace-nowrap">
        {project.code}
      </td>

      {/* Tên dự án */}
      <td className="px-4 py-3.5 text-xs font-semibold text-white min-w-50">
        <Link
          href={`/projects/${project.id}`}
          className="hover:text-purple-400 hover:underline transition-colors block line-clamp-2"
          title={project.name}
        >
          {project.name}
        </Link>
      </td>

      {/* Phòng ban */}
      <td className="px-4 py-3.5 text-xs text-zinc-300 min-w-30">
        {project.department?.name || (
          <span className="text-zinc-600 italic">Chưa phân phòng</span>
        )}
      </td>

      {/* Người quản lý */}
      <td className="px-4 py-3.5 text-xs text-zinc-300 min-w-35 whitespace-nowrap">
        {project.manager?.name || '-'}
      </td>

      {/* Trạng thái */}
      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
        <ProjectStatusBadge status={project.status} />
      </td>

      {/* Tiến độ */}
      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
        <ProjectProgress progress={calculatedProgress} />
      </td>

      {/* Thành viên */}
      <td className="px-4 py-3.5 text-xs text-center font-mono font-medium text-zinc-300 whitespace-nowrap">
        {project.memberCount}
      </td>

      {/* Nhiệm vụ */}
      <td className="px-4 py-3.5 text-xs text-center font-mono font-medium text-zinc-300 whitespace-nowrap">
        {completedTasks}/{totalTasks}
      </td>

      {/* Thời gian */}
      <td className="px-4 py-3.5 text-xs text-zinc-400 font-mono whitespace-nowrap">
        {formatDate(project.startDate)} - {formatDate(project.endDate)}
      </td>

      {/* Thao tác */}
      <td className="px-4 py-3.5 text-xs text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/projects/${project.id}`}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Chi tiết
          </Link>

          {canManage && (
            <>
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                aria-label={`Chỉnh sửa ${project.name}`}
              >
                Sửa
              </button>

              <button
                type="button"
                onClick={() => onChangeStatus(project)}
                className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-amber-950/40 hover:border-amber-700/50 hover:text-amber-300 border border-zinc-750 text-zinc-400 text-xs font-medium transition-colors cursor-pointer"
                aria-label={`Đổi trạng thái ${project.name}`}
              >
                Trạng thái
              </button>

              <button
                type="button"
                onClick={() => onDelete(project)}
                className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors cursor-pointer"
                aria-label={`Xóa ${project.name}`}
              >
                Xóa
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
