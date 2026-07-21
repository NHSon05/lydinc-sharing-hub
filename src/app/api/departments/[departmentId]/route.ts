import { auth } from '@/auth';
import { handleApiError, successResponse } from '@/lib/api-response';
import { AuthenticationError } from '@/lib/errors';
import {
  deleteDepartment,
  getDepartment,
  updateDepartment,
} from '@/modules/departments/department.service';

type RouteContext = {
  params: Promise<{
    departmentId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { departmentId } = await context.params;

    const department = await getDepartment({
      actor: session.user,
      id: departmentId,
      includeCounts: true,
    });

    return successResponse(department);
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

    const { departmentId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const updatedDepartment = await updateDepartment({
      actor: session.user,
      id: departmentId,
      input: body,
    });

    return successResponse(updatedDepartment, 'Cập nhật phòng ban thành công.');
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

    const { departmentId } = await context.params;

    const result = await deleteDepartment({
      actor: session.user,
      id: departmentId,
    });

    return successResponse(result, 'Xóa phòng ban thành công.');
  } catch (error) {
    return handleApiError(error);
  }
}
