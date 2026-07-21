# Kiến trúc hệ thống – LYDINC TaskHub

## 1. Quyết định kiến trúc

LYDINC TaskHub sử dụng kiến trúc:

> Next.js Modular Monolith

Frontend và backend nằm trong cùng một ứng dụng Next.js nhưng business logic được chia thành các module độc lập.

Hệ thống không sử dụng Express custom server trong giai đoạn MVP.

---

## 2. Công nghệ

- Framework: Next.js App Router
- Language: TypeScript
- UI: React
- Styling: Tailwind CSS
- Database: PostgreSQL
- ORM: Prisma ORM
- Validation: Zod
- Authentication: Auth.js
- Password hashing: bcryptjs
- Unit testing: Vitest
- End-to-end testing: Playwright
- Package manager: pnpm
- Local database: Docker Compose

---

## 3. Luồng xử lý tổng quát

```text
Browser
   ↓
Next.js Page / Client Component
   ↓
Route Handler hoặc Server Action
   ↓
Authentication
   ↓
Authorization Policy
   ↓
Validation Schema
   ↓
Service Layer
   ↓
Repository / Prisma
   ↓
PostgreSQL
```

## 4. Nguyên tắc kiến trúc

### 4.1. Sử dụng Modular Monolith

LYDINC TaskHub được xây dựng theo kiến trúc modular monolith.

Frontend, backend và business logic nằm trong cùng một ứng dụng Next.js nhưng được phân chia thành các module nghiệp vụ độc lập.

Các module chính gồm:

- Authentication
- Users
- Departments
- Projects
- Tasks
- Comments
- Activity Logs

Mỗi module phải có trách nhiệm rõ ràng và không được truy cập trực tiếp vào logic nội bộ của module khác khi không cần thiết.

---

### 4.2. Không sử dụng Express Custom Server

Dự án sử dụng Next.js App Router và Route Handlers để xử lý API.

Không sử dụng:

- Express custom server.
- Một ứng dụng Express chạy bên trong Next.js.
- Một backend Express riêng trong giai đoạn MVP.

Chỉ xem xét tách backend khi xuất hiện nhu cầu thực tế như:

- Ứng dụng mobile.
- Public API.
- Background worker lớn.
- WebSocket phức tạp.
- Nhiều nhóm phát triển độc lập.
- Frontend và backend cần scale riêng.

---

### 4.3. UI không được truy cập database trực tiếp

Client Component không được import hoặc sử dụng Prisma Client.

Không được viết:

```ts
'use client';

import { db } from '@/lib/db';
```

Client Component chỉ được:

- Gọi API.
- Gọi Server Action phù hợp.
- Nhận dữ liệu từ Server Component.
- Quản lý state giao diện.
- Xử lý sự kiện người dùng.

Prisma chỉ được sử dụng trong code chạy phía server.

---

### 4.4. Route Handler phải giữ ở mức đơn giản

Route Handler chỉ chịu trách nhiệm:

1. Đọc request.
2. Kiểm tra session.
3. Kiểm tra dữ liệu đầu vào.
4. Gọi service.
5. Chuyển kết quả thành HTTP response.
6. Chuyển lỗi thành HTTP status phù hợp.

Route Handler không được chứa:

- Business logic phức tạp.
- Truy vấn database dài.
- Quy tắc phân quyền chi tiết.
- Transaction nhiều bước.
- Logic tạo Activity Log.

Ví dụ luồng đúng:

```text
Route Handler
→ Authentication
→ Validation
→ Service
→ Repository
→ Database
```

---

### 4.5. Business logic phải nằm trong Service Layer

Business logic phải được đặt trong các file service.

Ví dụ:

```text
task.service.ts
project.service.ts
user.service.ts
department.service.ts
```

Service chịu trách nhiệm:

- Kiểm tra quy tắc nghiệp vụ.
- Kiểm tra quyền đối với resource.
- Điều phối nhiều repository.
- Khởi tạo transaction.
- Tạo Activity Log.
- Chuẩn hóa kết quả trả về.

