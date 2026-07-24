'use client';

import React from 'react';

interface ProjectProgressProps {
  progress: number;
}

export function ProjectProgress({ progress }: ProjectProgressProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  let barColor = 'bg-purple-600';
  if (clampedProgress >= 100) {
    barColor = 'bg-emerald-500';
  } else if (clampedProgress < 30) {
    barColor = 'bg-blue-500';
  }

  return (
    <div className="flex items-center gap-2.5 min-w-25">
      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <span className="text-[11px] font-mono font-semibold text-zinc-300">
        {clampedProgress}%
      </span>
    </div>
  );
}
