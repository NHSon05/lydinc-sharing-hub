import { auth } from '@/auth';
import { handleApiError, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import { changeTaskAssignee } from '@/modules/tasks/task.service';

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { taskId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const updated = await changeTaskAssignee({
      actor: session.user,
      id: taskId,
      input: body,
    });

    return successResponse(updated, 'Cập nhật người thực hiện thành công.');
  } catch (error) {
    return handleApiError(error);
  }
}
