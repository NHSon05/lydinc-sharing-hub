'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { TaskItem, ProjectOption, TaskPagination as TaskPaginationType } from '@/components/tasks/task-ui.types';
import { TaskTable } from '@/components/tasks/task-table';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskEmptyState } from '@/components/tasks/task-empty-state';
import { TaskPagination } from '@/components/tasks/task-pagination';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { ChangeTaskStatusDialog } from '@/components/tasks/change-task-status-dialog';
import { ChangeTaskAssigneeDialog } from '@/components/tasks/change-task-assignee-dialog';
import { DeleteTaskDialog } from '@/components/tasks/delete-task-dialog';
import { ToastContainer, type ToastMessage } from '@/components/ui/toast';

interface ProjectTasksTabProps {
  projectId: string;
  project: ProjectOption;
  userId: string;
  userRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
  canManage: boolean;
}

export function ProjectTasksTab({
  projectId,
  project,
  userId,
  userRole,
  canManage: _canManage,
}: ProjectTasksTabProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<TaskPaginationType>({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [statusChangingTask, setStatusChangingTask] = useState<TaskItem | null>(null);
  const [assigneeChangingTask, setAssigneeChangingTask] = useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/tasks?${params}&projectId=${projectId}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setTasks(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error?.message || 'Không thể tải danh sách nhiệm vụ.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  }, [projectId, page, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  const handleSuccess = (msg: string) => {
    addToast('success', msg);
    fetchTasks();
  };

  const canCreate = userRole === 'ADMIN' || userRole === 'MANAGER';
  const activeProject = { ...project, endDate: project.endDate || '', status: project?.status || 'ACTIVE' };

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">Tất cả</option>
            <option value="TODO">Cần làm</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="REVIEW">Chờ duyệt</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            + Tạo nhiệm vụ
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-zinc-900/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{error}</div>
      ) : tasks.length > 0 ? (
        <div className="space-y-6">
          <div className="hidden md:block">
            <TaskTable
              tasks={tasks}
              userId={userId}
              userRole={userRole}
              page={pagination.page}
              pageSize={pagination.pageSize}
              onEdit={setEditingTask}
              onChangeStatus={setStatusChangingTask}
              onChangeAssignee={setAssigneeChangingTask}
              onDelete={setDeletingTask}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                userId={userId}
                userRole={userRole}
                onEdit={setEditingTask}
                onChangeStatus={setStatusChangingTask}
                onChangeAssignee={setAssigneeChangingTask}
                onDelete={setDeletingTask}
              />
            ))}
          </div>
          <TaskPagination pagination={pagination} onPageChange={setPage} />
        </div>
      ) : (
        <TaskEmptyState
          isFiltered={!!statusFilter}
          canCreate={canCreate}
          onCreateClick={() => setIsCreateOpen(true)}
          onClearFilters={() => setStatusFilter('')}
        />
      )}

      <CreateTaskDialog
        isOpen={isCreateOpen}
        projects={[activeProject]}
        projectId={projectId}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditTaskDialog
        isOpen={!!editingTask}
        task={editingTask}
        projects={[activeProject]}
        userRole={userRole}
        onClose={() => setEditingTask(null)}
        onSuccess={handleSuccess}
      />

      <ChangeTaskStatusDialog
        isOpen={!!statusChangingTask}
        task={statusChangingTask}
        userRole={userRole}
        userId={userId}
        onClose={() => setStatusChangingTask(null)}
        onSuccess={handleSuccess}
      />

      <ChangeTaskAssigneeDialog
        isOpen={!!assigneeChangingTask}
        task={assigneeChangingTask}
        onClose={() => setAssigneeChangingTask(null)}
        onSuccess={handleSuccess}
      />

      <DeleteTaskDialog
        isOpen={!!deletingTask}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
