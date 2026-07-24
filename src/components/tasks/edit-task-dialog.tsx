'use client';

import React, { useState } from 'react';
import type { TaskItem, ProjectOption } from './task-ui.types';
import { TaskForm } from './task-form';

interface EditTaskDialogProps {
  task: TaskItem | null;
  isOpen: boolean;
  projects: ProjectOption[];
  userRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function EditTaskDialog({
  task,
  isOpen,
  projects,
  userRole,
  onClose,
  onSuccess,
}: EditTaskDialogProps) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const isMember = userRole === 'MEMBER';

  const handleMemberSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const progressInput = formData.get('progress') as string;
    const resultInput = formData.get('result') as string;

    const progress = parseInt(progressInput, 10);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      setErrorMsg('Tiến độ phải nằm trong khoảng từ 0% đến 100%.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress,
          result: resultInput ? resultInput.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Cập nhật tiến độ thất bại.');
      }

      onSuccess(data.message || 'Cập nhật tiến độ thành công.');
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.';
      setErrorMsg(errMsg);
    } {
      setIsSubmitting(false);
    }
  };

  const handleAdminManagerSubmit = async (payload: {
    title: string;
    description?: string | null;
    priority: string;
    startDate: string | null;
    dueDate: string;
  }) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Cập nhật nhiệm vụ thất bại.');
    }

    onSuccess(data.message || 'Cập nhật nhiệm vụ thành công.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-base font-bold text-white">
            {isMember ? 'Cập nhật tiến độ nhiệm vụ' : 'Chỉnh sửa nhiệm vụ'}
          </h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isMember
              ? 'Thành viên chỉ được quyền cập nhật tiến độ hoàn thành và báo cáo kết quả.'
              : 'Thay đổi các thông số hành chính của nhiệm vụ dưới đây.'}
          </p>
        </div>

        {isMember ? (
          <form onSubmit={handleMemberSubmit} className="space-y-4 text-left">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Read-only Title & Project */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] text-zinc-500">Nhiệm vụ</span>
                <span className="text-xs font-semibold text-zinc-300">{task.title}</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500">Dự án</span>
                <span className="text-xs font-semibold text-zinc-300">
                  {task.project.code} - {task.project.name}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <label htmlFor="progress" className="text-xs font-semibold text-zinc-400">
                Tiến độ hoàn thành (%) <span className="text-rose-500">*</span>
              </label>
              <input
                id="progress"
                name="progress"
                type="number"
                min={0}
                max={100}
                defaultValue={task.progress}
                placeholder="Ví dụ: 50"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Result report */}
            <div className="space-y-1.5">
              <label htmlFor="result" className="text-xs font-semibold text-zinc-400">
                Kết quả / Báo cáo chi tiết
              </label>
              <textarea
                id="result"
                name="result"
                rows={4}
                defaultValue={task.result || ''}
                placeholder="Báo cáo link hoặc tóm tắt kết quả thực hiện nhiệm vụ..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Action buttons */}
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
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật tiến độ'}
              </button>
            </div>
          </form>
        ) : (
          <TaskForm
            projects={projects}
            initialData={{
              projectId: task.project.id,
              title: task.title,
              description: task.description || '',
              assigneeId: task.assignee?.id,
              priority: task.priority,
              startDate: task.startDate || '',
              dueDate: task.dueDate,
            }}
            isEdit={true}
            onSubmit={handleAdminManagerSubmit}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
}
