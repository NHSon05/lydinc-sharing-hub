'use client';

import React, { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminDepartmentsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error internally if needed without exposing stack trace to user UI
    console.error('Department Page Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-rose-900/40 rounded-2xl bg-rose-950/10">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-base font-bold text-white mb-1">
        Không thể tải danh sách phòng ban.
      </h3>

      <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
        Đã xảy ra sự cố khi kết nối với máy chủ. Vui lòng kiểm tra lại kết nối và thử lại.
      </p>

      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-colors cursor-pointer"
      >
        Thử lại
      </button>
    </div>
  );
}
