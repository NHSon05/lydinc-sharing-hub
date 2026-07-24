import { describe, expect, it } from 'vitest';
import { ProjectStatus } from '@/generated/prisma/client';
import { AccountStatusError, AuthorizationError } from '@/lib/errors';
import {
  canCreateProject,
  canDeleteProject,
  canManageProject,
  canViewProjects,
} from './project.policy';
import {
  createProjectSchema,
  projectListQuerySchema,
  updateProjectSchema,
  updateProjectStatusSchema,
} from './project.schema';
import { toProjectDTO } from './project.mapper';

describe('Project Policy Tests', () => {
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

  it('should validate canViewProjects status', () => {
    expect(canViewProjects(activeMember)).toBe(true);
    expect(canViewProjects(lockedUser)).toBe(false);
  });

  it('should validate canCreateProject constraints', () => {
    expect(canCreateProject(activeAdmin)).toBe(true);
    expect(canCreateProject(activeManager)).toBe(true);
    expect(canCreateProject(activeMember)).toBe(false);
    expect(canCreateProject(lockedUser)).toBe(false);
  });

  it('should validate canManageProject constraints', () => {
    const project = { managerId: 'mgr-1' };
    expect(canManageProject(activeAdmin, project)).toBe(true);
    expect(canManageProject(activeManager, project)).toBe(true);

    const otherManager = { ...activeManager, id: 'mgr-2' };
    expect(canManageProject(otherManager, project)).toBe(false);
    expect(canManageProject(activeMember, project)).toBe(false);
  });

  it('should validate canDeleteProject constraints', () => {
    expect(canDeleteProject(activeAdmin)).toBe(true);
    expect(canDeleteProject(activeManager)).toBe(false);
    expect(canDeleteProject(activeMember)).toBe(false);
  });
});

describe('Project Schema Validation Tests', () => {
  it('should validate valid create inputs', () => {
    const valid = {
      code: '  angc-2026 ',
      name: 'Website ANGC',
      departmentId: 'dept-1',
      managerId: 'user-1',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    };
    const result = createProjectSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe('ANGC-2026');
      expect(result.data.status).toBe(ProjectStatus.PLANNING);
    }
  });

  it('should reject invalid date range (endDate < startDate)', () => {
    const invalid = {
      code: 'ANGC-2026',
      name: 'Website ANGC',
      departmentId: 'dept-1',
      managerId: 'user-1',
      startDate: '2026-12-31',
      endDate: '2026-01-01',
    };
    const result = createProjectSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate list query parser & defaults', () => {
    const result = projectListQuerySchema.safeParse({
      page: '2',
      pageSize: '10',
      sortBy: 'startDate',
      sortOrder: 'asc',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.pageSize).toBe(10);
      expect(result.data.sortBy).toBe('startDate');
      expect(result.data.sortOrder).toBe('asc');
    }
  });
});

describe('Project Mapper Tests', () => {
  it('should transform database entity to clean DTO structure', () => {
    const now = new Date();
    const rawProject = {
      id: 'proj-123',
      code: 'CODE-A',
      name: 'Test Project',
      description: 'Detail description',
      status: ProjectStatus.ACTIVE,
      startDate: now,
      endDate: now,
      departmentId: 'dept-1',
      managerId: 'mgr-1',
      createdById: 'creator-1',
      createdAt: now,
      updatedAt: now,
      department: { id: 'dept-1', name: 'Dept Name', description: null, createdAt: now, updatedAt: now },
      manager: { id: 'mgr-1', name: 'Manager Name', email: 'mgr@mail.com', passwordHash: '', role: 'MANAGER' as const, status: 'ACTIVE' as const, departmentId: 'dept-1', createdAt: now, updatedAt: now },
      createdBy: { id: 'creator-1', name: 'Creator Name', email: 'creator@mail.com', passwordHash: '', role: 'ADMIN' as const, status: 'ACTIVE' as const, departmentId: 'dept-1', createdAt: now, updatedAt: now },
      members: [{ id: 'm-1', projectId: 'proj-123', userId: 'mgr-1', joinedAt: now }],
      tasks: [
        { id: 't-1', title: 'Task 1', description: null, status: 'COMPLETED' as const, priority: 'MEDIUM' as const, progress: 100, startDate: null, dueDate: now, completedAt: now, result: null, projectId: 'proj-123', assigneeId: 'mgr-1', createdById: 'creator-1', createdAt: now, updatedAt: now },
        { id: 't-2', title: 'Task 2', description: null, status: 'TODO' as const, priority: 'MEDIUM' as const, progress: 0, startDate: null, dueDate: now, completedAt: null, result: null, projectId: 'proj-123', assigneeId: 'mgr-1', createdById: 'creator-1', createdAt: now, updatedAt: now },
      ],
    };

    const dto = toProjectDTO(rawProject);
    expect(dto.code).toBe('CODE-A');
    expect(dto.memberCount).toBe(1);
    expect(dto.taskSummary.total).toBe(2);
    expect(dto.taskSummary.completed).toBe(1);
    expect(dto.department.name).toBe('Dept Name');
    expect(dto.manager.name).toBe('Manager Name');
  });
});
