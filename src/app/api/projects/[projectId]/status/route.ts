import { auth } from '@/auth';
import { handleApiError, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import { changeProjectStatus } from '@/modules/projects/project.service';

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { projectId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const updated = await changeProjectStatus({
      actor: session.user,
      id: projectId,
      input: body,
    });

    return successResponse(updated, 'Cập nhật trạng thái dự án thành công.');
  } catch (error) {
    return handleApiError(error);
  }
}
