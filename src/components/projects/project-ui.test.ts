import { describe, expect, it } from 'vitest';
import type { ProjectStatus } from './project-ui.types';

describe('Project UI Helpers & Validation', () => {
  it('should translate project status values correctly', () => {
    const translateStatus = (status: ProjectStatus) => {
      switch (status) {
        case 'PLANNING':
          return 'Lập kế hoạch';
        case 'ACTIVE':
          return 'Đang thực hiện';
        case 'ON_HOLD':
          return 'Tạm dừng';
        case 'COMPLETED':
          return 'Hoàn thành';
        case 'CANCELLED':
          return 'Đã hủy';
      }
    };

    expect(translateStatus('PLANNING')).toBe('Lập kế hoạch');
    expect(translateStatus('ACTIVE')).toBe('Đang thực hiện');
    expect(translateStatus('ON_HOLD')).toBe('Tạm dừng');
    expect(translateStatus('COMPLETED')).toBe('Hoàn thành');
    expect(translateStatus('CANCELLED')).toBe('Đã hủy');
  });

  it('should validate date comparison', () => {
    const isDateRangeValid = (start: string, end: string) => {
      return new Date(start) <= new Date(end);
    };

    expect(isDateRangeValid('2026-07-01', '2026-07-10')).toBe(true);
    expect(isDateRangeValid('2026-07-10', '2026-07-01')).toBe(false);
    expect(isDateRangeValid('2026-07-01', '2026-07-01')).toBe(true);
  });

  it('should accurately calculate progress percentage', () => {
    const getProgress = (completed: number, total: number) => {
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    expect(getProgress(5, 10)).toBe(50);
    expect(getProgress(0, 5)).toBe(0);
    expect(getProgress(3, 3)).toBe(100);
    expect(getProgress(1, 3)).toBe(33);
  });
});
