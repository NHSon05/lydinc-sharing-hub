import { auth } from '@/auth';
import { handleApiError, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import { changeOwnPassword, resetUserPassword } from '@/modules/users/user.service';

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { userId } = await context.params;
    const body = await request.json().catch(() => ({}));

    if (body.currentPassword) {
      const result = await changeOwnPassword({
        actor: session.user,
        id: userId,
        input: body,
      });
      return successResponse(null, result.message);
    }

    const result = await resetUserPassword({
      actor: session.user,
      id: userId,
      input: body,
    });
    return successResponse(null, result.message);
  } catch (error) {
    return handleApiError(error);
  }
}
