import { describe, expect, it } from 'vitest';
import { TaskStatus, TaskPriority } from '@/generated/prisma/client';
import {
  canCreateTask,
  canUpdateTask,
  canViewTask,
} from './task.policy';
import {
  createTaskSchema,
  taskListQuerySchema,
} from './task.schema';
import { toTaskDTO } from './task.mapper';

describe('Task Policy Tests', () => {
  const activeAdmin = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@lydinc.local',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    departmentId: 'dept-1',
  };

  const activeManager = {
    id: 'mgr-1',
    name: 'Manager User',
    email: 'mgr@lydinc.local',
    role: 'MANAGER' as const,
    status: 'ACTIVE' as const,
    departmentId: 'dept-1',
  };

  const activeMember = {
    id: 'mem-1',
    name: 'Member User',
    email: 'mem@lydinc.local',
    role: 'MEMBER' as const,
    status: 'ACTIVE' as const,
    departmentId: 'dept-1',
  };

  const lockedUser = {
    ...activeAdmin,
    status: 'LOCKED' as const,
  };

  const projectContext = {
    managerId: 'mgr-1',
    members: [{ userId: 'mem-1' }],
  };

  it('should validate canViewTask permissions', () => {
    expect(canViewTask(activeAdmin, projectContext)).toBe(true);
    expect(canViewTask(activeManager, projectContext)).toBe(true);
    expect(canViewTask(activeMember, projectContext)).toBe(true);

    const nonMember = { ...activeMember, id: 'mem-999' };
    expect(canViewTask(nonMember, projectContext)).toBe(false);
    expect(canViewTask(lockedUser, projectContext)).toBe(false);
  });

  it('should validate canCreateTask permissions', () => {
    expect(canCreateTask(activeAdmin, projectContext)).toBe(true);
    expect(canCreateTask(activeManager, projectContext)).toBe(true);

    const otherManager = { ...activeManager, id: 'mgr-999' };
    expect(canCreateTask(otherManager, projectContext)).toBe(false);
    expect(canCreateTask(activeMember, projectContext)).toBe(false);
  });

  it('should validate canUpdateTask permissions', () => {
    expect(canUpdateTask(activeAdmin, projectContext, 'mem-1')).toBe(true);
    expect(canUpdateTask(activeManager, projectContext, 'mem-1')).toBe(true);
    expect(canUpdateTask(activeMember, projectContext, 'mem-1')).toBe(true);

    const nonAssignee = { ...activeMember, id: 'mem-999' };
    expect(canUpdateTask(nonAssignee, projectContext, 'mem-1')).toBe(false);
  });
});

describe('Task Schema Validation Tests', () => {
  it('should validate valid create inputs', () => {
    const valid = {
      projectId: 'proj-1',
      title: '  Lập trình backend module Tasks ',
      assigneeId: 'user-1',
      priority: 'HIGH',
      startDate: '2026-07-24',
      dueDate: '2026-07-30',
    };
    const result = createTaskSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Lập trình backend module Tasks');
      expect(result.data.priority).toBe(TaskPriority.HIGH);
    }
  });

  it('should reject invalid date ranges', () => {
    const invalid = {
      projectId: 'proj-1',
      title: 'Test',
      assigneeId: 'user-1',
      startDate: '2026-07-30',
      dueDate: '2026-07-24',
    };
    const result = createTaskSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should parse task list queries', () => {
    const result = taskListQuerySchema.safeParse({
      page: '3',
      pageSize: '15',
      overdue: 'true',
      sortBy: 'dueDate',
      sortOrder: 'asc',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.pageSize).toBe(15);
      expect(result.data.overdue).toBe(true);
      expect(result.data.sortBy).toBe('dueDate');
    }
  });
});

describe('Task Mapper Tests', () => {
  it('should transform database entity to DTO', () => {
    const now = new Date();
    const rawTask = {
      id: 'task-1',
      title: 'Verify features',
      description: 'Detail verification',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      progress: 50,
      startDate: now,
      dueDate: now,
      completedAt: null,
      result: null,
      projectId: 'proj-1',
      assigneeId: 'user-1',
      createdById: 'admin-1',
      createdAt: now,
      updatedAt: now,
      project: { id: 'proj-1', code: 'PROJ-A', name: 'Project A', description: null, status: 'ACTIVE' as const, startDate: now, endDate: now, departmentId: 'dept-1', managerId: 'mgr-1', createdById: 'admin-1', createdAt: now, updatedAt: now },
      assignee: { id: 'user-1', name: 'User 1', email: 'user1@lydinc.local', passwordHash: '', role: 'MEMBER' as const, status: 'ACTIVE' as const, departmentId: 'dept-1', createdAt: now, updatedAt: now },
      createdBy: { id: 'admin-1', name: 'Admin', email: 'admin@lydinc.local', passwordHash: '', role: 'ADMIN' as const, status: 'ACTIVE' as const, departmentId: 'dept-1', createdAt: now, updatedAt: now },
    };

    const dto = toTaskDTO(rawTask);
    expect(dto.title).toBe('Verify features');
    expect(dto.project.code).toBe('PROJ-A');
    expect(dto.assignee.name).toBe('User 1');
    expect(dto.createdBy.name).toBe('Admin');
  });
});
