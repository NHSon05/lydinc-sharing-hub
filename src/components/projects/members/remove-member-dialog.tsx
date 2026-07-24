'use client';

import React, { useState } from 'react';
import type { ProjectMemberItem } from '../ui.types';

interface RemoveMemberDialogProps {
  member: ProjectMemberItem | null;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function RemoveMemberDialog({
  member,
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: RemoveMemberDialogProps) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !member) return null;

  const handleRemove = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/projects/${projectId}/members/${member.user.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Xóa thành viên thất bại.');
      }

      onSuccess(data.message || 'Xóa thành viên thành công.');
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
          <h2 className="text-base font-bold text-white">Xóa thành viên khỏi dự án</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Bạn có chắc chắn muốn xóa <strong className="text-zinc-200">{member.user.name}</strong> khỏi dự án này không?
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

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
            type="button"
            onClick={handleRemove}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? 'Đang xóa...' : 'Xóa thành viên'}
          </button>
        </div>
      </div>
    </div>
  );
}
