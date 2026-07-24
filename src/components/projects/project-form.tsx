'use client';

import React, { useState, useMemo } from 'react';
import type { DepartmentOption, ManagerOption, UserOption } from './project-ui.types';
import { MEMBER_ROLE_OPTIONS } from './ui.types';

export type ProjectFormData = {
  code: string;
  name: string;
  description: string;
  departmentId: string;
  managerId: string;
  startDate: string;
  endDate: string;
  members: { userId: string; role: string }[];
};

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormData>;
  departments: DepartmentOption[];
  managers: ManagerOption[];
  users?: UserOption[];
  isCreateMode?: boolean;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
  serverError?: string | null;
}

export function ProjectForm({
  initialValues = {},
  departments,
  managers,
  users,
  isCreateMode = false,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
  serverError,
}: ProjectFormProps) {
  const [code, setCode] = useState(initialValues.code || '');
  const [name, setName] = useState(initialValues.name || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [departmentId, setDepartmentId] = useState(
    initialValues.departmentId || (departments.length > 0 ? departments[0].id : '')
  );
  const [managerId, setManagerId] = useState(
    initialValues.managerId || (managers.length > 0 ? managers[0].id : '')
  );

  // Format dates (YYYY-MM-DD) for HTML Date picker input
  const formatDateForInput = (dateInput?: string) => {
    if (!dateInput) return '';
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const getInitialEndDate = () => {
    if (initialValues.endDate) {
      return formatDateForInput(initialValues.endDate);
    }
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(
    formatDateForInput(initialValues.startDate) || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(getInitialEndDate());

  // Member selection state (create mode only)
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<
    { userId: string; role: string }[]
  >([]);

  // Filter users based on search input
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const query = memberSearch.toLowerCase().trim();
    if (!query) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.department?.name?.toLowerCase().includes(query)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- users is a prop that changes with parent re-render
  }, [memberSearch, users]);

  // Remove manager from available member list (manager auto-added on server)
  const availableUsers = useMemo(
    () => filteredUsers.filter((u) => u.id !== managerId),
    [filteredUsers, managerId]
  );

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) => {
      const exists = prev.find((m) => m.userId === userId);
      if (exists) return prev.filter((m) => m.userId !== userId);
      return [...prev, { userId, role: 'MEMBER' }];
    });
  };

  const updateMemberRole = (userId: string, role: string) => {
    setSelectedMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, role } : m))
    );
  };

  const [codeError, setCodeError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (isCreateMode) {
      if (!trimmedCode) {
        setCodeError('Mã dự án không được để trống');
        isValid = false;
      } else if (trimmedCode.length < 2) {
        setCodeError('Mã dự án tối thiểu 2 ký tự');
        isValid = false;
      } else if (trimmedCode.length > 50) {
        setCodeError('Mã dự án tối đa 50 ký tự');
        isValid = false;
      } else if (!/^[A-Z0-9\-_]+$/.test(trimmedCode)) {
        setCodeError('Mã dự án chỉ gồm chữ hoa, số, gạch nối (-) và gạch dưới (_)');
        isValid = false;
      } else {
        setCodeError(null);
      }
    }

    if (!trimmedName) {
      setNameError('Tên dự án không được để trống');
      isValid = false;
    } else if (trimmedName.length < 2) {
      setNameError('Tên dự án tối thiểu 2 ký tự');
      isValid = false;
    } else if (trimmedName.length > 255) {
      setNameError('Tên dự án tối đa 255 ký tự');
      isValid = false;
    } else {
      setNameError(null);
    }

    if (!startDate || !endDate) {
      setDateError('Vui lòng chọn thời gian bắt đầu và kết thúc');
      isValid = false;
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setDateError('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu');
        isValid = false;
      } else {
        setDateError(null);
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    await onSubmit({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      departmentId,
      managerId,
      // Map back to full ISO string
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      members: selectedMembers,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* Row 1: Code & Name */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mã dự án */}
        <div className="sm:col-span-1">
          <label htmlFor="proj-code" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Mã dự án <span className="text-rose-400">*</span>
          </label>
          <input
            id="proj-code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (codeError) setCodeError(null);
            }}
            disabled={isSubmitting || !isCreateMode}
            placeholder="Ví dụ: PROJ-A"
            maxLength={50}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed ${
              codeError
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-zinc-800 focus:border-purple-500'
            }`}
          />
          {codeError && (
            <p className="mt-1 text-[11px] text-rose-400">
              {codeError}
            </p>
          )}
        </div>

        {/* Tên dự án */}
        <div className="sm:col-span-2">
          <label htmlFor="proj-name" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Tên dự án <span className="text-rose-400">*</span>
          </label>
          <input
            id="proj-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            disabled={isSubmitting}
            placeholder="Nhập tên dự án..."
            maxLength={255}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
              nameError
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-zinc-800 focus:border-purple-500'
            }`}
          />
          {nameError && (
            <p className="mt-1 text-[11px] text-rose-400">
              {nameError}
            </p>
          )}
        </div>
      </div>

      {/* Mô tả */}
      <div>
        <label htmlFor="proj-desc" className="block text-xs font-semibold text-zinc-200 mb-1.5">
          Mô tả dự án
        </label>
        <textarea
          id="proj-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          placeholder="Mô tả tóm tắt về mục tiêu dự án..."
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
        />
      </div>

      {/* Row 2: Bộ phận & Người quản lý */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bộ phận */}
        <div>
          <label htmlFor="proj-dept" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Phòng ban phụ trách <span className="text-rose-400">*</span>
          </label>
          <select
            id="proj-dept"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            {departments.length === 0 ? (
              <option value="">Chưa có phòng ban</option>
            ) : (
              departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Người quản lý */}
        <div>
          <label htmlFor="proj-mgr" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Người quản lý dự án <span className="text-rose-400">*</span>
          </label>
          <select
            id="proj-mgr"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            {managers.length === 0 ? (
              <option value="">Không có quản lý khả dụng</option>
            ) : (
              managers.map((mgr) => (
                <option key={mgr.id} value={mgr.id}>
                  {mgr.name} ({mgr.role === 'ADMIN' ? 'Admin' : 'Manager'})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Row 3: Ngày bắt đầu & Ngày kết thúc */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ngày bắt đầu */}
        <div>
          <label htmlFor="proj-start" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Ngày bắt đầu <span className="text-rose-400">*</span>
          </label>
          <input
            id="proj-start"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (dateError) setDateError(null);
            }}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Ngày kết thúc */}
        <div>
          <label htmlFor="proj-end" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Ngày kết thúc <span className="text-rose-400">*</span>
          </label>
          <input
            id="proj-end"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (dateError) setDateError(null);
            }}
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white focus:outline-none transition-colors ${
              dateError ? 'border-rose-500' : 'border-zinc-800 focus:border-purple-500'
            }`}
          />
        </div>
      </div>

      {dateError && (
        <p className="text-[11px] text-rose-400 font-medium">
          {dateError}
        </p>
      )}

      {/* Member selection (create mode only) */}
      {isCreateMode && users && (
        <div className="space-y-3 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-200">
              Thành viên dự án
            </h3>
            <span className="text-[11px] text-zinc-500">
              Đã chọn: {selectedMembers.length} thành viên
            </span>
          </div>

          {/* Search filter */}
          <div>
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Tìm kiếm thành viên..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* User list */}
          <div className="space-y-1 rounded-xl border border-zinc-800 p-1.5 max-h-48 overflow-y-auto">
            {availableUsers.length === 0 ? (
              <div className="p-3 text-xs text-zinc-500 text-center">
                {memberSearch
                  ? 'Không tìm thấy thành viên phù hợp.'
                  : 'Không còn thành viên nào để thêm.'}
              </div>
            ) : (
              availableUsers.map((user) => {
                const isSelected = selectedMembers.some(
                  (m) => m.userId === user.id
                );
                const member = selectedMembers.find(
                  (m) => m.userId === user.id
                );

                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? 'bg-purple-500/10 border border-purple-500/30'
                        : 'bg-zinc-950 border border-transparent hover:bg-zinc-800/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMember(user.id)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-100 truncate">
                        {user.name}
                      </div>
                      <div className="text-zinc-500 truncate">
                        {user.email}
                        {user.department?.name && (
                          <span> &middot; {user.department.name}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <select
                        value={member?.role || 'MEMBER'}
                        onChange={(e) =>
                          updateMemberRole(user.id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer shrink-0"
                      >
                        {MEMBER_ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
        >
          {isSubmitting && (
            <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
