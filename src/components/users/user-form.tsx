'use client';

import React, { useState } from 'react';
import type { DepartmentOption, UserRole } from './user-ui.types';

export type UserFormData = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  departmentId: string;
};

interface UserFormProps {
  initialValues?: Partial<UserFormData>;
  departments: DepartmentOption[];
  isCreateMode?: boolean;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
  serverError?: string | null;
}

export function UserForm({
  initialValues = {},
  departments,
  isCreateMode = false,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
  serverError,
}: UserFormProps) {
  const [name, setName] = useState(initialValues.name || '');
  const [email, setEmail] = useState(initialValues.email || '');
  const [password, setPassword] = useState(initialValues.password || '');
  const [role, setRole] = useState<UserRole>(initialValues.role || 'MEMBER');
  const [departmentId, setDepartmentId] = useState(
    initialValues.departmentId || (departments.length > 0 ? departments[0].id : '')
  );

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deptError, setDeptError] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setNameError('Họ và tên không được để trống');
      isValid = false;
    } else if (trimmedName.length > 150) {
      setNameError('Họ và tên tối đa 150 ký tự');
      isValid = false;
    } else {
      setNameError(null);
    }

    if (!trimmedEmail) {
      setEmailError('Email không được để trống');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Email không đúng định dạng');
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (isCreateMode) {
      if (!password) {
        setPasswordError('Mật khẩu không được để trống');
        isValid = false;
      } else if (password.length < 8) {
        setPasswordError('Mật khẩu tối thiểu 8 ký tự');
        isValid = false;
      } else {
        setPasswordError(null);
      }
    }

    if (!departmentId) {
      setDeptError('Vui lòng chọn phòng ban');
      isValid = false;
    } else {
      setDeptError(null);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    await onSubmit({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      ...(isCreateMode ? { password } : {}),
      role,
      departmentId,
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

      {/* Họ và tên */}
      <div>
        <label htmlFor="user-name" className="block text-xs font-semibold text-zinc-200 mb-1.5">
          Họ và tên <span className="text-rose-400">*</span>
        </label>
        <input
          id="user-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(null);
          }}
          disabled={isSubmitting}
          placeholder="Nhập họ và tên (ví dụ: Nguyễn Văn A)..."
          maxLength={150}
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'name-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
            nameError
              ? 'border-rose-500 focus:border-rose-500'
              : 'border-zinc-800 focus:border-purple-500'
          }`}
        />
        {nameError && (
          <p id="name-error" className="mt-1 text-[11px] text-rose-400">
            {nameError}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="user-email" className="block text-xs font-semibold text-zinc-200 mb-1.5">
          Email <span className="text-rose-400">*</span>
        </label>
        <input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          disabled={isSubmitting}
          placeholder="name@lydinc.local"
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'email-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
            emailError
              ? 'border-rose-500 focus:border-rose-500'
              : 'border-zinc-800 focus:border-purple-500'
          }`}
        />
        {emailError && (
          <p id="email-error" className="mt-1 text-[11px] text-rose-400">
            {emailError}
          </p>
        )}
      </div>

      {/* Mật khẩu (Chỉ ở chế độ Create) */}
      {isCreateMode && (
        <div>
          <label htmlFor="user-password" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Mật khẩu ban đầu <span className="text-rose-400">*</span>
          </label>
          <input
            id="user-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            disabled={isSubmitting}
            placeholder="Mật khẩu tối thiểu 8 ký tự..."
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? 'password-error' : undefined}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
              passwordError
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-zinc-800 focus:border-purple-500'
            }`}
          />
          {passwordError && (
            <p id="password-error" className="mt-1 text-[11px] text-rose-400">
              {passwordError}
            </p>
          )}
        </div>
      )}

      {/* Row: Vai trò & Phòng ban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vai trò */}
        <div>
          <label htmlFor="user-role" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Vai trò <span className="text-rose-400">*</span>
          </label>
          <select
            id="user-role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="MEMBER">Thành viên (MEMBER)</option>
            <option value="MANAGER">Quản lý (MANAGER)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>
        </div>

        {/* Phòng ban */}
        <div>
          <label htmlFor="user-dept" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Phòng ban <span className="text-rose-400">*</span>
          </label>
          <select
            id="user-dept"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              if (deptError) setDeptError(null);
            }}
            disabled={isSubmitting}
            aria-invalid={!!deptError}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white focus:outline-none transition-colors ${
              deptError
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-zinc-800 focus:border-purple-500'
            }`}
          >
            {departments.length === 0 ? (
              <option value="">Chưa có phòng ban nào</option>
            ) : (
              departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))
            )}
          </select>
          {deptError && (
            <p className="mt-1 text-[11px] text-rose-400">
              {deptError}
            </p>
          )}
        </div>
      </div>

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
          aria-busy={isSubmitting}
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
