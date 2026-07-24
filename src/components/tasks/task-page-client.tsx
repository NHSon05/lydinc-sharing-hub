'use client';

import React, { useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { TaskItem, ProjectOption, TaskPagination as TaskPaginationType } from './task-ui.types';
import { TaskPageHeader } from './task-page-header';
import { TaskToolbar } from './task-toolbar';
import { TaskTable } from './task-table';
import { TaskCard } from './task-card';
import { TaskPagination } from './task-pagination';
import { TaskEmptyState } from './task-empty-state';
import { CreateTaskDialog } from './create-task-dialog';
import { EditTaskDialog } from './edit-task-dialog';
import { ChangeTaskStatusDialog } from './change-task-status-dialog';
import { ChangeTaskAssigneeDialog } from './change-task-assignee-dialog';
import { DeleteTaskDialog } from './delete-task-dialog';
import { ToastContainer, type ToastMessage } from '@/components/ui/toast';

interface TaskPageClientProps {
  initialTasks: TaskItem[];
  projects: ProjectOption[];
  pagination: TaskPaginationType;
  userId: string;
  userRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
  searchQuery: string;
  statusQuery: string;
  priorityQuery: string;
  projectIdQuery: string;
  overdueQuery: string;
}

export function TaskPageClient({
  initialTasks,
  projects,
  pagination,
  userId,
  userRole,
  searchQuery,
  statusQuery,
  priorityQuery,
  projectIdQuery,
  overdueQuery,
}: TaskPageClientProps) {
  const router = useRouter();

  // Modal open states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [statusChangingTask, setStatusChangingTask] = useState<TaskItem | null>(null);
  const [assigneeChangingTask, setAssigneeChangingTask] = useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  // Toasts management state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSuccess = (msg: string) => {
    addToast('success', msg);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleClearFilters = () => {
    startTransition(() => {
      router.push('/tasks');
    });
  };

  // Condition to display "+ Tạo nhiệm vụ" button: ADMIN or MANAGER
  const canCreate = userRole === 'ADMIN' || userRole === 'MANAGER';

  const isFiltered =
    !!searchQuery ||
    !!statusQuery ||
    !!priorityQuery ||
    !!projectIdQuery ||
    overdueQuery === 'true';

  return (
    <div className="space-y-6">
      {/* Toast Overlay Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <TaskPageHeader canCreate={canCreate} onCreateClick={() => setIsCreateOpen(true)} />

      {/* Toolbar Filters */}
      <TaskToolbar
        projects={projects}
        currentSearch={searchQuery}
        currentStatus={statusQuery}
        currentPriority={priorityQuery}
        currentProjectId={projectIdQuery}
        currentOverdue={overdueQuery}
      />

      {/* Main tasks listing */}
      {initialTasks.length > 0 ? (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <TaskTable
              tasks={initialTasks}
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

          {/* Mobile Grid Card list view */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {initialTasks.map((task) => (
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

          {/* Pagination bar */}
          <TaskPagination pagination={pagination} />
        </div>
      ) : (
        <TaskEmptyState
          isFiltered={isFiltered}
          canCreate={canCreate}
          onCreateClick={() => setIsCreateOpen(true)}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Create Dialog */}
      <CreateTaskDialog
        isOpen={isCreateOpen}
        projects={projects}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Edit Dialog */}
      <EditTaskDialog
        isOpen={!!editingTask}
        task={editingTask}
        projects={projects}
        userRole={userRole}
        onClose={() => setEditingTask(null)}
        onSuccess={handleSuccess}
      />

      {/* Status Dialog */}
      <ChangeTaskStatusDialog
        isOpen={!!statusChangingTask}
        task={statusChangingTask}
        userRole={userRole}
        userId={userId}
        onClose={() => setStatusChangingTask(null)}
        onSuccess={handleSuccess}
      />

      {/* Assignee Dialog */}
      <ChangeTaskAssigneeDialog
        isOpen={!!assigneeChangingTask}
        task={assigneeChangingTask}
        onClose={() => setAssigneeChangingTask(null)}
        onSuccess={handleSuccess}
      />

      {/* Delete Dialog */}
      <DeleteTaskDialog
        isOpen={!!deletingTask}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
