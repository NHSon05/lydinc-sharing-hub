'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectForm, type ProjectFormData } from './project-form';
import type { DepartmentOption, ManagerOption, UserOption } from './project-ui.types';

interface CreateProjectDialogProps {
  isOpen: boolean;
  departments: DepartmentOption[];
  managers: ManagerOption[];
  users?: UserOption[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CreateProjectDialog({
  isOpen,
  departments,
  managers,
  users,
  onClose,
  onSuccess,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        const code = json.error?.code;
        const msg = json.error?.message || json.message;

        if (code === 'CONFLICT' || msg?.toLowerCase().includes('duplicate') || msg?.toLowerCase().includes('trùng')) {
          throw new Error('Mã dự án này đã tồn tại trong hệ thống. Vui lòng chọn mã khác.');
        }
        throw new Error(msg || 'Không thể tạo dự án mới.');
      }

      onSuccess(json.message || 'Tạo dự án thành công.');
      onClose();
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-proj-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 id="create-proj-title" className="text-base font-bold text-white">
            Tạo dự án mới
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

        <ProjectForm
          departments={departments}
          managers={managers}
          users={users}
          isCreateMode={true}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel="Tạo dự án"
          isSubmitting={isSubmitting}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
