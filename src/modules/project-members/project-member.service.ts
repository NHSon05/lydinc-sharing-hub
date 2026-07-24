import { db } from '@/lib/db';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors';
import type { SessionUser } from '@/modules/auth/auth.types';
import { ProjectMemberRole } from '@/generated/prisma/client';
import {
  assertCanAddProjectMember,
  assertCanRemoveProjectMember,
  assertCanUpdateProjectMember,
  assertCanViewProjectMembers,
} from './project-member.policy';
import {
  addProjectMemberSchema,
  updateProjectMemberRoleSchema,
  projectMemberListQuerySchema,
  type AddProjectMemberInput,
  type UpdateProjectMemberRoleInput,
} from './project-member.schema';
import type { ProjectMemberDTO, MemberCandidateDTO } from './project-member.types';
import {
  createProjectMember,
  deleteProjectMember,
  findMemberCandidates,
  findProjectMember,
  findProjectMembers,
  updateProjectMemberRole as updateProjectMemberRoleRepo,
  countProjectManagers,
  findUserActiveTasks,
} from './project-member.repository';

function toProjectMemberDTO(member: {
  id: string;
  role: ProjectMemberRole;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    department: { id: string; name: string };
  };
}): ProjectMemberDTO {
  return {
    id: member.id,
    role: member.role,
    joinedAt: member.joinedAt.toISOString(),
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.user.role as ProjectMemberDTO['user']['role'],
      status: member.user.status as ProjectMemberDTO['user']['status'],
      department: {
        id: member.user.department.id,
        name: member.user.department.name,
      },
    },
  };
}

export async function listProjectMembers({
  actor,
  projectId,
  query,
}: {
  actor: SessionUser;
  projectId: string;
  query?: unknown;
}) {
  // Load project context for auth
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { managerId: true, members: { select: { userId: true } } },
  });
  if (!project) {
    throw new NotFoundError('Dự án không tồn tại.');
  }

  assertCanViewProjectMembers(actor, project);

  const validated = projectMemberListQuerySchema.parse(query ?? {});
  const { items, totalItems } = await findProjectMembers(projectId, validated);
  const totalPages = Math.ceil(totalItems / validated.pageSize) || 1;

  return {
    items: items.map(toProjectMemberDTO),
    pagination: {
      page: validated.page,
      pageSize: validated.pageSize,
      totalItems,
      totalPages,
    },
  };
}

export async function addProjectMember({
  actor,
  projectId,
  input,
}: {
  actor: SessionUser;
  projectId: string;
  input: unknown;
}) {
  // Load project context
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { managerId: true, members: { select: { userId: true } } },
  });
  if (!project) {
    throw new NotFoundError('Dự án không tồn tại.');
  }

  assertCanAddProjectMember(actor, project);
  const validated: AddProjectMemberInput = addProjectMemberSchema.parse(input);

  // Validate user exists
  const user = await db.user.findUnique({
    where: { id: validated.userId },
  });
  if (!user) {
    throw new NotFoundError('Người dùng không tồn tại.');
  }
  if (user.status !== 'ACTIVE') {
    throw new ValidationError('Tài khoản được chọn hiện không hoạt động.');
  }

  // Check not already a member
  const existingMember = await findProjectMember(projectId, validated.userId);
  if (existingMember) {
    throw new ConflictError('Người dùng này đã là thành viên của dự án.');
  }

  return db.$transaction(async (tx) => {
    const member = await createProjectMember(
      {
        projectId,
        userId: validated.userId,
        role: validated.role,
      },
      tx
    );

    await tx.activityLog.create({
      data: {
        action: 'PROJECT_MEMBER_ADDED',
        entityType: 'PROJECT_MEMBER',
        entityId: member.id,
        metadata: {
          projectId,
          userId: validated.userId,
          role: validated.role,
        },
        actorId: actor.id,
      },
    });

    return toProjectMemberDTO(member);
  });
}

