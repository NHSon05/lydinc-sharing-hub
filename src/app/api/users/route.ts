import { auth } from '@/auth';
import { handleApiError, paginatedResponse, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import { createUser, listUsers } from '@/modules/users/user.service';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const result = await listUsers({
      actor: session.user,
      query,
    });

    return paginatedResponse(result.items, result.pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const body = await request.json().catch(() => ({}));

    const user = await createUser({
      actor: session.user,
      input: body,
    });

    return successResponse(user, 'Tạo người dùng thành công.', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