Ví dụ các hàm service:

```ts
createTask();
updateTask();
changeTaskStatus();
addProjectMember();
removeProjectMember();
lockUser();
```

---

### 4.6. Database access phải được tách riêng

Các thao tác database nên được đặt trong repository.

Ví dụ:

```text
task.repository.ts
project.repository.ts
user.repository.ts
```

Repository chịu trách nhiệm:

- Truy vấn dữ liệu.
- Tạo bản ghi.
- Cập nhật bản ghi.
- Xóa bản ghi.
- Thực hiện các truy vấn lọc và phân trang.

Repository không quyết định:

- Người dùng có quyền hay không.
- Trạng thái nào được phép chuyển.
- Nhiệm vụ có hợp lệ về nghiệp vụ hay không.

Những quyết định này thuộc service hoặc policy.

---

### 4.7. Validation phải tách khỏi Business Rule

Zod được sử dụng để kiểm tra cấu trúc dữ liệu đầu vào.

Ví dụ:

```text
task.schema.ts
project.schema.ts
user.schema.ts
```

Zod kiểm tra:

- Trường bắt buộc.
- Kiểu dữ liệu.
- Độ dài chuỗi.
- Định dạng email.
- Giá trị enum.
- Khoảng giá trị của số.

Ví dụ:

```ts
progress: z.number().int().min(0).max(100);
```

Business rule vẫn phải được kiểm tra trong service.

Ví dụ:

- Zod kiểm tra progress từ 0 đến 100.
- Service kiểm tra MEMBER có quyền cập nhật progress hay không.
- Service kiểm tra task COMPLETED phải có progress bằng 100.

---

### 4.8. Authorization phải được kiểm tra phía server

Frontend có thể ẩn nút theo vai trò nhưng việc ẩn nút không được xem là một cơ chế bảo mật.

Mọi thao tác phải được kiểm tra lại ở server.

Không được tin tưởng các thông tin gửi từ frontend như:

- role
- actorId
- createdById
- currentUserId
- departmentId của người dùng hiện tại

Những thông tin này phải được lấy từ session hoặc database.

---

### 4.9. Thực hiện thay đổi nhỏ và có phạm vi

Mỗi thay đổi phải tập trung vào một yêu cầu cụ thể.

Không được:

- Refactor module không liên quan.
- Đổi tên hàng loạt file khi không cần thiết.
- Thay đổi authentication trong lúc làm module Tasks.
- Thay đổi database ngoài phạm vi yêu cầu.
- Cài thêm package chỉ để giải quyết một thao tác nhỏ.
- Viết trước chức năng chưa thuộc phạm vi hiện tại.

---

## 5. Cấu trúc thư mục

Cấu trúc dự án dự kiến:

```text
lydinc-taskhub/
├── docs/
│   ├── PRODUCT.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── API.md
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── my-tasks/
│   │   │   └── admin/
│   │   │
│   │   └── api/
│   │       ├── users/
│   │       ├── departments/
│   │       ├── projects/
│   │       ├── tasks/
│   │       ├── comments/
│   │       └── activity-logs/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── departments/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── comments/
│   │   └── activity-logs/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── tables/
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── env.ts
│   │   ├── errors.ts
│   │   └── permissions.ts
│   │
│   └── types/
│
├── tests/
│   ├── integration/
│   └── e2e/
│
├── AGENTS.md
├── prisma.config.ts
├── package.json
└── README.md
```

---

## 6. Cấu trúc module

Mỗi module nghiệp vụ nên có cấu trúc sau khi phù hợp:

```text
src/modules/tasks/
├── task.types.ts
├── task.schema.ts
├── task.policy.ts
├── task.repository.ts
├── task.service.ts
├── task.mapper.ts
└── task.test.ts
```

### 6.1. File Types

