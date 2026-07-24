import { auth } from '@/auth';
import { handleApiError, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import { listMemberCandidates } from '@/modules/project-members/project-member.service';

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
    const search = searchParams.get('search') || undefined;

    const candidates = await listMemberCandidates({
      actor: session.user,
      projectId,
      search,
    });

    return successResponse(candidates);
  } catch (error) {
    return handleApiError(error);
  }
}
