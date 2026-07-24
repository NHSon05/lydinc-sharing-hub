'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectItem } from './project-ui.types';

interface DeleteProjectDialogProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function DeleteProjectDialog({
  project,
  isOpen,
  onClose,
  onSuccess,
}: DeleteProjectDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const handleDelete = async () => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok) {
        const code = json.error?.code;
        const msg = json.error?.message || json.message;

        if (code === 'PROJECT_HAS_TASKS' || msg?.includes('nhiệm vụ')) {
          throw new Error('Không thể xóa dự án vì vẫn còn nhiệm vụ liên quan.');
        }
        if (code === 'PROJECT_HAS_MEMBERS' || msg?.includes('thành viên')) {
          throw new Error('Không thể xóa dự án vì vẫn còn thành viên liên quan.');
        }
        if (code === 'PROJECT_NOT_FOUND' || msg?.includes('không tìm thấy')) {
          throw new Error('Dự án không còn tồn tại. Danh sách sẽ được cập nhật lại.');
        }
        if (code === 'FORBIDDEN' || msg?.includes('quyền')) {
          throw new Error('Bạn không có quyền xóa dự án này.');
        }

        throw new Error(msg || 'Không thể xóa dự án.');
      }

      onSuccess(json.message || 'Xóa dự án thành công.');
      onClose();
      router.refresh();
      // If we are currently on the detail page of this project, we should redirect to the main projects list page.
      if (typeof window !== 'undefined' && window.location.pathname.includes(project.id)) {
        router.push('/projects');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Có lỗi xảy ra khi thực hiện xóa dự án.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 id="delete-dialog-title" className="text-base font-bold text-rose-500">
            Xóa dự án
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Đóng dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Bạn có chắc chắn muốn xóa dự án{' '}
          <span className="font-bold text-white">“{project.name}”</span> không? Hành động này sẽ xóa vĩnh viễn dự án khỏi hệ thống và không thể hoàn tác.
        </p>

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {isSubmitting && (
              <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Xóa dự án
          </button>
        </div>
      </div>
    </div>
  );
}
