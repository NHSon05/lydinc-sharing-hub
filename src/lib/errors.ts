export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'INTERNAL_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Bạn cần đăng nhập để thực hiện thao tác này.') {
    super(message, 'AUTHENTICATION_REQUIRED', 401);
    this.name = 'AuthenticationError';
  }
}

export class AccountStatusError extends AppError {
  constructor(message: string = 'Tài khoản đã bị khóa hoặc ngừng hoạt động.') {
    super(message, 'ACCOUNT_NOT_ACTIVE', 403);
    this.name = 'AccountStatusError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Bạn không có quyền thực hiện thao tác này.') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Không tìm thấy dữ liệu yêu cầu.') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Dữ liệu bị trùng lặp hoặc đang được sử dụng.') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Dữ liệu không hợp lệ.') {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string = 'Vi phạm quy tắc nghiệp vụ.') {
    super(message, 'BUSINESS_RULE_VIOLATION', 422);
    this.name = 'BusinessRuleError';
  }
}
