import { auth } from '@/auth';
import { handleApiError, paginatedResponse, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import {
  addProjectMember,
  listProjectMembers,
} from '@/modules/project-members/project-member.service';

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
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const result = await listProjectMembers({
      actor: session.user,
      projectId,
      query,
    });

    return paginatedResponse(result.items, result.pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { projectId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const member = await addProjectMember({
      actor: session.user,
      projectId,
      input: body,
    });

    return successResponse(member, 'Thêm thành viên vào dự án thành công.', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
