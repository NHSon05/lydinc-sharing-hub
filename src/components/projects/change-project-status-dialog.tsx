'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectItem, ProjectStatus } from './project-ui.types';

interface ChangeProjectStatusDialogProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function ChangeProjectStatusDialog({
  project,
  isOpen,
  onClose,
  onSuccess,
}: ChangeProjectStatusDialogProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const currentStatus = project.status;
  const targetStatus = selectedStatus || (currentStatus === 'PLANNING' ? 'ACTIVE' : currentStatus);

  const handleStatusChange = async (statusToSet: ProjectStatus) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statusToSet }),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json.error?.message || json.message;
        throw new Error(msg || 'Không thể cập nhật trạng thái dự án.');
      }

      onSuccess(json.message || 'Cập nhật trạng thái dự án thành công.');
      onClose();
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Không thể cập nhật trạng thái. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDetails = () => {
    switch (targetStatus) {
      case 'ACTIVE':
        return {
          title: 'Bắt đầu / Kích hoạt dự án',
          description: `Chuyển dự án “${project.name}” sang trạng thái đang thực hiện. Thành viên có thể bắt đầu tạo và cập nhật các nhiệm vụ.`,
          submitText: 'Bắt đầu dự án',
          buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        };
      case 'ON_HOLD':
        return {
          title: 'Tạm dừng dự án',
          description: `Tạm dừng toàn bộ công việc và hoạt động của dự án “${project.name}”. Các nhiệm vụ sẽ được bảo lưu trạng thái hiện tại.`,
          submitText: 'Tạm dừng dự án',
          buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white',
        };
      case 'COMPLETED':
        return {
          title: 'Hoàn thành dự án',
          description: `Đánh dấu hoàn thành dự án “${project.name}”. Vui lòng đảm bảo các nhiệm vụ liên quan đã được hoàn tất hoặc hủy bỏ.`,
          submitText: 'Hoàn thành dự án',
          buttonClass: 'bg-purple-600 hover:bg-purple-500 text-white',
        };
      case 'CANCELLED':
        return {
          title: 'Hủy dự án',
          description: `Hủy bỏ dự án “${project.name}”. Dữ liệu lịch sử, các nhiệm vụ sẽ được đánh dấu đã hủy nhưng vẫn lưu lại trong hệ thống.`,
          submitText: 'Hủy dự án',
          buttonClass: 'bg-zinc-700 hover:bg-zinc-650 text-white',
        };
      default:
        return {
          title: 'Lập kế hoạch',
          description: `Đưa dự án “${project.name}” về trạng thái lập kế hoạch ban đầu.`,
          submitText: 'Lưu thay đổi',
          buttonClass: 'bg-blue-600 hover:bg-blue-500 text-white',
        };
    }
  };

  const info = getStatusDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 id="status-dialog-title" className="text-base font-bold text-white">
            Cập nhật trạng thái dự án
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

        {/* Status Options Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300">
            Chọn trạng thái mới cho dự án <span className="text-white font-bold">{project.name}</span>:
          </label>

          <div className="grid grid-cols-2 gap-2">
            {(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as ProjectStatus[]).map((status) => {
              const label =
                status === 'PLANNING'
                  ? 'Kế hoạch'
                  : status === 'ACTIVE'
                  ? 'Thực hiện'
                  : status === 'ON_HOLD'
                  ? 'Tạm dừng'
                  : status === 'COMPLETED'
                  ? 'Hoàn thành'
                  : 'Hủy bỏ';

              const activeClass =
                status === 'ACTIVE'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : status === 'ON_HOLD'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : status === 'COMPLETED'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                  : status === 'PLANNING'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                  : 'bg-zinc-800 border-zinc-650 text-zinc-300';

              const isCurrent = status === currentStatus;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    targetStatus === status
                      ? activeClass
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  } ${isCurrent ? 'ring-1 ring-purple-500/30 opacity-60' : ''}`}
                >
                  {label} {isCurrent && '(Hiện tại)'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
          {info.description}
        </div>

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
            onClick={() => handleStatusChange(targetStatus)}
            disabled={isSubmitting || targetStatus === currentStatus}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 ${info.buttonClass}`}
          >
            {isSubmitting && (
              <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {info.submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
