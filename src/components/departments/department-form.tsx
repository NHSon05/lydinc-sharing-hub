'use client';

import React, { useState } from 'react';

export type DepartmentFormData = {
  name: string;
  description: string;
};

interface DepartmentFormProps {
  initialValues?: DepartmentFormData;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
  serverError?: string | null;
}

export function DepartmentForm({
  initialValues = { name: '', description: '' },
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
  serverError,
}: DepartmentFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);

  const [nameError, setNameError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      setNameError('Tên phòng ban không được để trống');
      isValid = false;
    } else if (trimmedName.length > 150) {
      setNameError('Tên phòng ban tối đa 150 ký tự');
      isValid = false;
    } else {
      setNameError(null);
    }

    if (trimmedDesc.length > 1000) {
      setDescError('Mô tả phòng ban tối đa 1000 ký tự');
      isValid = false;
    } else {
      setDescError(null);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
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

      {/* Tên phòng ban */}
      <div>
        <label htmlFor="dept-name" className="block text-xs font-semibold text-zinc-200 mb-1.5">
          Tên phòng ban <span className="text-rose-400">*</span>
        </label>
        <input
          id="dept-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(null);
          }}
          disabled={isSubmitting}
          placeholder="Nhập tên phòng ban (ví dụ: Chuyển đổi số)..."
          maxLength={150}
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'name-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
            nameError
              ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
          }`}
        />
        {nameError && (
          <p id="name-error" className="mt-1 text-[11px] text-rose-400">
            {nameError}
          </p>
        )}
      </div>

      {/* Mô tả phòng ban */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="dept-desc" className="block text-xs font-semibold text-zinc-200">
            Mô tả
          </label>
          <span className="text-[10px] font-mono text-zinc-500">
            {description.length}/1000
          </span>
        </div>
        <textarea
          id="dept-desc"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (descError) setDescError(null);
          }}
          disabled={isSubmitting}
          rows={4}
          placeholder="Nhập mô tả ngắn gọn về chức năng, nhiệm vụ của phòng ban..."
          maxLength={1000}
          aria-invalid={!!descError}
          aria-describedby={descError ? 'desc-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors resize-none ${
            descError
              ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
          }`}
        />
        {descError && (
          <p id="desc-error" className="mt-1 text-[11px] text-rose-400">
            {descError}
          </p>
        )}
      </div>

      {/* Action Buttons */}
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