export async function updateProjectMemberRole({
  actor,
  projectId,
  userId,
  input,
}: {
  actor: SessionUser;
  projectId: string;
  userId: string;
  input: unknown;
}) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { managerId: true, members: { select: { userId: true } } },
  });
  if (!project) {
    throw new NotFoundError('Dự án không tồn tại.');
  }

  assertCanUpdateProjectMember(actor, project);
  const validated: UpdateProjectMemberRoleInput = updateProjectMemberRoleSchema.parse(input);

  const member = await findProjectMember(projectId, userId);
  if (!member) {
    throw new NotFoundError('Thành viên không còn tồn tại trong dự án.');
  }

  // Cannot remove the last manager
  if (member.role === 'OWNER' || member.role === 'MANAGER') {
    const otherManagers = await countProjectManagers(projectId);
    if (otherManagers <= 1 && validated.role !== 'OWNER' && validated.role !== 'MANAGER') {
      throw new ValidationError('Dự án phải có ít nhất một người quản lý.');
    }
  }

  return db.$transaction(async (tx) => {
    const updated = await updateProjectMemberRoleRepo(projectId, userId, validated.role, tx);

    // If downgrading the main project manager, update Project.managerId
    // Note: managerId is required on the Project model, so we only check
    // if we need to warn about it. Actual reassignment must be explicit.
    if (project.managerId === userId && validated.role !== 'OWNER' && validated.role !== 'MANAGER') {
      // Let the caller know but don't nullify - Project requires a manager
      throw new ValidationError('Không thể hạ quyền người quản lý chính của dự án. Vui lòng chuyển quyền quản lý trước.');
    }

    await tx.activityLog.create({
      data: {
        action: 'PROJECT_MEMBER_ROLE_CHANGED',
        entityType: 'PROJECT_MEMBER',
        entityId: member.id,
        oldValue: { role: member.role },
        newValue: { role: validated.role },
        metadata: { projectId },
        actorId: actor.id,
      },
    });

    return toProjectMemberDTO(updated);
  });
}

export async function removeProjectMember({
  actor,
  projectId,
  userId,
}: {
  actor: SessionUser;
  projectId: string;
  userId: string;
}) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { managerId: true, members: { select: { userId: true } } },
  });
  if (!project) {
    throw new NotFoundError('Dự án không tồn tại.');
  }

  assertCanRemoveProjectMember(actor, project);

  const member = await findProjectMember(projectId, userId);
  if (!member) {
    throw new NotFoundError('Thành viên không còn tồn tại trong dự án.');
  }

  // Check if user is the project manager
  if (project.managerId === userId) {
    throw new ValidationError('Không thể xóa người quản lý dự án. Hãy chuyển quyền quản lý trước.');
  }

  // Check for active tasks
  const activeTaskCount = await findUserActiveTasks(projectId, userId);
  if (activeTaskCount > 0) {
    throw new ValidationError(
      `Không thể xóa thành viên vì người này vẫn đang phụ trách ${activeTaskCount} nhiệm vụ.`
    );
  }

  return db.$transaction(async (tx) => {
    await deleteProjectMember(projectId, userId, tx);

    await tx.activityLog.create({
      data: {
        action: 'PROJECT_MEMBER_REMOVED',
        entityType: 'PROJECT_MEMBER',
        entityId: member.id,
        metadata: {
          projectId,
          userId,
          role: member.role,
        },
        actorId: actor.id,
      },
    });

    return {
      success: true,
      message: 'Xóa thành viên khỏi dự án thành công.',
    };
  });
}

export async function listMemberCandidates({
  actor,
  projectId,
  search,
}: {
  actor: SessionUser;
  projectId: string;
  search?: string;
}) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { managerId: true, members: { select: { userId: true } } },
  });
  if (!project) {
    throw new NotFoundError('Dự án không tồn tại.');
  }

  assertCanAddProjectMember(actor, project);

  const candidates = await findMemberCandidates(projectId, search);

  return candidates.map(
    (u): MemberCandidateDTO => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as MemberCandidateDTO['role'],
      department: u.department,
    })
  );
}
