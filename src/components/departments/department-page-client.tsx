'use client';

import React, { useState } from 'react';
import type { DepartmentItem, PaginationInfo } from './department-ui.types';
import { DepartmentPageHeader } from './department-page-header';
import { DepartmentSearch } from './department-search';
import { DepartmentTable } from './department-table';
import { DepartmentPagination } from './department-pagination';
import { DepartmentEmptyState } from './department-empty-state';
import { CreateDepartmentDialog } from './create-department-dialog';
import { EditDepartmentDialog } from './edit-department-dialog';
import { DeleteDepartmentDialog } from './delete-department-dialog';
import { ToastContainer, type ToastMessage } from '@/components/ui/toast';

interface DepartmentPageClientProps {
  initialDepartments: DepartmentItem[];
  pagination: PaginationInfo;
  isAdmin: boolean;
  searchQuery?: string;
}

export function DepartmentPageClient({
  initialDepartments,
  pagination,
  isAdmin,
  searchQuery,
}: DepartmentPageClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<DepartmentItem | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isSearchActive = !!searchQuery && searchQuery.trim().length > 0;
  const hasItems = initialDepartments.length > 0;

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <DepartmentPageHeader
        isAdmin={isAdmin}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <DepartmentSearch />
      </div>

      {/* Content: Table vs Empty State */}
      {hasItems ? (
        <div className="space-y-4">
          <DepartmentTable
            departments={initialDepartments}
            isAdmin={isAdmin}
            page={pagination.page}
            pageSize={pagination.pageSize}
            onEdit={(dept) => setEditingDepartment(dept)}
            onDelete={(dept) => setDeletingDepartment(dept)}
          />

          <DepartmentPagination pagination={pagination} />
        </div>
      ) : (
        <DepartmentEmptyState
          isSearch={isSearchActive}
          isAdmin={isAdmin}
          onOpenCreateModal={() => setIsCreateOpen(true)}
        />
      )}

      {/* Create Dialog */}
      {isAdmin && (
        <CreateDepartmentDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(msg) => addToast('success', msg)}
        />
      )}

      {/* Edit Dialog */}
      {isAdmin && (
        <EditDepartmentDialog
          department={editingDepartment}
          isOpen={!!editingDepartment}
          onClose={() => setEditingDepartment(null)}
          onSuccess={(msg) => addToast('success', msg)}
        />
      )}

      {/* Delete Dialog */}
      {isAdmin && (
        <DeleteDepartmentDialog
          department={deletingDepartment}
          isOpen={!!deletingDepartment}
          onClose={() => setDeletingDepartment(null)}
          onSuccess={(msg) => addToast('success', msg)}
        />
      )}
    </div>
  );
}
