'use client';

import React from 'react';
import type { UserStatus } from './user-ui.types';

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  let label = 'Đang hoạt động';
  let badgeStyle = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  let dotColor = 'bg-emerald-500';

  if (status === 'LOCKED') {
    label = 'Bị khóa';
    badgeStyle = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    dotColor = 'bg-rose-500';
  } else if (status === 'INACTIVE') {
    label = 'Không hoạt động';
    badgeStyle = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    dotColor = 'bg-amber-500';
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
