'use client';

import React from 'react';
import type { ProjectStatus } from './project-ui.types';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  let label = 'Lập kế hoạch';
  let badgeStyle = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
  let dotColor = 'bg-blue-500';

  if (status === 'ACTIVE') {
    label = 'Đang thực hiện';
    badgeStyle = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    dotColor = 'bg-emerald-500';
  } else if (status === 'ON_HOLD') {
    label = 'Tạm dừng';
    badgeStyle = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    dotColor = 'bg-amber-500';
  } else if (status === 'COMPLETED') {
    label = 'Hoàn thành';
    badgeStyle = 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    dotColor = 'bg-purple-500';
  } else if (status === 'CANCELLED') {
    label = 'Đã hủy';
    badgeStyle = 'bg-zinc-800 border-zinc-700 text-zinc-400';
    dotColor = 'bg-zinc-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border tracking-wider ${badgeStyle}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}
