'use client';

import React from 'react';
import { TaskPriority } from '@/generated/prisma/client';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const getPriorityDetails = (p: TaskPriority) => {
    switch (p) {
      case 'URGENT':
        return {
          label: 'Khẩn cấp',
          className: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        };
      case 'HIGH':
        return {
          label: 'Cao',
          className: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        };
      case 'MEDIUM':
        return {
          label: 'Trung bình',
          className: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        };
      case 'LOW':
      default:
        return {
          label: 'Thấp',
          className: 'bg-zinc-800 border-zinc-700 text-zinc-400 border border-zinc-700',
        };
    }
  };

  const details = getPriorityDetails(priority);

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${details.className}`}
    >
      {details.label}
    </span>
  );
}
