'use client';

import React from 'react';
import type { ProjectItem } from './project-ui.types';
import { ProjectTableRow } from './project-table-row';

interface ProjectTableProps {
  projects: ProjectItem[];
  userId: string;
  userRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
  page: number;
  pageSize: number;
  onEdit: (project: ProjectItem) => void;
  onChangeStatus: (project: ProjectItem) => void;
  onDelete: (project: ProjectItem) => void;
}

export function ProjectTable({
  projects,
  userId,
  userRole,
  page,
  pageSize,
  onEdit,
  onChangeStatus,
  onDelete,
}: ProjectTableProps) {
  const startIndex = (page - 1) * pageSize + 1;

  const canManageProject = (project: ProjectItem) => {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'MANAGER' && project.manager?.id === userId) return true;
    return false;
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <th scope="col" className="px-4 py-3.5 text-center w-12">
              STT
            </th>
            <th scope="col" className="px-4 py-3.5 w-24">
              Mã dự án
            </th>
            <th scope="col" className="px-4 py-3.5">
              Tên dự án
            </th>
            <th scope="col" className="px-4 py-3.5">
              Phòng ban
            </th>
            <th scope="col" className="px-4 py-3.5">
              Người quản lý
            </th>
            <th scope="col" className="px-4 py-3.5">
              Trạng thái
            </th>
            <th scope="col" className="px-4 py-3.5">
              Tiến độ
            </th>
            <th scope="col" className="px-4 py-3.5 text-center">
              Thành viên
            </th>
            <th scope="col" className="px-4 py-3.5 text-center">
              Nhiệm vụ
            </th>
            <th scope="col" className="px-4 py-3.5">
              Thời gian
            </th>
            <th scope="col" className="px-4 py-3.5 text-right">
              Thao tác
            </th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project, idx) => (
            <ProjectTableRow
              key={project.id}
              index={startIndex + idx}
              project={project}
              canManage={canManageProject(project)}
              onEdit={onEdit}
              onChangeStatus={onChangeStatus}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
