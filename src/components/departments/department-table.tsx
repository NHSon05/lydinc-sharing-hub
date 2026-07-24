'use client';

import React from 'react';
import type { DepartmentItem } from './department-ui.types';
import { DepartmentTableRow } from './department-table-row';

interface DepartmentTableProps {
  departments: DepartmentItem[];
  isAdmin: boolean;
  page: number;
  pageSize: number;
  onEdit: (department: DepartmentItem) => void;
  onDelete: (department: DepartmentItem) => void;
}

export function DepartmentTable({
  departments,
  isAdmin,
  page,
  pageSize,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
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
              Tên phòng ban
            </th>
            <th scope="col" className="px-4 py-3.5">
              Mô tả
            </th>
            <th scope="col" className="px-4 py-3.5 text-center">
              Số nhân sự
            </th>
            <th scope="col" className="px-4 py-3.5 text-center">
              Số dự án
            </th>
            <th scope="col" className="px-4 py-3.5">
              Ngày tạo
            </th>
            {isAdmin && (
              <th scope="col" className="px-4 py-3.5 text-right">
                Thao tác
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {departments.map((department, idx) => (
            <DepartmentTableRow
              key={department.id}
              index={startIndex + idx}
              department={department}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
