import { auth } from '@/auth';
import { handleApiError, paginatedResponse, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import { createDepartment, listDepartments } from '@/modules/departments/department.service';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const result = await listDepartments({
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

    const department = await createDepartment({
      actor: session.user,
      input: body,
    });

    return successResponse(department, 'Tạo phòng ban thành công.', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
