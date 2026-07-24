'use client';

import React, { useState } from 'react';
import type { TaskItem } from './task-ui.types';

interface DeleteTaskDialogProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function DeleteTaskDialog({
  task,
  isOpen,
  onClose,
  onSuccess,
}: DeleteTaskDialogProps) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleDelete = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Xóa nhiệm vụ thất bại.');
      }

      onSuccess(data.message || 'Xóa nhiệm vụ thành công.');
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.';
      setErrorMsg(errMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white text-left">Xóa nhiệm vụ</h2>
          <p className="text-xs text-zinc-400 mt-1 text-left">
            Bạn có chắc chắn muốn xóa nhiệm vụ <strong className="text-zinc-200">“{task.title}”</strong> không? Thao tác này không thể hoàn tác.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-left">
            {errorMsg}
          </div>
        )}

        {/* Footer actions */}
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
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? 'Đang xóa...' : 'Xóa nhiệm vụ'}
          </button>
        </div>
      </div>
    </div>
  );
}
