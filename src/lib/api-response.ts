import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { AppError } from '@/lib/errors';

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]> | Record<string, unknown> | null;
  };
};

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Handle AppError domain exceptions
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: null,
        },
      },
      { status: error.statusCode },
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedDetails: Record<string, string[]> = {};

    for (const issue of error.issues) {
      const fieldPath = issue.path.join('.') || 'body';
      if (!formattedDetails[fieldPath]) {
        formattedDetails[fieldPath] = [];
      }
      formattedDetails[fieldPath].push(issue.message);
    }

    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dữ liệu đầu vào không hợp lệ.',
          details: formattedDetails,
        },
      },
      { status: 400 },
    );
  }

  // Fallback for unexpected internal server errors
  console.error('Unhandled API Error:', error);

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
        details: null,
      },
    },
    { status: 500 },
  );
}

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      data,
      ...(message ? { message } : {}),
    },
    { status },
  );
}

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  },
  status = 200,
) {
  return NextResponse.json(
    {
      data,
      pagination,
    },
    { status },
  );
}
