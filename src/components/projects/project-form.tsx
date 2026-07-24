'use client';

import React, { useState } from 'react';
import type { DepartmentOption, ManagerOption } from './project-ui.types';

export type ProjectFormData = {
  code: string;
  name: string;
  description: string;
  departmentId: string;
  managerId: string;
  startDate: string;
  endDate: string;
};

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormData>;
  departments: DepartmentOption[];
  managers: ManagerOption[];
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
