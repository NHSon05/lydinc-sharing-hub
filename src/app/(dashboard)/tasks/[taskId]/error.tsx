'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface TaskDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TaskDetailError({ error, reset }: TaskDetailErrorProps) {
  useEffect(() => {
    console.error('Task Detail Route Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 min-h-[60vh] space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-zinc-200">Không thể tải thông tin chi tiết nhiệm vụ</h3>
        <p className="text-xs text-zinc-500 max-w-sm">
          Đã xảy ra lỗi hoặc bạn không có quyền xem thông tin chi tiết của nhiệm vụ này.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/tasks"
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
        >
          Quay lại danh sách
        </Link>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
