'use client';

import React from 'react';

export function MemberTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 animate-pulse">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-zinc-900/60 border-b border-zinc-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={i} className="text-left px-4 py-3">
                <div className="h-3 bg-zinc-800 rounded w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 3 }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-zinc-800/40">
              {Array.from({ length: 6 }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <div className={`h-3 bg-zinc-800/50 rounded ${colIdx === 0 ? 'w-24' : colIdx === 1 ? 'w-32' : 'w-16'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