Ví dụ:

```text
task.types.ts
```

Chứa:

- Type nội bộ của module.
- Input type.
- Output type.
- Filter type.
- Pagination type.

Không sử dụng file types để chứa business logic.

---

### 6.2. File Schema

Ví dụ:

```text
task.schema.ts
```

Chứa Zod schema cho:

- Request body.
- Query parameters.
- Path parameters.
- Form input.

Ví dụ:

```ts
export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  projectId: z.string().min(1),
  assigneeId: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.coerce.date(),
});
```

---

### 6.3. File Policy

Ví dụ:

```text
task.policy.ts
```

Chứa các hàm kiểm tra quyền:

```ts
canCreateTask();
canUpdateTask();
canAssignTask();
canChangeTaskStatus();
canCompleteTask();
canDeleteTask();
```

Policy nhận người dùng hiện tại và resource cần kiểm tra.

Policy không truy cập trực tiếp vào giao diện.

---

### 6.4. File Repository

Ví dụ:

```text
task.repository.ts
```

Chứa các hàm truy cập database:

```ts
findTaskById();
findTasks();
createTaskRecord();
updateTaskRecord();
deleteTaskRecord();
```

Repository có thể nhận Prisma Transaction Client khi chạy trong transaction.

---

### 6.5. File Service

Ví dụ:

```text
task.service.ts
```

Chứa các use case chính:

```ts
createTask();
updateTask();
changeTaskStatus();
updateTaskProgress();
submitTaskResult();
```

Service kết hợp:

- Validation nghiệp vụ.
- Authorization.
- Repository.
- Transaction.
- Activity Log.

---

### 6.6. File Mapper

Ví dụ:

```text
task.mapper.ts
```

Mapper dùng để chuyển dữ liệu database thành dữ liệu trả về.

Mapper phải loại bỏ các trường nhạy cảm hoặc không cần thiết.

Ví dụ với User:

```ts
export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    departmentId: user.departmentId,
  };
}
```

Không trả về:

```text
passwordHash
```

---

### 6.7. File Test

Ví dụ:

```text
task.test.ts
```

Kiểm tra:

- Validation.
- Authorization.
- Business rule.
- Trạng thái hợp lệ.
- Trạng thái không hợp lệ.
- Error cases.
- Transaction behavior nếu cần.

---

## 7. Server Component và Client Component

### 7.1. Server Component

Ưu tiên Server Component khi:

- Đọc dữ liệu ban đầu.
- Render trang danh sách.
- Render trang chi tiết.
- Không cần browser API.
- Không cần event handler.
- Không cần local state.

Server Component có thể gọi service phía server.

---

### 7.2. Client Component

Chỉ sử dụng Client Component khi cần:

- `useState`.
- `useEffect`.
- Event click.
- Form tương tác.
- Modal.
- Dropdown.
- Toast.
- Browser API.
- Optimistic update.

Client Component phải có:

```ts
'use client';
```

Không thêm `"use client"` vào layout hoặc page nếu không thật sự cần.

---

### 7.3. Nguyên tắc phân chia

Ví dụ trang danh sách nhiệm vụ:

```text
Server Component
├── Đọc session
├── Gọi task service
├── Lấy dữ liệu ban đầu
└── Truyền dữ liệu xuống TaskTable

Client Component
├── Bộ lọc
├── Nút thao tác
├── Modal
└── Tương tác người dùng
```

---

## 8. Authentication

Hệ thống sử dụng Auth.js để quản lý authentication.

Người dùng đăng nhập bằng:

- Email.
- Mật khẩu.

Trong MVP không hỗ trợ:

- Đăng ký công khai.
- Google login.
- Quên mật khẩu.
- Xác thực hai bước.

---

### 8.1. Nội dung session

Session user dự kiến:

```ts
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  departmentId: string;
};
```

Không lưu trong session:

- passwordHash.
- Mật khẩu.
- Secret.
- Token không cần thiết.

