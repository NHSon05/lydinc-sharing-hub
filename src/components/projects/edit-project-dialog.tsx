'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectForm, type ProjectFormData } from './project-form';
import type { DepartmentOption, ManagerOption, ProjectItem } from './project-ui.types';

interface EditProjectDialogProps {
  project: ProjectItem | null;
  isOpen: boolean;
  departments: DepartmentOption[];
  managers: ManagerOption[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function EditProjectDialog({
  project,
  isOpen,
  departments,
  managers,
  onClose,
  onSuccess,
}: EditProjectDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          departmentId: data.departmentId,
          managerId: data.managerId,
          startDate: data.startDate,
          endDate: data.endDate,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json.error?.message || json.message;
        throw new Error(msg || 'Không thể cập nhật dự án.');
      }

      onSuccess(json.message || 'Cập nhật dự án thành công.');
      onClose();
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Không thể lưu thay đổi. Vui lòng thử lại.');
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
        aria-labelledby="edit-proj-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 id="edit-proj-title" className="text-base font-bold text-white">
            Chỉnh sửa dự án: <span className="font-mono text-purple-400 font-semibold">{project.code}</span>
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
          initialValues={{
            code: project.code,
            name: project.name,
            description: project.description || '',
            departmentId: project.department?.id,
            managerId: project.manager?.id,
            startDate: project.startDate,
            endDate: project.endDate,
          }}
          departments={departments}
          managers={managers}
          isCreateMode={false}
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
