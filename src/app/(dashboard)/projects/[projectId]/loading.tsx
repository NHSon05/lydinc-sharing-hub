import React from 'react';

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-zinc-800 rounded-md" />
          <div className="flex items-center gap-3">
            <div className="h-6 w-20 bg-zinc-800 rounded-lg font-mono" />
            <div className="h-8 w-60 bg-zinc-800 rounded-lg" />
            <div className="h-5 w-24 bg-zinc-800 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-zinc-800 rounded-xl" />
          <div className="h-9 w-24 bg-zinc-800 rounded-xl" />
        </div>
      </div>

      {/* Main Grid Info Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        {/* Left Column Skeletons */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-40 w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl" />
          <div className="h-48 w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl" />
        </div>
        
        {/* Right Column Skeletons */}
        <div className="space-y-6">
          <div className="h-56 w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl" />
          <div className="h-28 w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
