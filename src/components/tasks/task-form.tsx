'use client';

import React, { useEffect, useState } from 'react';
import type { ProjectOption, ProjectMemberOption } from './task-ui.types';

interface TaskFormProps {
  projects: ProjectOption[];
  initialData?: {
    projectId?: string;
    title?: string;
    description?: string;
    assigneeId?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
  };
  isEdit?: boolean;
  preselectedProjectId?: string;
  onSubmit: (data: {
    title: string;
    description: string | null;
    priority: string;
    startDate: string | null;
    dueDate: string;
    projectId?: string;
    assigneeId?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({
  projects,
  initialData = {},
  isEdit = false,
  preselectedProjectId,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [projectId, setProjectId] = useState(initialData.projectId || preselectedProjectId || '');
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [assigneeId, setAssigneeId] = useState(initialData.assigneeId || '');
  const [priority, setPriority] = useState(initialData.priority || 'MEDIUM');
  
  // Format date helper to YYYY-MM-DD
  const formatDateForInput = (dStr?: string | null) => {
    if (!dStr) return '';
    return dStr.split('T')[0];
  };

  const [startDate, setStartDate] = useState(formatDateForInput(initialData.startDate));
  const [dueDate, setDueDate] = useState(formatDateForInput(initialData.dueDate));

  const [members, setMembers] = useState<ProjectMemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load members whenever projectId changes
  useEffect(() => {
    let active = true;

    if (!projectId) {
      setTimeout(() => {
        if (active) {
          setMembers([]);
          setAssigneeId('');
        }
      }, 0);
      return;
    }

    // Don't reset assignee if it's the initial load of edit form
    if (projectId !== initialData.projectId) {
      setTimeout(() => {
        if (active) {
          setAssigneeId('');
        }
      }, 0);
    }

    const fetchMembers = async () => {
      setLoadingMembers(true);
      setErrorMsg('');
      try {
        // Fetch project info to get manager
        const [projRes, membersRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/members?pageSize=100`),
        ]);
        if (!active) return;

        const allMembersMap = new Map<string, ProjectMemberOption>();

        // Add manager
        if (projRes.ok) {
          const projData = await projRes.json();
          if (projData.data?.manager) {
            allMembersMap.set(projData.data.manager.id, {
              id: projData.data.manager.id,
              name: `${projData.data.manager.name} (Quản lý)`,
              email: projData.data.manager.email || '',
              status: 'ACTIVE',
            });
          }
        }

        // Add project members from dedicated endpoint
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          const memberItems = membersData.data || membersData.items || [];
          if (Array.isArray(memberItems)) {
            memberItems
              .filter((m: { user?: { id: string; name: string; email: string; status: string }; status?: string }) =>
                m?.user && m.user.status === 'ACTIVE'
              )
              .forEach((m: { user: { id: string; name: string; email: string; status: string } }) => {
                allMembersMap.set(m.user.id, {
                  id: m.user.id,
                  name: m.user.name,
                  email: m.user.email,
                  status: m.user.status,
                });
              });
          }
        }

        if (active) setMembers(Array.from(allMembersMap.values()));
      } catch (err) {
        console.error('Error fetching project members:', err);
      } finally {
        if (active) setLoadingMembers(false);
      }
    };

    fetchMembers();

    return () => {
      active = false;
    };
  }, [projectId, initialData.projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isEdit && !projectId) {
      setErrorMsg('Vui lòng chọn một dự án.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Tiêu đề nhiệm vụ không được để trống.');
      return;
    }
    if (!isEdit && !assigneeId) {
      setErrorMsg('Vui lòng chọn người phụ trách.');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Vui lòng chọn hạn hoàn thành.');
      return;
    }

    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
      setErrorMsg('Hạn hoàn thành phải bằng hoặc sau ngày bắt đầu.');
      return;
    }

    // Check project end bounds
    const chosenProj = projects.find((p) => p.id === projectId);
    if (chosenProj && new Date(dueDate) > new Date(chosenProj.endDate)) {
      setErrorMsg('Hạn hoàn thành không được vượt quá ngày kết thúc của dự án.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload: {
        title: string;
        description: string | null;
        priority: string;
        startDate: string | null;
        dueDate: string;
        projectId?: string;
        assigneeId?: string;
      } = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        dueDate: new Date(dueDate).toISOString(),
      };

      if (!isEdit) {
        payload.projectId = projectId;
        payload.assigneeId = assigneeId;
      }

      await onSubmit(payload);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.';
      setErrorMsg(errMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Project Selection */}
      {!isEdit && (
        <div className="space-y-1.5">
          <label htmlFor="projectId" className="text-xs font-semibold text-zinc-400">
            Dự án <span className="text-rose-500">*</span>
          </label>
          <select
            id="projectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="">Chọn dự án</option>
            {projects
              .filter((p) => p.status !== 'CANCELLED' && p.status !== 'COMPLETED')
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-xs font-semibold text-zinc-400">
          Tiêu đề <span className="text-rose-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề nhiệm vụ"
          maxLength={200}
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="text-xs font-semibold text-zinc-400">
          Mô tả
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả công việc"
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors resize-none"
        />
      </div>

      {/* Assignee selection */}
      {!isEdit && (
        <div className="space-y-1.5">
          <label htmlFor="assigneeId" className="text-xs font-semibold text-zinc-400">
            Người phụ trách <span className="text-rose-500">*</span>
          </label>
          <select
            id="assigneeId"
            value={assigneeId}
            disabled={!projectId || loadingMembers}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-40"
          >
            {!projectId ? (
              <option value="">Chọn dự án trước</option>
            ) : loadingMembers ? (
              <option value="">Đang tải thành viên...</option>
            ) : (
              <>
                <option value="">Chọn người phụ trách</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Priority */}
        <div className="space-y-1.5">
          <label htmlFor="priority" className="text-xs font-semibold text-zinc-400">
            Độ ưu tiên
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="LOW">Thấp</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HIGH">Cao</option>
            <option value="URGENT">Khẩn cấp</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label htmlFor="startDate" className="text-xs font-semibold text-zinc-400">
            Ngày bắt đầu
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Due Date */}
        <div className="space-y-1.5">
          <label htmlFor="dueDate" className="text-xs font-semibold text-zinc-400">
            Hạn hoàn thành <span className="text-rose-500">*</span>
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800/40">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-850 transition-colors disabled:opacity-40 cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang xử lý...
            </>
          ) : isEdit ? (
            'Lưu thay đổi'
          ) : (
            'Tạo nhiệm vụ'
          )}
        </button>
      </div>
    </form>
  );
}
