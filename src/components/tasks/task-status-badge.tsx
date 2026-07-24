'use client';

import React from 'react';
import { TaskStatus } from '@/generated/prisma/client';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const getStatusDetails = (s: TaskStatus) => {
    switch (s) {
      case 'COMPLETED':
        return {
          label: 'Hoàn thành',
          className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        };
      case 'REVIEW':
        return {
          label: 'Chờ đánh giá',
          className: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        };
      case 'IN_PROGRESS':
        return {
          label: 'Đang thực hiện',
          className: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        };
      case 'TODO':
        return {
          label: 'Chưa thực hiện',
          className: 'bg-zinc-850 border-zinc-750 text-zinc-400 border border-zinc-700',
        };
      case 'CANCELLED':
      default:
        return {
          label: 'Đã hủy',
          className: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        };
    }
  };

  const details = getStatusDetails(status);

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${details.className}`}
    >
      {details.label}
    </span>
  );
}
