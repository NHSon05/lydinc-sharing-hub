'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DepartmentOption, ManagerOption, ProjectItem } from './project-ui.types';
import { ProjectStatusBadge } from './project-status-badge';
import { ProjectProgress } from './project-progress';
import { EditProjectDialog } from './edit-project-dialog';
import { ChangeProjectStatusDialog } from './change-project-status-dialog';
import { DeleteProjectDialog } from './delete-project-dialog';
import { ToastContainer, type ToastMessage } from '@/components/ui/toast';

interface ProjectDetailClientProps {
  project: ProjectItem;
  departments: DepartmentOption[];
  managers: ManagerOption[];
  userId: string;
  userRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
}

export function ProjectDetailClient({
  project,
  departments,
  managers,
  userId,
  userRole,
}: ProjectDetailClientProps) {
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [statusChangingProject, setStatusChangingProject] = useState<ProjectItem | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectItem | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const canManage = userRole === 'ADMIN' || (userRole === 'MANAGER' && project.manager?.id === userId);

  const formatDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const totalTasks = project.taskSummary?.total ?? 0;
  const completedTasks = project.taskSummary?.completed ?? 0;
  const calculatedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Back button & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="font-mono text-sm text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-lg">
              {project.code}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.name}
            </h1>
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditingProject(project)}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/50 transition-all duration-200 cursor-pointer active:scale-98"
            >
              Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={() => setStatusChangingProject(project)}
              className="px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-amber-950/40 hover:border-amber-700/50 hover:text-amber-300 border border-zinc-750 text-zinc-400 text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-98"
            >
              Trạng thái
            </button>
            <button
              type="button"
              onClick={() => setDeletingProject(project)}
              className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-98"
            >
              Xóa dự án
            </button>
          </div>
        )}
      </div>

      {/* Main Grid Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Overview Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: description */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md space-y-3">
            <h3 className="text-sm font-bold text-white">Mô tả dự án</h3>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {project.description || <span className="text-zinc-500 italic">Chưa có mô tả chi tiết cho dự án này.</span>}
            </p>
          </div>

          {/* Placeholders for future modules: Members, Tasks, Activity Logs */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md space-y-4">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">Các module liên kết</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex flex-col justify-between h-28">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Nhiệm vụ (Tasks)</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">Quản lý Kanban board và phân công công việc.</p>
                </div>
                <div className="text-xs font-bold text-purple-400 font-mono">
                  {totalTasks} Nhiệm vụ
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex flex-col justify-between h-28">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Thành viên (Members)</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">Danh sách nhân sự tham gia dự án.</p>
                </div>
                <div className="text-xs font-bold text-purple-400 font-mono">
                  {project.memberCount} Thành viên
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex flex-col justify-between h-28 opacity-60">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400">Hoạt động (Activity Logs)</h4>
                  <p className="text-[10px] text-zinc-600 mt-1">Lịch sử thay đổi và cập nhật dự án.</p>
                </div>
                <span className="text-[10px] text-zinc-500 italic">Sắp ra mắt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Summary metadata cards */}
        <div className="space-y-6">
          {/* Card: stats */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Thông tin chung</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Bộ phận phụ trách</span>
                <span className="font-semibold text-zinc-100">{project.department?.name || 'Không xác định'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Người quản lý</span>
                <span className="font-semibold text-zinc-100">{project.manager?.name || 'Chưa phân công'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Người tạo dự án</span>
                <span className="font-semibold text-zinc-100">{project.createdBy?.name || '-'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Ngày bắt đầu</span>
                <span className="font-mono text-zinc-200">{formatDate(project.startDate)}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-medium">Hạn kết thúc</span>
                <span className="font-mono text-zinc-200">{formatDate(project.endDate)}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-400 font-medium">Ngày khởi tạo</span>
                <span className="font-mono text-zinc-200">{formatDate(project.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Card: progress */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Tiến trình thực hiện</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Nhiệm vụ hoàn thành</span>
                <span className="font-mono font-bold text-zinc-200">{completedTasks}/{totalTasks}</span>
              </div>
              <ProjectProgress progress={calculatedProgress} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditProjectDialog
        project={editingProject}
        isOpen={!!editingProject}
        departments={departments}
        managers={managers}
        onClose={() => setEditingProject(null)}
        onSuccess={(msg: string) => addToast('success', msg)}
      />

      {/* Status Dialog */}
      <ChangeProjectStatusDialog
        project={statusChangingProject}
        isOpen={!!statusChangingProject}
        onClose={() => setStatusChangingProject(null)}
        onSuccess={(msg: string) => addToast('success', msg)}
      />

      {/* Delete Dialog */}
      <DeleteProjectDialog
        project={deletingProject}
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onSuccess={(msg: string) => addToast('success', msg)}
      />
    </div>
  );
}