---

### 8.2. Kiểm tra khi đăng nhập

Khi người dùng đăng nhập, hệ thống phải:

1. Chuẩn hóa email.
2. Tìm người dùng theo email.
3. Kiểm tra tài khoản tồn tại.
4. Kiểm tra trạng thái tài khoản.
5. So sánh mật khẩu với password hash.
6. Tạo session nếu hợp lệ.

Thông báo đăng nhập sai không được tiết lộ:

- Email có tồn tại hay không.
- Mật khẩu sai hay đúng.

Thông báo phù hợp:

```text
Email hoặc mật khẩu không chính xác.
```

---

### 8.3. Bảo vệ trang

Người chưa đăng nhập khi truy cập trang dashboard phải được chuyển về:

```text
/login
```

API yêu cầu đăng nhập phải trả:

```text
HTTP 401 Unauthorized
```

---

### 8.4. Tài khoản bị khóa

Tài khoản có trạng thái sau không được sử dụng hệ thống:

```text
INACTIVE
LOCKED
```

Việc session đã được tạo trước đó không đồng nghĩa người dùng luôn được tiếp tục truy cập.

Các thao tác quan trọng có thể kiểm tra lại trạng thái user trong database.

---

## 9. Authorization

Hệ thống sử dụng:

```text
RBAC + Resource-based authorization
```

### 9.1. Role-based Access Control

#### ADMIN

- Quản lý toàn hệ thống.
- Quản lý người dùng.
- Quản lý phòng ban.
- Xem toàn bộ dự án và nhiệm vụ.
- Thực hiện các thao tác quản trị.

#### MANAGER

- Quản lý dự án mình phụ trách.
- Thêm thành viên vào dự án.
- Tạo và giao nhiệm vụ.
- Duyệt nhiệm vụ hoàn thành.
- Xem dữ liệu dự án mình tham gia hoặc quản lý.

#### MEMBER

- Xem dự án mình tham gia.
- Xem nhiệm vụ liên quan.
- Cập nhật nhiệm vụ được giao.
- Gửi kết quả.
- Viết bình luận.

---

### 9.2. Resource-based Authorization

Ngoài role, hệ thống phải kiểm tra quan hệ giữa người dùng và resource.

Ví dụ:

- MANAGER chỉ sửa dự án có `managerId` bằng ID của mình.
- MEMBER chỉ cập nhật nhiệm vụ có `assigneeId` bằng ID của mình.
- Người dùng chỉ sửa bình luận có `authorId` bằng ID của mình.
- Người không thuộc dự án không được xem thông tin nội bộ của dự án.

---

### 9.3. Không tin dữ liệu quyền từ frontend

Không chấp nhận các field sau từ request để xác định quyền:

```text
role
actorId
createdById
currentUserId
isAdmin
isManager
```

Các giá trị này phải được lấy từ:

- Session.
- Database.
- Resource hiện tại.

---

### 9.4. Kiểm tra quyền ở nhiều lớp

Có thể ẩn nút ở UI để cải thiện trải nghiệm, nhưng quyền vẫn phải được kiểm tra trong service.

Luồng:

```text
UI ẩn nút
→ Route kiểm tra session
→ Service kiểm tra quyền thật
→ Database thực hiện thao tác
```

---

## 10. Error Handling

Hệ thống sử dụng các class lỗi nghiệp vụ riêng.

Ví dụ:

```ts
AppError;
AuthenticationError;
AuthorizationError;
ValidationError;
NotFoundError;
ConflictError;
BusinessRuleError;
```

---

### 10.1. Ánh xạ lỗi sang HTTP status

```text
ValidationError       → 400 Bad Request
AuthenticationError   → 401 Unauthorized
AuthorizationError    → 403 Forbidden
NotFoundError         → 404 Not Found
ConflictError         → 409 Conflict
BusinessRuleError     → 422 Unprocessable Entity
UnknownError          → 500 Internal Server Error
```

