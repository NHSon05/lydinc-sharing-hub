import type { Project, Department, User, ProjectMember, Task } from '@/generated/prisma/client';

export type PrismaProjectWithRelations = Project & {
  department: Department;
  manager: User;
  createdBy: User;
  members: ProjectMember[];
  tasks: Task[];
};

export function toProjectDTO(project: PrismaProjectWithRelations) {
  const totalTasks = project.tasks.length;
  const todoTasks = project.tasks.filter((t) => t.status === 'TODO').length;
  const inProgressTasks = project.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const reviewTasks = project.tasks.filter((t) => t.status === 'REVIEW').length;
  const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
  const cancelledTasks = project.tasks.filter((t) => t.status === 'CANCELLED').length;

  const now = new Date();
  const overdueTasks = project.tasks.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.dueDate < now
  ).length;

  return {
    id: project.id,
    code: project.code,
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: project.startDate.toISOString(),
    endDate: project.endDate.toISOString(),
    department: {
      id: project.department.id,
      name: project.department.name,
    },
    manager: {
      id: project.manager.id,
      name: project.manager.name,
      email: project.manager.email,
    },
    createdBy: {
      id: project.createdBy.id,
      name: project.createdBy.name,
    },
    taskSummary: {
      total: totalTasks,
      todo: todoTasks,
      inProgress: inProgressTasks,
      review: reviewTasks,
      completed: completedTasks,
      cancelled: cancelledTasks,
      overdue: overdueTasks,
    },
    memberCount: project.members.length,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
