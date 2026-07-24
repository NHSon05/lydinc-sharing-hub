import { auth } from '@/auth';
import { handleApiError, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import { deleteTask, getTask, updateTask } from '@/modules/tasks/task.service';

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { taskId } = await context.params;

    const task = await getTask({
      actor: session.user,
      id: taskId,
    });

    return successResponse(task);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { taskId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const updated = await updateTask({
      actor: session.user,
      id: taskId,
      input: body,
    });

    return successResponse(updated, 'Cập nhật nhiệm vụ thành công.');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { taskId } = await context.params;

    const result = await deleteTask({
      actor: session.user,
      id: taskId,
    });

    return successResponse(result, 'Xóa nhiệm vụ thành công.');
  } catch (error) {
    return handleApiError(error);
  }
}
