'use client';

import React from 'react';

export function TaskTableSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md overflow-hidden shadow-xl animate-pulse">
      {/* Table Header skeleton */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-900/30 flex items-center px-6 justify-between">
        <div className="w-16 h-3 bg-zinc-800 rounded" />
        <div className="w-32 h-3 bg-zinc-800 rounded" />
        <div className="w-24 h-3 bg-zinc-800 rounded" />
        <div className="w-20 h-3 bg-zinc-800 rounded" />
        <div className="w-12 h-3 bg-zinc-800 rounded" />
        <div className="w-24 h-3 bg-zinc-800 rounded" />
      </div>

      {/* Table Rows skeleton */}
      <div className="divide-y divide-zinc-800/60">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-16 flex items-center px-6 justify-between">
            <div className="w-8 h-3.5 bg-zinc-850 rounded" />
            <div className="w-48 h-3.5 bg-zinc-850 rounded" />
            <div className="w-28 h-3.5 bg-zinc-850 rounded" />
            <div className="w-24 h-3.5 bg-zinc-850 rounded" />
            <div className="w-16 h-5 bg-zinc-850 rounded-full" />
            <div className="w-14 h-5 bg-zinc-850 rounded-full" />
            <div className="w-20 h-3.5 bg-zinc-850 rounded" />
            <div className="w-24 h-8 bg-zinc-850 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
