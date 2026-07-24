'use client';

import React, { useState } from 'react';
import type { ProjectMemberItem } from '../ui.types';
import { MEMBER_ROLE_OPTIONS, PROJECT_MEMBER_ROLE_LABELS } from '../ui.types';

interface EditMemberRoleDialogProps {
  member: ProjectMemberItem | null;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function EditMemberRoleDialog({
  member,
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: EditMemberRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState(member?.role || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (selectedRole === member.role) {
      setErrorMsg('Vai trò mới phải khác vai trò hiện tại.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/projects/${projectId}/members/${member.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Cập nhật vai trò thất bại.');
      }

      onSuccess(data.message || 'Cập nhật vai trò thành công.');
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Chỉnh sửa vai trò thành viên</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Thay đổi vai trò của <strong className="text-zinc-200">{member.user.name}</strong> trong dự án.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <span className="block text-[10px] text-zinc-500">Email</span>
            <span className="text-xs font-semibold text-zinc-300">{member.user.email}</span>
          </div>

          <div>
            <span className="block text-[10px] text-zinc-500">Vai trò hiện tại</span>
            <span className="text-xs font-semibold text-zinc-300">
              {PROJECT_MEMBER_ROLE_LABELS[member.role] || member.role}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">
              Vai trò mới <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
            >
              {MEMBER_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-850 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật vai trò'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
