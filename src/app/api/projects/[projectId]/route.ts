import { auth } from '@/auth';
import { handleApiError, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import {
  deleteProjectService,
  getProject,
  updateProjectService,
} from '@/modules/projects/project.service';

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { projectId } = await context.params;

    const project = await getProject({
      actor: session.user,
      id: projectId,
    });

    return successResponse(project);
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

    const { projectId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const updated = await updateProjectService({
      actor: session.user,
      id: projectId,
      input: body,
    });

    return successResponse(updated, 'Cập nhật dự án thành công.');
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

    const { projectId } = await context.params;

    const result = await deleteProjectService({
      actor: session.user,
      id: projectId,
    });

    return successResponse(result, 'Xóa dự án thành công.');
  } catch (error) {
    return handleApiError(error);
  }
}
