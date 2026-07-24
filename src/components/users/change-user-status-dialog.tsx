'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserItem, UserStatus } from './user-ui.types';

interface ChangeUserStatusDialogProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function ChangeUserStatusDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: ChangeUserStatusDialogProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const currentStatus = user.status;
  const targetStatus = selectedStatus || (currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE');

  const handleStatusChange = async (statusToSet: UserStatus) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statusToSet }),
      });

      const json = await res.json();

      if (!res.ok) {
        const code = json.error?.code;
        const msg = json.error?.message || json.message;

        if (code === 'CONFLICT' || msg?.includes('cuối cùng')) {
          throw new Error('Không thể khóa hoặc vô hiệu hóa quản trị viên đang hoạt động cuối cùng của hệ thống.');
        }
        if (code === 'CONFLICT' || msg?.includes('chính mình')) {
          throw new Error('Bạn không thể tự khóa hoặc vô hiệu hóa tài khoản của chính mình.');
        }
        if (code === 'NOT_FOUND') {
          throw new Error('Người dùng không còn tồn tại. Danh sách sẽ được cập nhật lại.');
        }

        throw new Error(msg || 'Không thể cập nhật trạng thái tài khoản.');
      }

      onSuccess(json.message || 'Cập nhật trạng thái tài khoản thành công.');
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

  const getDialogText = () => {
    switch (targetStatus) {
      case 'LOCKED':
        return {
          title: 'Khóa tài khoản',
          description: `Tài khoản “${user.name}” sẽ không thể đăng nhập hoặc tiếp tục sử dụng hệ thống.`,
          submitText: 'Khóa tài khoản',
          buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white',
        };
      case 'INACTIVE':
        return {
          title: 'Chuyển sang không hoạt động',
          description: `Tài khoản “${user.name}” sẽ bị vô hiệu hóa tạm thời nhưng dữ liệu lịch sử vẫn được giữ lại.`,
          submitText: 'Vô hiệu hóa tài khoản',
          buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white',
        };
      default:
        return {
          title: 'Kích hoạt / Mở khóa tài khoản',
          description: `Tài khoản “${user.name}” sẽ được phép đăng nhập lại và sử dụng hệ thống.`,
          submitText: 'Kích hoạt tài khoản',
          buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        };
    };
  };

  const info = getDialogText();

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
            Thay đổi trạng thái tài khoản
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

        {/* Status Option Select Buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300">
            Chọn trạng thái mới cho <span className="text-white font-bold">{user.name}</span>:
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedStatus('ACTIVE')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                targetStatus === 'ACTIVE'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Kích hoạt
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('INACTIVE')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                targetStatus === 'INACTIVE'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Ngừng hoạt động
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('LOCKED')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                targetStatus === 'LOCKED'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Khóa tài khoản
            </button>
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
            aria-busy={isSubmitting}
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
