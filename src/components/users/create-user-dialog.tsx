'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserForm, type UserFormData } from './user-form';
import type { DepartmentOption } from './user-ui.types';

interface CreateUserDialogProps {
  isOpen: boolean;
  departments: DepartmentOption[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CreateUserDialog({
  isOpen,
  departments,
  onClose,
  onSuccess,
}: CreateUserDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/users', {
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

        if (code === 'CONFLICT' || msg?.includes('Email')) {
          throw new Error('Email này đã được sử dụng trong hệ thống.');
        }
        if (code === 'NOT_FOUND' || msg?.includes('Phòng ban')) {
          throw new Error('Phòng ban đã chọn không còn tồn tại. Vui lòng chọn lại.');
        }

        throw new Error(msg || 'Không thể tạo người dùng.');
      }

      onSuccess(json.message || 'Tạo người dùng thành công.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 id="create-user-dialog-title" className="text-base font-bold text-white">
            Thêm người dùng
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

        <UserForm
          departments={departments}
          isCreateMode={true}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel="Tạo người dùng"
          isSubmitting={isSubmitting}
          serverError={serverError}
        />
      </div>
    </div>
  );
}
