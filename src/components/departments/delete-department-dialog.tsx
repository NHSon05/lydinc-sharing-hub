'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DepartmentItem } from './department-ui.types';

interface DeleteDepartmentDialogProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function DeleteDepartmentDialog({
  department,
  isOpen,
  onClose,
  onSuccess,
}: DeleteDepartmentDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !department) return null;

  const userCount = department.counts?.users ?? department._count?.users ?? 0;
  const projectCount = department.counts?.projects ?? department._count?.projects ?? 0;

  const handleDelete = async () => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/departments/${department.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok) {
        const code = json.error?.code;
        const msg = json.error?.message || json.message;

        if (code === 'CONFLICT' || res.status === 409 || msg?.includes('người dùng hoặc dự án')) {
          throw new Error(
            `Không thể xóa phòng ban này vì vẫn còn người dùng (${userCount}) hoặc dự án (${projectCount}) đang liên kết.`
          );
        }
        if (code === 'NOT_FOUND' || res.status === 404) {
          throw new Error('Phòng ban không còn tồn tại. Danh sách sẽ được cập nhật lại.');
        }
        if (code === 'FORBIDDEN' || res.status === 403) {
          throw new Error('Bạn không có quyền thực hiện thao tác này.');
        }

        throw new Error(msg || 'Không thể xóa phòng ban. Vui lòng thử lại.');
      }

      onSuccess(json.message || 'Xóa phòng ban thành công.');
      onClose();
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Không thể xóa phòng ban. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 transition-all duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="flex items-center gap-3 text-rose-500">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div>
            <h2 id="delete-dialog-title" className="text-base font-bold text-white">
              Xóa phòng ban
            </h2>
            <p className="text-xs text-zinc-400">Hành động này không thể hoàn tác.</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Bạn có chắc chắn muốn xóa phòng ban{' '}
          <span className="font-bold text-white">“{department.name}”</span> không?
        </p>

        {(userCount > 0 || projectCount > 0) && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-medium space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Cảnh báo dữ liệu liên kết:
            </p>
            <p className="text-[11px] text-amber-300/90 pl-5">
              • Nhân sự hiện tại: <span className="font-bold">{userCount}</span> người
            </p>
            <p className="text-[11px] text-amber-300/90 pl-5">
              • Dự án liên kết: <span className="font-bold">{projectCount}</span> dự án
            </p>
          </div>
        )}

        {serverError && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {isSubmitting && (
              <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Xóa phòng ban
          </button>
        </div>
      </div>
    </div>
  );
}
