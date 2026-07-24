'use client';

import React from 'react';
import type { TaskItem } from './task-ui.types';
import { TaskTableRow } from './task-table-row';

interface TaskTableProps {
  tasks: TaskItem[];
  userId: string;
  userRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
  page: number;
  pageSize: number;
  onEdit: (task: TaskItem) => void;
  onChangeStatus: (task: TaskItem) => void;
  onChangeAssignee: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
}

export function TaskTable({
  tasks,
  userId,
  userRole,
  page,
  pageSize,
  onEdit,
  onChangeStatus,
  onChangeAssignee,
  onDelete,
}: TaskTableProps) {
  const startIndex = (page - 1) * pageSize + 1;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/40 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <th scope="col" className="px-6 py-3.5 text-center w-12">
              STT
            </th>
            <th scope="col" className="px-6 py-3.5">
              Nhiệm vụ
            </th>
            <th scope="col" className="px-6 py-3.5">
              Dự án
            </th>
            <th scope="col" className="px-6 py-3.5">
              Người thực hiện
            </th>
            <th scope="col" className="px-6 py-3.5">
              Độ ưu tiên
            </th>
            <th scope="col" className="px-6 py-3.5">
              Tiến độ
            </th>
            <th scope="col" className="px-6 py-3.5">
              Trạng thái
            </th>
            <th scope="col" className="px-6 py-3.5">
              Hạn hoàn thành
            </th>
            <th scope="col" className="px-6 py-3.5 text-right">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 text-sm">
          {tasks.map((task, idx) => (
            <TaskTableRow
              key={task.id}
              index={startIndex + idx}
              task={task}
              userId={userId}
              userRole={userRole}
              onEdit={onEdit}
              onChangeStatus={onChangeStatus}
              onChangeAssignee={onChangeAssignee}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
