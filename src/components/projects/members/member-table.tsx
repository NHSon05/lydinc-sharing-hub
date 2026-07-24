'use client';

import React from 'react';
import type { ProjectMemberItem } from '../ui.types';
import { PROJECT_MEMBER_ROLE_LABELS } from '../ui.types';

interface MemberTableProps {
  members: ProjectMemberItem[];
  onEditRole: (member: ProjectMemberItem) => void;
  onRemove: (member: ProjectMemberItem) => void;
  canManage: boolean;
}

export function MemberTable({ members, onEditRole, onRemove, canManage }: MemberTableProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (members.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl">
        <p className="text-sm text-zinc-500">Chưa có thành viên trong dự án.</p>
        <p className="text-xs text-zinc-600 mt-1">Hãy thêm thành viên để bắt đầu phân công nhiệm vụ.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-zinc-900/60 border-b border-zinc-800">
            <th className="text-left px-4 py-3 font-semibold text-zinc-400">Thành viên</th>
            <th className="text-left px-4 py-3 font-semibold text-zinc-400">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-zinc-400">Phòng ban</th>
            <th className="text-left px-4 py-3 font-semibold text-zinc-400">Vai trò dự án</th>
            <th className="text-left px-4 py-3 font-semibold text-zinc-400">Trạng thái</th>
            <th className="text-left px-4 py-3 font-semibold text-zinc-400">Ngày tham gia</th>
            {canManage && <th className="text-right px-4 py-3 font-semibold text-zinc-400">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-zinc-800/40 hover:bg-zinc-900/30 transition-colors">
              <td className="px-4 py-3">
                <span className="font-medium text-zinc-100">{member.user.name}</span>
              </td>
              <td className="px-4 py-3 text-zinc-400">{member.user.email}</td>
              <td className="px-4 py-3 text-zinc-400">{member.user.department?.name || '-'}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {PROJECT_MEMBER_ROLE_LABELS[member.role] || member.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                    member.user.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {member.user.status === 'ACTIVE' ? 'Hoạt động' : member.user.status === 'LOCKED' ? 'Đã khóa' : 'Ngưng hoạt động'}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-400">{formatDate(member.joinedAt)}</td>
              {canManage && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEditRole(member)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition-colors cursor-pointer"
                    >
                      Sửa vai trò
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(member)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 text-[10px] font-medium border border-rose-800/20 transition-colors cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
