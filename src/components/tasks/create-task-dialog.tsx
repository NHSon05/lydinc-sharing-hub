'use client';

import React from 'react';
import type { ProjectOption } from './task-ui.types';
import { TaskForm } from './task-form';

interface CreateTaskDialogProps {
  isOpen: boolean;
  projects: ProjectOption[];
  projectId?: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function CreateTaskDialog({
  isOpen,
  projects,
  projectId,
  onClose,
  onSuccess,
}: CreateTaskDialogProps) {
  if (!isOpen) return null;

  const handleSubmit = async (payload: {
    projectId?: string;
    title: string;
    description?: string | null;
    assigneeId?: string;
    priority: string;
    startDate: string | null;
    dueDate: string;
  }) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Tạo nhiệm vụ thất bại.');
    }

    onSuccess(data.message || 'Tạo nhiệm vụ thành công.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-base font-bold text-white">Tạo nhiệm vụ mới</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Điền các thông tin chi tiết dưới đây để gán việc cho thành viên.
          </p>
        </div>
        <TaskForm
          projects={projects}
          isEdit={false}
          preselectedProjectId={projectId}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
