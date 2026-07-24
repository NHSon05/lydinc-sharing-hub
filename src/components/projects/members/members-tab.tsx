'use client';

import React, { useState, useCallback } from 'react';
import type { ProjectMemberItem } from '../ui.types';
import { MemberTable } from './member-table';
import { MemberTableSkeleton } from './member-table-skeleton';
import { AddMemberDialog } from './add-member-dialog';
import { EditMemberRoleDialog } from './edit-member-role-dialog';
import { RemoveMemberDialog } from './remove-member-dialog';
import { ToastContainer, type ToastMessage } from '@/components/ui/toast';

interface MembersTabProps {
  projectId: string;
  canManage: boolean;
}

export function MembersTab({ projectId, canManage }: MembersTabProps) {
  const [members, setMembers] = useState<ProjectMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ProjectMemberItem | null>(null);
  const [removingMember, setRemovingMember] = useState<ProjectMemberItem | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/members?pageSize=100`);
      const data = await res.json();
      if (res.ok && data.data) {
        setMembers(data.data);
      } else {
        throw new Error(data.error?.message || 'Không thể tải danh sách thành viên.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch members on mount
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMembers();
  }, [fetchMembers]);

  const handleSuccess = (msg: string) => {
    addToast('success', msg);
    void fetchMembers();
  };

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          Tổng số thành viên: <span className="font-semibold text-zinc-200">{members.length}</span>
        </p>
        {canManage && (
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            + Thêm thành viên
          </button>
        )}
      </div>

      {loading ? (
        <MemberTableSkeleton />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      ) : (
        <MemberTable
          members={members}
          canManage={canManage}
          onEditRole={setEditingMember}
          onRemove={setRemovingMember}
        />
      )}

      <AddMemberDialog
        isOpen={isAddOpen}
        projectId={projectId}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditMemberRoleDialog
        key={editingMember?.id || 'none'}
        isOpen={!!editingMember}
        member={editingMember}
        projectId={projectId}
        onClose={() => setEditingMember(null)}
        onSuccess={handleSuccess}
      />

      <RemoveMemberDialog
        isOpen={!!removingMember}
        member={removingMember}
        projectId={projectId}
        onClose={() => setRemovingMember(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
