'use client';

import React from 'react';

export function ProjectTableSkeleton() {
  const rows = Array.from({ length: 6 });

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-xl animate-pulse">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/60">
            <th className="px-4 py-3.5 w-12 text-center">
              <div className="h-3 w-6 bg-zinc-800 rounded-md mx-auto" />
            </th>
            <th className="px-4 py-3.5 w-24">
              <div className="h-3 w-16 bg-zinc-800 rounded-md" />
            </th>
            <th className="px-4 py-3.5">
              <div className="h-3 w-32 bg-zinc-800 rounded-md" />
            </th>
            <th className="px-4 py-3.5">
              <div className="h-3 w-20 bg-zinc-800 rounded-md" />
            </th>
            <th className="px-4 py-3.5">
              <div className="h-3 w-24 bg-zinc-800 rounded-md" />
            </th>
            <th className="px-4 py-3.5">
              <div className="h-3 w-20 bg-zinc-800 rounded-md" />
            </th>
            <th className="px-4 py-3.5">
              <div className="h-3 w-28 bg-zinc-800 rounded-md" />
            </th>
            <th className="px-4 py-3.5 text-center">
              <div className="h-3 w-12 bg-zinc-800 rounded-md mx-auto" />
            </th>
            <th className="px-4 py-3.5 text-center">
              <div className="h-3 w-12 bg-zinc-800 rounded-md mx-auto" />
            </th>
            <th className="px-4 py-3.5">
              <div className="h-3 w-24 bg-zinc-800 rounded-md" />
            </th>
            <th className="px-4 py-3.5 text-right">
              <div className="h-3 w-16 bg-zinc-800 rounded-md ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, idx) => (
            <tr key={idx} className="border-b border-zinc-800/40">
              <td className="px-4 py-4 text-center">
                <div className="h-3.5 w-4 bg-zinc-800/80 rounded-md mx-auto" />
              </td>
              <td className="px-4 py-4">
                <div className="h-3.5 w-14 bg-zinc-800/80 rounded-md font-mono" />
              </td>
              <td className="px-4 py-4">
                <div className="h-3.5 w-40 bg-zinc-800/60 rounded-md" />
              </td>
              <td className="px-4 py-4">
                <div className="h-3.5 w-20 bg-zinc-800/60 rounded-md" />
              </td>
              <td className="px-4 py-4">
                <div className="h-3.5 w-24 bg-zinc-800/60 rounded-md" />
              </td>
              <td className="px-4 py-4">
                <div className="h-5 w-20 bg-zinc-800/80 rounded-full" />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 bg-zinc-800 rounded-full" />
                  <div className="h-3 w-6 bg-zinc-800/80 rounded-md" />
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="h-3.5 w-6 bg-zinc-800/60 rounded-md mx-auto" />
              </td>
              <td className="px-4 py-4 text-center">
                <div className="h-3.5 w-6 bg-zinc-800/60 rounded-md mx-auto" />
              </td>
              <td className="px-4 py-4">
                <div className="h-3.5 w-24 bg-zinc-800/60 rounded-md" />
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-1.5">
                  <div className="h-6 w-12 bg-zinc-800/80 rounded-lg" />
                  <div className="h-6 w-12 bg-zinc-800/80 rounded-lg" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
