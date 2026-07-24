import React from 'react';
import { ProjectTableSkeleton } from '@/components/projects/project-table-skeleton';

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 animate-pulse">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-zinc-800 rounded-lg" />
          <div className="h-3 w-80 bg-zinc-800/60 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-zinc-800 rounded-xl" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="h-14 w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl animate-pulse" />

      {/* Table Skeleton */}
      <ProjectTableSkeleton />
    </div>
  );
}