---

### 10.2. Cấu trúc lỗi API

```json
{
  "error": {
    "code": "INVALID_TASK_STATUS_TRANSITION",
    "message": "Không thể chuyển nhiệm vụ sang trạng thái yêu cầu.",
    "details": null
  }
}
```

Không trả cho client:

- Stack trace.
- Raw Prisma error.
- Database connection string.
- SQL query.
- Secret.
- Internal file path trong production.

---

### 10.3. Logging lỗi

Server có thể ghi log kỹ thuật nhưng không được ghi:

- Mật khẩu.
- Password hash.
- Session token.
- Access token.
- Secret.
- Nội dung nhạy cảm không cần thiết.

---

## 11. Database Transaction

Transaction được sử dụng khi một nghiệp vụ thay đổi nhiều bảng và các thay đổi phải thành công hoặc thất bại cùng nhau.

---

### 11.1. Tạo nhiệm vụ

Một transaction có thể gồm:

1. Tạo Task.
2. Tạo ActivityLog.
3. Commit.

Nếu tạo ActivityLog thất bại, Task không được lưu riêng lẻ.

---

### 11.2. Thay đổi trạng thái nhiệm vụ

Một transaction có thể gồm:

1. Đọc Task hiện tại.
2. Kiểm tra trạng thái.
3. Cập nhật Task.
4. Thiết lập `completedAt` nếu cần.
5. Tạo ActivityLog.
6. Commit.

---

### 11.3. Thêm thành viên dự án

Một transaction có thể gồm:

1. Kiểm tra Project.
2. Kiểm tra User.
3. Kiểm tra thành viên đã tồn tại.
4. Tạo ProjectMember.
5. Tạo ActivityLog.
6. Commit.

---

### 11.4. Nguyên tắc transaction

- Không giữ transaction mở lâu.
- Không gọi API bên ngoài bên trong transaction khi không cần thiết.
- Không thực hiện thao tác giao diện trong transaction.
- Chỉ đặt các thao tác database liên quan vào cùng transaction.
- Xử lý lỗi và rollback đầy đủ.

---

## 12. Activity Log

Activity Log được sử dụng để ghi lại những thay đổi quan trọng.

Activity Log phải được tạo ở service layer.

Frontend không được gửi trực tiếp Activity Log hoàn chỉnh lên server.

---

### 12.1. Những thao tác cần ghi log

- Tạo người dùng.
- Thay đổi role.
- Khóa hoặc mở tài khoản.
- Tạo phòng ban.
- Chỉnh sửa phòng ban.
- Tạo dự án.
- Chỉnh sửa dự án.
- Thay đổi trạng thái dự án.
- Thêm thành viên dự án.
- Xóa thành viên dự án.
- Tạo nhiệm vụ.
- Thay đổi người phụ trách.
- Thay đổi deadline.
- Thay đổi trạng thái nhiệm vụ.
- Xác nhận hoàn thành nhiệm vụ.

---

### 12.2. Cấu trúc Activity Log

Ví dụ:

```json
{
  "action": "TASK_STATUS_CHANGED",
  "entityType": "TASK",
  "entityId": "task-id",
  "oldValue": {
    "status": "IN_PROGRESS"
  },
  "newValue": {
    "status": "REVIEW"
  },
  "metadata": {
    "projectId": "project-id"
  },
  "actorId": "user-id"
}
```

---

### 12.3. Quy tắc bảo vệ Activity Log

- Người dùng không được sửa Activity Log.
- Người dùng không được xóa Activity Log.
- Không lưu mật khẩu hoặc token trong Activity Log.
- `actorId` có thể null đối với thao tác do hệ thống thực hiện.
- Log phải được giữ ngay cả khi actor không còn tồn tại.

---

## 13. Môi trường

Hệ thống có ba môi trường chính:

```text
Development
Test
Production
```

---

### 13.1. Development

Development sử dụng:

