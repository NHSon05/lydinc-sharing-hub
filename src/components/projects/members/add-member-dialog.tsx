'use client';

import React, { useState, useCallback } from 'react';
import type { MemberCandidateItem } from '../ui.types';
import { MEMBER_ROLE_OPTIONS } from '../ui.types';

interface AddMemberDialogProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function AddMemberDialog({
  isOpen,
  projectId,
  onClose,
  onSuccess,
}: AddMemberDialogProps) {
  const [candidates, setCandidates] = useState<MemberCandidateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCandidates = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm?.trim()) params.set('search', searchTerm.trim());
      const res = await fetch(`/api/projects/${projectId}/member-candidates?${params}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setCandidates(data.data);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Initial data load
  React.useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCandidates();
    }
  }, [isOpen, fetchCandidates]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedUserId) {
      setErrorMsg('Vui lòng chọn người dùng.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, role: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Thêm thành viên thất bại.');
      }

      onSuccess(data.message || 'Thêm thành viên thành công.');
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleSearch = () => {
    fetchCandidates(search);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-base font-bold text-white">Thêm thành viên vào dự án</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">Chọn người dùng và vai trò trong dự án.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Tìm kiếm người dùng</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Nhập tên hoặc email..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Tìm
              </button>
            </div>
          </div>

          {/* User selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">
              Người dùng <span className="text-rose-500">*</span>
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-zinc-800 p-1">
              {loading ? (
                <div className="p-3 text-xs text-zinc-500 text-center">Đang tải...</div>
              ) : candidates.length === 0 ? (
                <div className="p-3 text-xs text-zinc-500 text-center">
                  {search ? 'Không tìm thấy người dùng phù hợp.' : 'Không còn người dùng nào để thêm.'}
                </div>
              ) : (
                candidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedUserId(c.id)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-colors cursor-pointer ${
                      selectedUserId === c.id
                        ? 'bg-purple-500/10 border border-purple-500/30'
                        : 'bg-zinc-950 border border-transparent hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="font-medium text-zinc-100">{c.name}</div>
                    <div className="text-zinc-500 mt-0.5">{c.email}</div>
                    <div className="text-zinc-600 mt-0.5">{c.department?.name || '-'}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Role selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Vai trò trong dự án</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
            >
              {MEMBER_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
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
              disabled={isSubmitting || !selectedUserId}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? 'Đang thêm...' : 'Thêm thành viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
