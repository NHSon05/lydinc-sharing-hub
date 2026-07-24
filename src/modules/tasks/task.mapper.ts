import type { Task, Project, User } from '@/generated/prisma/client';

export type PrismaTaskWithRelations = Task & {
  project: Project;
  assignee: User;
  createdBy: User;
};

export function toTaskDTO(task: PrismaTaskWithRelations) {
  const now = new Date();
  const isOverdue =
    task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && task.dueDate < now;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    progress: task.progress,
    startDate: task.startDate ? task.startDate.toISOString() : null,
    dueDate: task.dueDate.toISOString(),
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    result: task.result,
    isOverdue,
    project: {
      id: task.project.id,
      code: task.project.code,
      name: task.project.name,
    },
    assignee: {
      id: task.assignee.id,
      name: task.assignee.name,
      email: task.assignee.email,
    },
    createdBy: {
      id: task.createdBy.id,
      name: task.createdBy.name,
    },
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
