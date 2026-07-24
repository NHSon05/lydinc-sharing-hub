import { auth } from '@/auth';
import { handleApiError, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import { updateUserStatus } from '@/modules/users/user.service';

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

    const updatedUser = await updateUserStatus({
      actor: session.user,
      id: userId,
      input: body,
    });

    return successResponse(updatedUser, 'Cập nhật trạng thái tài khoản thành công.');
  } catch (error) {
    return handleApiError(error);
  }
}
