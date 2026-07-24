Đọc AGENTS.md và toàn bộ tài liệu trong thư mục docs trước khi sửa code.

Mục tiêu:
Triển khai hoàn chỉnh module Departments cho LYDINC TaskHub.

Phạm vi API:

- GET /api/departments
- POST /api/departments
- GET /api/departments/:departmentId
- PATCH /api/departments/:departmentId
- DELETE /api/departments/:departmentId

Quyền:

- Người dùng ACTIVE đã đăng nhập được xem danh sách và chi tiết.
- Chỉ ADMIN được tạo, cập nhật và xóa phòng ban.

Business rules:

- Tên phòng ban bắt buộc, được trim và không được trùng.
- Không được xóa phòng ban còn người dùng.
- Không được xóa phòng ban còn dự án.
- Tạo Activity Log khi tạo, cập nhật hoặc xóa thành công.
- Không nhận actorId từ frontend.
- actorId phải lấy từ session.

Kiến trúc:

- Route Handler phải mỏng.
- Validation dùng Zod.
- Authorization đặt ở policy hoặc service.
- Business logic đặt trong service.
- Database access đặt trong repository.
- Không gọi Prisma từ Client Component.
- Sử dụng transaction khi ghi Department và ActivityLog.

Trước khi code:

1. Kiểm tra schema Prisma hiện tại.
2. Kiểm tra cách Authentication và session đã được triển khai.
3. Kiểm tra hệ thống AppError và API response.
4. Đề xuất kế hoạch.
5. Liệt kê file sẽ tạo hoặc sửa.
6. Không cài package mới nếu không cần thiết.

Sau khi hoàn thành:

- Viết test cho validation, authorization và business rules.
- Chạy pnpm lint.
- Chạy pnpm exec tsc --noEmit.
- Chạy pnpm test.
- Chạy pnpm build.
- Báo cáo file đã thay đổi và các vấn đề chưa xác minh.
