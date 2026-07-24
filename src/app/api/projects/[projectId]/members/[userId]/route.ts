import { auth } from '@/auth';
import { handleApiError, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import {
  removeProjectMember,
  updateProjectMemberRole,
} from '@/modules/project-members/project-member.service';

type RouteContext = {
  params: Promise<{
    projectId: string;
    userId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { projectId, userId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const member = await updateProjectMemberRole({
      actor: session.user,
      projectId,
      userId,
      input: body,
    });

    return successResponse(member, 'Cập nhật vai trò thành viên thành công.');
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

    const { projectId, userId } = await context.params;

    const result = await removeProjectMember({
      actor: session.user,
      projectId,
      userId,
    });

    return successResponse(result, 'Xóa thành viên khỏi dự án thành công.');
  } catch (error) {
    return handleApiError(error);
  }
}
