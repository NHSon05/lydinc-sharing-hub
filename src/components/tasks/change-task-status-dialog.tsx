'use client';

import React, { useState } from 'react';
import type { TaskItem } from './task-ui.types';
import { TaskStatus } from '@/generated/prisma/client';

interface ChangeTaskStatusDialogProps {
  task: TaskItem | null;
  isOpen: boolean;
  userRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
  userId: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function ChangeTaskStatusDialog({
  task,
  isOpen,
  userRole,
  userId,
  onClose,
  onSuccess,
}: ChangeTaskStatusDialogProps) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const currentStatus = task.status;
  const isManager = task.project ? task.project.managerId === userId : false;

  // Filter allowed status transitions based on BUSINESS RULES and actor role
  // TODO: [IN_PROGRESS, CANCELLED]
  // IN_PROGRESS: [TODO, REVIEW, COMPLETED, CANCELLED]
  // REVIEW: [IN_PROGRESS, COMPLETED, CANCELLED]
  // COMPLETED: [IN_PROGRESS] (reopen)
  // CANCELLED: [TODO] (restore)
  const getTransitions = (current: TaskStatus) => {
    switch (current) {
      case 'TODO':
        return [
          { value: 'IN_PROGRESS', label: 'Bắt đầu thực hiện (In Progress)' },
          { value: 'CANCELLED', label: 'Hủy nhiệm vụ (Cancelled)' },
        ];
      case 'IN_PROGRESS':
        return [
          { value: 'TODO', label: 'Tạm ngưng / Đưa về Todo (Todo)' },
          { value: 'REVIEW', label: 'Chuyển sang Chờ đánh giá (Review)' },
          { value: 'COMPLETED', label: 'Xác nhận hoàn thành (Completed)' },
          { value: 'CANCELLED', label: 'Hủy nhiệm vụ (Cancelled)' },
        ];
      case 'REVIEW':
        return [
          { value: 'IN_PROGRESS', label: 'Yêu cầu làm lại (In Progress)' },
          { value: 'COMPLETED', label: 'Xác nhận hoàn thành (Completed)' },
          { value: 'CANCELLED', label: 'Hủy nhiệm vụ (Cancelled)' },
        ];
      case 'COMPLETED':
        return [
          { value: 'IN_PROGRESS', label: 'Mở lại nhiệm vụ (In Progress)' },
        ];
      case 'CANCELLED':
        return [
          { value: 'TODO', label: 'Khôi phục nhiệm vụ (Todo)' },
        ];
      default:
        return [];
    }
  };

  const allTransitions = getTransitions(currentStatus);

  // Business Rule constraint check: MEMBER cannot move directly or confirm as COMPLETED
  const transitions = allTransitions.filter((t) => {
    if (t.value === 'COMPLETED') {
      return userRole === 'ADMIN' || isManager;
    }
    return true;
  });

  const handleStatusChange = async (targetStatus: TaskStatus) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Cập nhật trạng thái thất bại.');
      }

      onSuccess(data.message || 'Cập nhật trạng thái nhiệm vụ thành công.');
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.';
      setErrorMsg(errMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-base font-bold text-white text-left">Chuyển trạng thái nhiệm vụ</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5 text-left">
            Chọn trạng thái tiếp theo cho nhiệm vụ: <strong className="text-zinc-200">{task.title}</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-left">
            {errorMsg}
          </div>
        )}

        <div className="space-y-2 pt-2">
          {transitions.length > 0 ? (
            transitions.map((t) => (
              <button
                key={t.value}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleStatusChange(t.value as TaskStatus)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between disabled:opacity-40"
              >
                <span>{t.label}</span>
                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))
          ) : (
            <p className="text-xs text-zinc-500 italic py-4 text-center">
              Không có trạng thái chuyển tiếp khả dụng cho vai trò của bạn.
            </p>
          )}
        </div>

        {/* Action footer */}
        <div className="flex items-center justify-end pt-4 border-t border-zinc-800/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-850 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
