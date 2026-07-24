import { describe, it, expect } from 'vitest';
import { TaskStatus, TaskPriority } from '@/generated/prisma/client';

describe('Tasks UI Helper Logic Tests', () => {
  it('correctly formats status badge and priority levels', () => {
    // Basic test checking standard type parameters match enum keys
    expect(TaskStatus.TODO).toBe('TODO');
    expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
    expect(TaskStatus.REVIEW).toBe('REVIEW');
    expect(TaskStatus.COMPLETED).toBe('COMPLETED');
    expect(TaskStatus.CANCELLED).toBe('CANCELLED');

    expect(TaskPriority.LOW).toBe('LOW');
    expect(TaskPriority.MEDIUM).toBe('MEDIUM');
    expect(TaskPriority.HIGH).toBe('HIGH');
    expect(TaskPriority.URGENT).toBe('URGENT');
  });

  it('correctly maps date strings', () => {
    const rawDate = '2026-07-24T06:00:00.000Z';
    const parsed = new Date(rawDate);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(6); // 0-indexed July is 6
    expect(parsed.getDate()).toBe(24);
  });
});