- Next.js local development server.
- PostgreSQL chạy bằng Docker.
- Seed data mẫu.
- Prisma Studio.
- Tài khoản local.

Các tài khoản mẫu chỉ được dùng trong development.

---

### 13.2. Test

Test phải sử dụng database riêng.

Không được dùng chung database test với:

- Development.
- Staging.
- Production.

Database test có thể được reset giữa các test hoặc test suite.

---

### 13.3. Production

Production phải:

- Dùng database riêng.
- Dùng mật khẩu mạnh.
- Dùng secret production.
- Không sử dụng tài khoản mẫu.
- Không chạy development seed.
- Chạy migration bằng `prisma migrate deploy`.
- Có backup trước migration quan trọng.
- Không hiển thị stack trace cho người dùng.

---

### 13.4. Biến môi trường

Các biến môi trường phải được lưu trong:

```text
.env
.env.local
```

Không commit các file chứa secret.

File được commit chỉ là:

```text
.env.example
```

Ví dụ:

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
```

---

## 14. Quy tắc Dependency

Không được tự ý cài thêm package khi chưa có lý do rõ ràng.

Trước khi thêm dependency mới, cần trả lời:

1. Package giải quyết vấn đề gì?
2. Có thể dùng stack hiện tại không?
3. Package có đang được duy trì không?
4. Package có gây rủi ro bảo mật không?
5. Package làm tăng kích thước build bao nhiêu?
6. Có alternative nào đơn giản hơn không?

---

### 14.1. Không cài package cho thao tác quá nhỏ

Không nên cài package chỉ để:

- Format một chuỗi đơn giản.
- Kiểm tra một điều kiện nhỏ.
- Thực hiện một phép tính dễ viết.
- Tạo một utility vài dòng.

---

### 14.2. Dependency hiện tại

Stack dự kiến:

```text
next
react
react-dom
typescript
tailwindcss
prisma
@prisma/client
@prisma/adapter-pg
pg
zod
next-auth
bcryptjs
vitest
playwright
```

Mọi package ngoài danh sách trên phải được xem xét trước khi cài.

---

### 14.3. Không tự động cập nhật major version

Không tự ý nâng major version của:

- Next.js.
- React.
- Prisma.
- Auth.js.
- TypeScript.

Việc nâng major version phải được thực hiện trong một nhiệm vụ riêng và có kiểm thử đầy đủ.

---

## 15. Hướng mở rộng

Kiến trúc modular monolith được sử dụng trong MVP nhưng phải được tổ chức để có thể mở rộng.

---

### 15.1. Khi cần Background Worker

Nếu xuất hiện các tác vụ như:

- Gửi email hàng loạt.
- Xuất báo cáo lớn.
- Xử lý file.
- Đồng bộ hệ thống bên ngoài.
- Chạy công việc định kỳ.

Có thể bổ sung worker riêng:

```text
Next.js Application
├── UI
├── API
└── Services

Worker
├── Email jobs
├── Report jobs
└── Synchronization jobs
```

---

### 15.2. Khi cần Backend riêng

Có thể chuyển sang monorepo:

```text
apps/
├── web
├── api
└── worker

packages/
├── database
├── validation
├── domain
└── shared
```

Chỉ tách backend khi có ít nhất một nhu cầu rõ ràng:

- Mobile app.
- Public API cho đối tác.
- Frontend và backend deploy độc lập.
- Nhiều nhóm phát triển.
- Backend cần scale riêng.
- Real-time phức tạp.
- Nhiều hệ thống sử dụng chung API.

---

### 15.3. Nguyên tắc khi tách hệ thống

Nếu tách backend trong tương lai:

- Service phải ít phụ thuộc vào Next.js.
- Validation schema phải có thể tái sử dụng.
- Business rule phải nằm trong module.
- Không đặt business logic trong UI.
- Không đặt business logic trong Route Handler.
- Database access phải được tách rõ ràng.
