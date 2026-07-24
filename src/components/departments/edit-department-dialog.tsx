'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DepartmentForm, type DepartmentFormData } from './department-form';
import type { DepartmentItem } from './department-ui.types';

interface EditDepartmentDialogProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function EditDepartmentDialog({
  department,
  isOpen,
  onClose,
  onSuccess,
}: EditDepartmentDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !department) return null;

  const handleSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/departments/${department.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Không thể cập nhật phòng ban.');
      }

      onSuccess(json.message || 'Cập nhật phòng ban thành công.');
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
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 transition-all duration-200 transform scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 id="edit-dialog-title" className="text-base font-bold text-white">
            Chỉnh sửa phòng ban
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Đóng dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <DepartmentForm
          initialValues={{
            name: department.name,
            description: department.description || '',
          }}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel="Lưu thay đổi"
          isSubmitting={isSubmitting}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
