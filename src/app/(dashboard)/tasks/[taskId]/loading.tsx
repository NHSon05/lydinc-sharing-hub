import React from 'react';

export default function TaskDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-3">
          <div className="w-24 h-4 bg-zinc-800 rounded" />
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-16 h-6 bg-zinc-800 rounded-lg" />
            <div className="w-48 h-8 bg-zinc-800 rounded-lg" />
            <div className="w-20 h-6 bg-zinc-800 rounded-full" />
            <div className="w-14 h-6 bg-zinc-800 rounded-full" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-40 bg-zinc-900/40 rounded-2xl border border-zinc-800" />
          <div className="h-40 bg-zinc-900/40 rounded-2xl border border-zinc-800" />
        </div>
        <div className="space-y-6">
          <div className="h-72 bg-zinc-900/40 rounded-2xl border border-zinc-800" />
          <div className="h-32 bg-zinc-900/40 rounded-2xl border border-zinc-800" />
        </div>
      </div>
    </div>
  );
}
