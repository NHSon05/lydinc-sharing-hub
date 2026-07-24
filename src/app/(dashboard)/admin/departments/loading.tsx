import React from 'react';
import { DepartmentTableSkeleton } from '@/components/departments/department-table-skeleton';

export default function AdminDepartmentsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 animate-pulse">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-zinc-800 rounded-lg" />
          <div className="h-3 w-80 bg-zinc-800/60 rounded-md" />
        </div>
        <div className="h-9 w-36 bg-zinc-800 rounded-xl" />
      </div>

      {/* Search Skeleton */}
      <div className="h-9 w-full max-w-md bg-zinc-900/60 border border-zinc-800 rounded-xl animate-pulse" />

      {/* Table Skeleton */}
      <DepartmentTableSkeleton />
    </div>
  );
}
