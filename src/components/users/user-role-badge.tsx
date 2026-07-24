'use client';

import React from 'react';
import type { UserRole } from './user-ui.types';

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  let label = 'Thành viên';
  let badgeStyle = 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300';

  if (role === 'ADMIN') {
    label = 'Quản trị viên';
    badgeStyle = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
  } else if (role === 'MANAGER') {
    label = 'Quản lý';
    badgeStyle = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border tracking-wider ${badgeStyle}`}
    >
      {label}
    </span>
  );
}
