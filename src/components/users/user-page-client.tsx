'use client';

import React, { useState } from 'react';
import type { DepartmentOption, UserItem, UserPaginationInfo } from './user-ui.types';
import { UserPageHeader } from './user-page-header';
import { UserToolbar } from './user-toolbar';
import { UserTable } from './user-table';
import { UserPagination } from './user-pagination';
import { UserEmptyState } from './user-empty-state';
import { CreateUserDialog } from './create-user-dialog';
import { EditUserDialog } from './edit-user-dialog';
import { UserDetailDialog } from './user-detail-dialog';
import { ChangeUserStatusDialog } from './change-user-status-dialog';
import { ResetUserPasswordDialog } from './reset-user-password-dialog';
import { ToastContainer, type ToastMessage } from '@/components/ui/toast';

interface UserPageClientProps {
  initialUsers: UserItem[];
  departments: DepartmentOption[];
  pagination: UserPaginationInfo;
  isAdmin: boolean;
  searchQuery?: string;
  roleQuery?: string;
  statusQuery?: string;
  deptQuery?: string;
}

export function UserPageClient({
  initialUsers,
  departments,
  pagination,
  isAdmin,
  searchQuery,
  roleQuery,
  statusQuery,
  deptQuery,
}: UserPageClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [viewingUser, setViewingUser] = useState<UserItem | null>(null);
  const [statusChangingUser, setStatusChangingUser] = useState<UserItem | null>(null);
  const [resetPassUser, setResetPassUser] = useState<UserItem | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isFiltered = !!searchQuery || !!roleQuery || !!statusQuery || !!deptQuery;
  const hasItems = initialUsers.length > 0;

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <UserPageHeader
        isAdmin={isAdmin}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      {/* Search & Filter Toolbar */}
      <UserToolbar departments={departments} />

      {/* Main Content: Table vs Empty State */}
      {hasItems ? (
        <div className="space-y-4">
          <UserTable
            users={initialUsers}
            isAdmin={isAdmin}
            page={pagination.page}
            pageSize={pagination.pageSize}
            onViewDetail={(usr) => setViewingUser(usr)}
            onEdit={(usr) => setEditingUser(usr)}
            onChangeStatus={(usr) => setStatusChangingUser(usr)}
            onResetPassword={(usr) => setResetPassUser(usr)}
          />

          <UserPagination pagination={pagination} />
        </div>
      ) : (
        <UserEmptyState
          isFiltered={isFiltered}
          isAdmin={isAdmin}
          onOpenCreateModal={() => setIsCreateOpen(true)}
        />
      )}

      {/* Create Dialog */}
      {isAdmin && (
        <CreateUserDialog
          isOpen={isCreateOpen}
          departments={departments}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(msg) => addToast('success', msg)}
        />
      )}

      {/* Edit Dialog */}
      {isAdmin && (
        <EditUserDialog
          user={editingUser}
          isOpen={!!editingUser}
          departments={departments}
          onClose={() => setEditingUser(null)}
          onSuccess={(msg) => addToast('success', msg)}
        />
      )}

      {/* View Detail Dialog */}
      <UserDetailDialog
        user={viewingUser}
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
      />

      {/* Change Status Dialog */}
      {isAdmin && (
        <ChangeUserStatusDialog
          user={statusChangingUser}
          isOpen={!!statusChangingUser}
          onClose={() => setStatusChangingUser(null)}
          onSuccess={(msg) => addToast('success', msg)}
        />
      )}

      {/* Reset Password Dialog */}
      {isAdmin && (
        <ResetUserPasswordDialog
          user={resetPassUser}
          isOpen={!!resetPassUser}
          onClose={() => setResetPassUser(null)}
          onSuccess={(msg) => addToast('success', msg)}
        />
      )}
    </div>
  );
}
