'use client';

import React, { useEffect, useState } from 'react';
import type { TaskItem, ProjectMemberOption } from './task-ui.types';

interface ChangeTaskAssigneeDialogProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function ChangeTaskAssigneeDialog({
  task,
  isOpen,
  onClose,
  onSuccess,
}: ChangeTaskAssigneeDialogProps) {
  const [members, setMembers] = useState<ProjectMemberOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');

  useEffect(() => {
    if (!isOpen || !task) return;

    const fetchMembers = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch(`/api/projects/${task.project.id}`);
        const data = await res.json();
        if (res.ok && data.data) {
          const list: ProjectMemberOption[] = [];

          if (data.data.manager) {
            list.push({
              id: data.data.manager.id,
              name: `${data.data.manager.name} (Manager)`,
              email: data.data.manager.email || '',
              status: 'ACTIVE',
            });
          }

          if (data.data.members && Array.isArray(data.data.members)) {
            data.data.members.forEach((m: { user?: { id: string; name: string; email: string; status: string } }) => {
              if (m.user && m.user.status === 'ACTIVE' && m.user.id !== data.data.manager?.id) {
                list.push({
                  id: m.user.id,
                  name: m.user.name,
                  email: m.user.email,
                  status: m.user.status,
                });
              }
            });
          }

          setMembers(list);
          setSelectedAssigneeId(task.assignee?.id || '');
        }
      } catch (err) {
        console.error('Error fetching project members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedAssigneeId) {
      setErrorMsg('Vui lòng chọn người phụ trách mới.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/tasks/${task.id}/assignee`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assigneeId: selectedAssigneeId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Thay đổi người phụ trách thất bại.');
      }

      onSuccess(data.message || 'Thay đổi người phụ trách thành công.');
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.';
      setErrorMsg(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white text-left">Thay đổi người thực hiện</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5 text-left">
            Chọn thành viên trong dự án để giao nhiệm vụ: <strong className="text-zinc-200">{task.title}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Project Details */}
          <div>
            <span className="block text-[10px] text-zinc-500">Dự án hiện tại</span>
            <span className="text-xs font-semibold text-zinc-300">
              {task.project.code} - {task.project.name}
            </span>
          </div>

          {/* Assignee select */}
          <div className="space-y-1.5">
            <label htmlFor="assigneeId" className="text-xs font-semibold text-zinc-400">
              Người thực hiện mới <span className="text-rose-500">*</span>
            </label>
            <select
              id="assigneeId"
              value={selectedAssigneeId}
              disabled={loading}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-40"
            >
              {loading ? (
                <option value="">Đang tải danh sách thành viên...</option>
              ) : (
                <>
                  <option value="">Chọn người thực hiện</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Footer Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-850 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Giao việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
