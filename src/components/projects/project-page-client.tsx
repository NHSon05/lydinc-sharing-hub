'use client';

import React, { useState } from 'react';
import type { DepartmentOption, ManagerOption, ProjectItem, ProjectPaginationInfo } from './project-ui.types';
import { ProjectPageHeader } from './project-page-header';
import { ProjectToolbar } from './project-toolbar';
import { ProjectTable } from './project-table';
import { ProjectPagination } from './project-pagination';
import { ProjectEmptyState } from './project-empty-state';
import { CreateProjectDialog } from './create-project-dialog';
import { EditProjectDialog } from './edit-project-dialog';
import { ChangeProjectStatusDialog } from './change-project-status-dialog';
import { DeleteProjectDialog } from './delete-project-dialog';
import { ToastContainer, type ToastMessage } from '@/components/ui/toast';

interface ProjectPageClientProps {
  initialProjects: ProjectItem[];
  departments: DepartmentOption[];
  managers: ManagerOption[];
  pagination: ProjectPaginationInfo;
  userId: string;
  userRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
  searchQuery?: string;
  statusQuery?: string;
  deptQuery?: string;
  managerQuery?: string;
}

export function ProjectPageClient({
  initialProjects,
  departments,
  managers,
  pagination,
  userId,
  userRole,
  searchQuery,
  statusQuery,
  deptQuery,
  managerQuery,
}: ProjectPageClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

  const canCreate = userRole === 'ADMIN' || userRole === 'MANAGER';
  const isFiltered = !!searchQuery || !!statusQuery || !!deptQuery || !!managerQuery;
  const hasItems = initialProjects.length > 0;

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <ProjectPageHeader
        canCreate={canCreate}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      {/* Search & Filter Toolbar */}
      <ProjectToolbar departments={departments} managers={managers} />

      {/* Main Content */}
      {hasItems ? (
        <div className="space-y-4">
          <ProjectTable
            projects={initialProjects}
            userId={userId}
            userRole={userRole}
            page={pagination.page}
            pageSize={pagination.pageSize}
            onEdit={(proj) => setEditingProject(proj)}
            onChangeStatus={(proj) => setStatusChangingProject(proj)}
            onDelete={(proj) => setDeletingProject(proj)}
          />

          <ProjectPagination pagination={pagination} />
        </div>
      ) : (
        <ProjectEmptyState
          isFiltered={isFiltered}
          canCreate={canCreate}
          onOpenCreateModal={() => setIsCreateOpen(true)}
        />
      )}

      {/* Create Dialog */}
      {canCreate && (
        <CreateProjectDialog
          isOpen={isCreateOpen}
          departments={departments}
          managers={managers}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(msg) => addToast('success', msg)}
        />
      )}

      {/* Edit Dialog */}
      <EditProjectDialog
        project={editingProject}
        isOpen={!!editingProject}
        departments={departments}
        managers={managers}
        onClose={() => setEditingProject(null)}
        onSuccess={(msg) => addToast('success', msg)}
      />

      {/* Status Dialog */}
      <ChangeProjectStatusDialog
        project={statusChangingProject}
        isOpen={!!statusChangingProject}
        onClose={() => setStatusChangingProject(null)}
        onSuccess={(msg) => addToast('success', msg)}
      />

      {/* Delete Dialog */}
      <DeleteProjectDialog
        project={deletingProject}
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onSuccess={(msg) => addToast('success', msg)}
      />
    </div>
  );
}
