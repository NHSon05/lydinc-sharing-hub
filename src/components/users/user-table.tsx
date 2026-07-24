'use client';

import React from 'react';
import type { UserItem } from './user-ui.types';
import { UserTableRow } from './user-table-row';

interface UserTableProps {
  users: UserItem[];
  isAdmin: boolean;
  page: number;
  pageSize: number;
  onViewDetail: (user: UserItem) => void;
  onEdit: (user: UserItem) => void;
  onChangeStatus: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
}

export function UserTable({
  users,
  isAdmin,
  page,
  pageSize,
  onViewDetail,
  onEdit,
  onChangeStatus,
  onResetPassword,
}: UserTableProps) {
  const startIndex = (page - 1) * pageSize + 1;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <th scope="col" className="px-4 py-3.5 text-center w-12">
              STT
            </th>
            <th scope="col" className="px-4 py-3.5">
              Thành viên
            </th>
            <th scope="col" className="px-4 py-3.5">
              Email
            </th>
            <th scope="col" className="px-4 py-3.5">
              Phòng ban
            </th>
            <th scope="col" className="px-4 py-3.5">
              Vai trò
            </th>
            <th scope="col" className="px-4 py-3.5">
              Trạng thái
            </th>
            <th scope="col" className="px-4 py-3.5">
              Ngày tạo
            </th>
            <th scope="col" className="px-4 py-3.5 text-right">
              Thao tác
            </th>
          </tr>
        </thead>

        <tbody>
          {users.map((user, idx) => (
            <UserTableRow
              key={user.id}
              index={startIndex + idx}
              user={user}
              isAdmin={isAdmin}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onChangeStatus={onChangeStatus}
              onResetPassword={onResetPassword}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
