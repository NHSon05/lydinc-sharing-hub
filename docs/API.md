# API Specification – LYDINC TaskHub

## 1. Mục đích tài liệu

Tài liệu này quy định cách frontend, Server Components, Server Actions và các hệ thống bên ngoài giao tiếp với backend của LYDINC TaskHub.

Tài liệu mô tả:

- Cấu trúc endpoint.
- Quy tắc xác thực.
- Quy tắc phân quyền.
- Request body.
- Query parameters.
- Response body.
- HTTP status code.
- Error code.
- Quy tắc phân trang.
- Quy tắc lọc dữ liệu.
- Các quy tắc bảo mật API.

API được triển khai bằng Next.js Route Handlers trong thư mục:

```text
src/app/api/
```

---

## 2. Phạm vi API

API của phiên bản MVP gồm các module:

1. Authentication
2. Users
3. Departments
4. Projects
5. Project Members
6. Tasks
7. Comments
8. Activity Logs
9. Dashboard

Các chức năng chưa thuộc phạm vi MVP:

- Public API cho đối tác.
- API mobile riêng.
- WebSocket.
- Thông báo thời gian thực.
- Upload file trực tiếp.
- Google Drive integration.
- Google Calendar integration.
- Payroll.
- Attendance.
- AI analysis.

---

## 3. Base URL

Trong môi trường local:

```text
http://localhost:3000/api
```

Trong tài liệu này, endpoint được viết với tiền tố:

```text
/api
```

Ví dụ:

```http
GET /api/projects
```

---

## 4. Định dạng dữ liệu

API sử dụng JSON.

Request header:

```http
Content-Type: application/json
```

Response header:

```http
Content-Type: application/json
```

Ngày giờ phải sử dụng định dạng ISO 8601.

Ví dụ:

```text
2026-08-10T08:30:00.000Z
```

Frontend không gửi ngày theo dạng:

```text
10/08/2026
```

---

## 5. Quy ước đặt tên

### 5.1. URL

URL sử dụng:

- Chữ thường.
- Danh từ số nhiều.
- Dấu gạch ngang nếu có nhiều từ.

Ví dụ:

```text
/api/users
/api/departments
/api/projects
/api/project-members
/api/activity-logs
```

Không sử dụng:

```text
/api/getUsers
/api/createProject
/api/TaskList
```

### 5.2. JSON fields

JSON field sử dụng camelCase.

Ví dụ:

```json
{
  "departmentId": "department-id",
  "createdAt": "2026-08-10T08:30:00.000Z"
}
```

### 5.3. Enum

Enum sử dụng chữ in hoa và dấu gạch dưới.

Ví dụ:

```text
IN_PROGRESS
ON_HOLD
```

---

## 6. Xác thực

Hệ thống sử dụng Auth.js với Credentials Provider.

Người dùng đăng nhập bằng:

- Email.
- Mật khẩu.

Phiên bản MVP không hỗ trợ:

- Đăng ký công khai.
- Đăng nhập Google.
- Quên mật khẩu.
- Xác thực hai bước.

### 6.1. Session user

Thông tin người dùng trong session dự kiến:

```ts
type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  departmentId: string;
};
```

Không lưu trong session:

- Mật khẩu.
- `passwordHash`.
- Database URL.
- Secret.
- Dữ liệu nội bộ không cần thiết.

### 6.2. API yêu cầu đăng nhập

Nếu endpoint yêu cầu đăng nhập nhưng không có session hợp lệ, API trả:

```http
401 Unauthorized
```

Response:

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Bạn cần đăng nhập để thực hiện thao tác này.",
    "details": null
  }
}
```

### 6.3. Tài khoản không hoạt động

Tài khoản có trạng thái sau không được sử dụng hệ thống:

```text
INACTIVE
LOCKED
```

Response có thể là:

```http
403 Forbidden
```

```json
{
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Tài khoản hiện đang bị khóa.",
    "details": null
  }
}
```

---

## 7. Phân quyền

Hệ thống sử dụng:

```text
RBAC + Resource-based authorization
```

### 7.1. ADMIN

ADMIN có thể:

- Quản lý toàn bộ người dùng.
- Quản lý phòng ban.
- Xem toàn bộ dự án.
- Xem toàn bộ nhiệm vụ.
- Quản lý dữ liệu toàn hệ thống.

### 7.2. MANAGER

MANAGER có thể:

- Xem dự án mình quản lý hoặc tham gia.
- Tạo dự án theo phạm vi được cho phép.
- Quản lý dự án mình phụ trách.
- Thêm thành viên vào dự án.
- Tạo và giao nhiệm vụ.
- Xác nhận nhiệm vụ hoàn thành.

### 7.3. MEMBER

MEMBER có thể:

- Xem dự án mình tham gia.
- Xem nhiệm vụ liên quan.
- Cập nhật nhiệm vụ được giao.
- Gửi kết quả.
- Viết bình luận.

### 7.4. Quy tắc bắt buộc

Frontend có thể ẩn nút theo quyền nhưng backend vẫn phải kiểm tra lại.

Không chấp nhận các field sau từ request để xác định quyền:

```text
actorId
createdById
currentUserId
isAdmin
isManager
currentRole
```

Các giá trị này phải được lấy từ session.

---

## 8. Cấu trúc response chung

### 8.1. Response thành công

```json
{
  "data": {},
  "message": "Thao tác thành công."
}
```

Field `message` có thể được bỏ qua nếu không cần thiết.

### 8.2. Response danh sách

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

### 8.3. Response lỗi

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ.",
    "details": {
      "email": ["Email không đúng định dạng."]
    }
  }
}
```

### 8.4. Response không có nội dung

Một số thao tác có thể trả:

```http
204 No Content
```

Khi trả `204`, response không có body.

---

## 9. HTTP status codes

| Status | Ý nghĩa                            |
| ------ | ---------------------------------- |
| 200    | Thao tác thành công                |
| 201    | Tạo mới thành công                 |
| 204    | Thành công, không có response body |
| 400    | Request không hợp lệ               |
| 401    | Chưa đăng nhập                     |
| 403    | Không có quyền                     |
| 404    | Không tìm thấy dữ liệu             |
| 409    | Xung đột dữ liệu                   |
| 422    | Vi phạm quy tắc nghiệp vụ          |
| 429    | Gửi quá nhiều request              |
| 500    | Lỗi hệ thống                       |

---

## 10. Phân trang

Các endpoint danh sách sử dụng query parameters:

```text
page
pageSize
```

Giá trị mặc định:

```text
page = 1
pageSize = 20
```

Giới hạn đề xuất:

```text
pageSize tối đa = 100
```

Ví dụ:

```http
GET /api/tasks?page=2&pageSize=20
```

Response:

```json
{
  "data": [],
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "totalItems": 55,
    "totalPages": 3
  }
}
```

Nếu `page` hoặc `pageSize` không hợp lệ, API trả:

```http
400 Bad Request
```

---

## 11. Sắp xếp dữ liệu

Các endpoint danh sách có thể hỗ trợ:

```text
sortBy
sortOrder
```

Giá trị `sortOrder`:

```text
asc
desc
```

Ví dụ:

```http
GET /api/tasks?sortBy=dueDate&sortOrder=asc
```

Chỉ cho phép sắp xếp theo danh sách field đã được backend khai báo.

Không truyền trực tiếp tên cột vào câu SQL.

---

## 12. Tìm kiếm và lọc

### 12.1. Tìm kiếm

Query parameter:

```text
search
```

Ví dụ:

```http
GET /api/projects?search=ANGC
```

### 12.2. Giá trị rỗng

Nếu query parameter rỗng, backend nên bỏ qua filter đó.

Ví dụ:

```http
GET /api/tasks?status=
```

được hiểu tương đương:

```http
GET /api/tasks
```

### 12.3. Boolean query

Boolean được gửi dưới dạng chuỗi:

```text
true
false
```

Ví dụ:

```http
GET /api/tasks?overdue=true
```

---

# 13. Authentication API

Auth.js quản lý các endpoint authentication.

## 13.1. Đăng nhập

```http
POST /api/auth/callback/credentials
```

Dữ liệu logic:

```json
{
  "email": "admin@lydinc.local",
  "password": "Admin@123"
}
```

Quy tắc:

- Chuẩn hóa email trước khi tìm kiếm.
- Email và mật khẩu là bắt buộc.
- Mật khẩu được so sánh bằng hash.
- Tài khoản phải có trạng thái `ACTIVE`.
- Không tiết lộ email hay mật khẩu sai.

Thông báo chung:

```text
Email hoặc mật khẩu không chính xác.
```

## 13.2. Lấy session hiện tại

```http
GET /api/auth/session
```

Response ví dụ:

```json
{
  "user": {
    "id": "user-id",
    "name": "LYDINC Administrator",
    "email": "admin@lydinc.local",
    "role": "ADMIN",
    "status": "ACTIVE",
    "departmentId": "department-id"
  },
  "expires": "2026-08-10T08:30:00.000Z"
}
```

## 13.3. Đăng xuất

```http
POST /api/auth/signout
```

Sau khi đăng xuất:

- Session bị xóa hoặc vô hiệu hóa.
- Người dùng được chuyển về `/login`.

---

# 14. Users API

## 14.1. Lấy danh sách người dùng

```http
GET /api/users
```

Quyền:

```text
ADMIN
```

Query parameters:

| Field        | Type       | Mô tả                   |
| ------------ | ---------- | ----------------------- |
| page         | number     | Trang hiện tại          |
| pageSize     | number     | Số phần tử mỗi trang    |
| search       | string     | Tìm theo tên hoặc email |
| role         | UserRole   | Lọc theo vai trò        |
| status       | UserStatus | Lọc theo trạng thái     |
| departmentId | string     | Lọc theo phòng ban      |
| sortBy       | string     | Trường sắp xếp          |
| sortOrder    | asc/desc   | Thứ tự sắp xếp          |

Ví dụ:

```http
GET /api/users?page=1&pageSize=20&role=MEMBER&status=ACTIVE
```

Response:

```json
{
  "data": [
    {
      "id": "user-id",
      "name": "Nguyễn Văn A",
      "email": "a@lydinc.local",
      "role": "MEMBER",
      "status": "ACTIVE",
      "department": {
        "id": "department-id",
        "name": "Chuyển đổi số"
      },
      "createdAt": "2026-07-21T12:00:00.000Z",
      "updatedAt": "2026-07-21T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

Không trả về:

```text
passwordHash
```

## 14.2. Tạo người dùng

```http
POST /api/users
```

Quyền:

```text
ADMIN
```

Request:

```json
{
  "name": "Nguyễn Văn A",
  "email": "a@lydinc.local",
  "password": "Password@123",
  "role": "MEMBER",
  "departmentId": "department-id"
}
```

Validation:

- `name`: bắt buộc.
- `email`: đúng định dạng.
- `email`: không được trùng.
- `password`: đạt độ dài tối thiểu.
- `role`: phải thuộc `UserRole`.
- `departmentId`: phải tồn tại.

Response:

```http
201 Created
```

```json
{
  "data": {
    "id": "user-id",
    "name": "Nguyễn Văn A",
    "email": "a@lydinc.local",
    "role": "MEMBER",
    "status": "ACTIVE",
    "departmentId": "department-id",
    "createdAt": "2026-07-21T12:00:00.000Z"
  },
  "message": "Tạo người dùng thành công."
}
```

## 14.3. Lấy chi tiết người dùng

```http
GET /api/users/:userId
```

Quyền:

- ADMIN được xem toàn bộ.
- Người dùng có thể xem hồ sơ của chính mình nếu hệ thống cho phép.

Response:

```json
{
  "data": {
    "id": "user-id",
    "name": "Nguyễn Văn A",
    "email": "a@lydinc.local",
    "role": "MEMBER",
    "status": "ACTIVE",
    "department": {
      "id": "department-id",
      "name": "Chuyển đổi số"
    },
    "createdAt": "2026-07-21T12:00:00.000Z",
    "updatedAt": "2026-07-21T12:00:00.000Z"
  }
}
```

## 14.4. Cập nhật người dùng

```http
PATCH /api/users/:userId
```

Quyền:

```text
ADMIN
```

Request:

```json
{
  "name": "Nguyễn Văn B",
  "email": "b@lydinc.local",
  "role": "MANAGER",
  "departmentId": "department-id"
}
```

Không cho phép cập nhật trực tiếp:

```text
passwordHash
createdAt
createdById
```

## 14.5. Thay đổi trạng thái tài khoản

```http
PATCH /api/users/:userId/status
```

Quyền:

```text
ADMIN
```

Request:

```json
{
  "status": "LOCKED"
}
```

Các trạng thái hợp lệ:

```text
ACTIVE
INACTIVE
LOCKED
```

Response:

```json
{
  "data": {
    "id": "user-id",
    "status": "LOCKED"
  },
  "message": "Cập nhật trạng thái tài khoản thành công."
}
```

## 14.6. Đổi mật khẩu

```http
PATCH /api/users/:userId/password
```

Quyền:

- Người dùng đổi mật khẩu của chính mình.
- ADMIN có thể reset mật khẩu theo chính sách riêng.

Request người dùng tự đổi:

```json
{
  "currentPassword": "CurrentPassword@123",
  "newPassword": "NewPassword@123"
}
```

Không trả mật khẩu hoặc hash trong response.

---

# 15. Departments API

## 15.1. Lấy danh sách phòng ban

```http
GET /api/departments
```

Quyền:

```text
Authenticated user
```

Query parameters:

| Field         | Type    | Mô tả                        |
| ------------- | ------- | ---------------------------- |
| page          | number  | Trang                        |
| pageSize      | number  | Số lượng mỗi trang           |
| search        | string  | Tìm theo tên                 |
| includeCounts | boolean | Kèm số lượng user và project |

Ví dụ:

```http
GET /api/departments?includeCounts=true
```

Response:

```json
{
  "data": [
    {
      "id": "department-id",
      "name": "Chuyển đổi số",
      "description": "Phát triển và vận hành các hệ thống số.",
      "counts": {
        "users": 5,
        "projects": 3
      },
      "createdAt": "2026-07-21T12:00:00.000Z"
    }
  ]
}
```

## 15.2. Tạo phòng ban

```http
POST /api/departments
```

Quyền:

```text
ADMIN
```

Request:

```json
{
  "name": "Chuyển đổi số",
  "description": "Phát triển và vận hành các hệ thống số."
}
```

Validation:

- `name` bắt buộc.
- Loại bỏ khoảng trắng thừa.
- Không được trùng tên.

Response:

```http
201 Created
```

## 15.3. Lấy chi tiết phòng ban

```http
GET /api/departments/:departmentId
```

Response:

```json
{
  "data": {
    "id": "department-id",
    "name": "Chuyển đổi số",
    "description": "Phát triển và vận hành các hệ thống số.",
    "counts": {
      "users": 5,
      "projects": 3
    },
    "createdAt": "2026-07-21T12:00:00.000Z",
    "updatedAt": "2026-07-21T12:00:00.000Z"
  }
}
```

## 15.4. Cập nhật phòng ban

```http
PATCH /api/departments/:departmentId
```

Quyền:

```text
ADMIN
```

Request:

```json
{
  "name": "Phòng Chuyển đổi số",
  "description": "Quản lý hoạt động chuyển đổi số."
}
```

## 15.5. Xóa phòng ban

```http
DELETE /api/departments/:departmentId
```

Quyền:

```text
ADMIN
```

Không được xóa nếu phòng ban đang có:

- Người dùng.
- Dự án.

Response khi có dữ liệu phụ thuộc:

```http
409 Conflict
```

```json
{
  "error": {
    "code": "DEPARTMENT_IN_USE",
    "message": "Không thể xóa phòng ban đang có người dùng hoặc dự án.",
    "details": {
      "userCount": 5,
      "projectCount": 3
    }
  }
}
```

---

# 16. Projects API

## 16.1. Lấy danh sách dự án

```http
GET /api/projects
```

Quyền dữ liệu:

- ADMIN: xem toàn bộ.
- MANAGER: xem dự án mình quản lý hoặc tham gia.
- MEMBER: xem dự án mình tham gia.

Query parameters:

| Field        | Type          | Mô tả                |
| ------------ | ------------- | -------------------- |
| page         | number        | Trang                |
| pageSize     | number        | Số lượng mỗi trang   |
| search       | string        | Tìm theo mã hoặc tên |
| status       | ProjectStatus | Lọc trạng thái       |
| departmentId | string        | Lọc phòng ban        |
| managerId    | string        | Lọc quản lý          |
| startFrom    | ISO date      | Ngày bắt đầu từ      |
| startTo      | ISO date      | Ngày bắt đầu đến     |
| endFrom      | ISO date      | Ngày kết thúc từ     |
| endTo        | ISO date      | Ngày kết thúc đến    |
| sortBy       | string        | Field sắp xếp        |
| sortOrder    | asc/desc      | Thứ tự               |

Ví dụ:

```http
GET /api/projects?status=ACTIVE&departmentId=department-id
```

Response:

```json
{
  "data": [
    {
      "id": "project-id",
      "code": "ANGC-WEB-2026",
      "name": "Xây dựng website cuộc thi ANGC 2026",
      "status": "ACTIVE",
      "startDate": "2026-08-01T00:00:00.000Z",
      "endDate": "2026-09-30T23:59:59.000Z",
      "department": {
        "id": "department-id",
        "name": "Chuyển đổi số"
      },
      "manager": {
        "id": "manager-id",
        "name": "Nguyễn Văn Manager"
      },
      "counts": {
        "members": 2,
        "tasks": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

## 16.2. Tạo dự án

```http
POST /api/projects
```

Quyền:

```text
ADMIN
MANAGER
```

Request:

```json
{
  "code": "ANGC-WEB-2026",
  "name": "Xây dựng website cuộc thi ANGC 2026",
  "description": "Thiết kế và phát triển website cuộc thi.",
  "status": "PLANNING",
  "startDate": "2026-08-01T00:00:00.000Z",
  "endDate": "2026-09-30T23:59:59.000Z",
  "departmentId": "department-id",
  "managerId": "manager-id"
}
```

Không nhận từ frontend:

```text
createdById
actorId
```

Các field này phải lấy từ session.

Business rules:

- `code` không được trùng.
- `endDate` không nhỏ hơn `startDate`.
- Department phải tồn tại.
- Manager phải tồn tại.
- Manager phải có role `ADMIN` hoặc `MANAGER`.
- Người tạo được ghi từ session.
- Phải tạo Activity Log.

Response:

```http
201 Created
```

## 16.3. Lấy chi tiết dự án

```http
GET /api/projects/:projectId
```

Response:

```json
{
  "data": {
    "id": "project-id",
    "code": "ANGC-WEB-2026",
    "name": "Xây dựng website cuộc thi ANGC 2026",
    "description": "Thiết kế và phát triển website cuộc thi.",
    "status": "ACTIVE",
    "startDate": "2026-08-01T00:00:00.000Z",
    "endDate": "2026-09-30T23:59:59.000Z",
    "department": {
      "id": "department-id",
      "name": "Chuyển đổi số"
    },
    "manager": {
      "id": "manager-id",
      "name": "Nguyễn Văn Manager",
      "email": "manager@lydinc.local"
    },
    "createdBy": {
      "id": "admin-id",
      "name": "LYDINC Administrator"
    },
    "taskSummary": {
      "total": 5,
      "todo": 2,
      "inProgress": 1,
      "review": 1,
      "completed": 1,
      "cancelled": 0,
      "overdue": 0
    },
    "createdAt": "2026-07-21T12:00:00.000Z",
    "updatedAt": "2026-07-21T12:00:00.000Z"
  }
}
```

## 16.4. Cập nhật dự án

```http
PATCH /api/projects/:projectId
```

Quyền:

- ADMIN: toàn bộ dự án.
- MANAGER: dự án mình quản lý.

Request:

```json
{
  "name": "Website ANGC 2026",
  "description": "Nội dung mô tả mới.",
  "startDate": "2026-08-01T00:00:00.000Z",
  "endDate": "2026-10-05T23:59:59.000Z",
  "departmentId": "department-id",
  "managerId": "manager-id"
}
```

Các field không được sửa trực tiếp:

```text
id
createdById
createdAt
```

## 16.5. Thay đổi trạng thái dự án

```http
PATCH /api/projects/:projectId/status
```

Request:

```json
{
  "status": "ACTIVE"
}
```

Các trạng thái hợp lệ:

```text
PLANNING
ACTIVE
ON_HOLD
COMPLETED
CANCELLED
```

Phải tạo Activity Log khi đổi trạng thái.

## 16.6. Hủy dự án

Dùng endpoint đổi trạng thái:

```http
PATCH /api/projects/:projectId/status
```

Request:

```json
{
  "status": "CANCELLED"
}
```

Trong MVP, ưu tiên hủy dự án thay vì xóa vật lý.

## 16.7. Xóa dự án

```http
DELETE /api/projects/:projectId
```

Quyền:

```text
ADMIN
```

Endpoint này có thể chưa được bật trong MVP.

Nếu triển khai:

- Phải có xác nhận.
- Phải kiểm tra dữ liệu liên quan.
- Phải ghi Activity Log trước khi xóa.
- Không được sử dụng tùy ý trên production.

---

# 17. Project Members API

## 17.1. Lấy danh sách thành viên dự án

```http
GET /api/projects/:projectId/members
```

Quyền:

- ADMIN.
- Project Manager.
- Thành viên có quyền xem dự án.

Query parameters:

```text
page
pageSize
search
role
```

Response:

```json
{
  "data": [
    {
      "id": "project-member-id",
      "joinedAt": "2026-08-01T00:00:00.000Z",
      "user": {
        "id": "user-id",
        "name": "Trần Thị Member",
        "email": "member@lydinc.local",
        "role": "MEMBER",
        "status": "ACTIVE",
        "department": {
          "id": "department-id",
          "name": "Chuyển đổi số"
        }
      }
    }
  ]
}
```

## 17.2. Thêm thành viên dự án

```http
POST /api/projects/:projectId/members
```

Quyền:

- ADMIN.
- Manager của dự án.

Request:

```json
{
  "userId": "user-id"
}
```

Business rules:

- Project phải tồn tại.
- User phải tồn tại.
- User phải có trạng thái `ACTIVE`.
- Không thêm trùng thành viên.
- Phải tạo Activity Log.

Response:

```http
201 Created
```

## 17.3. Xóa thành viên khỏi dự án

```http
DELETE /api/projects/:projectId/members/:userId
```

Quyền:

- ADMIN.
- Manager của dự án.

Không được xóa nếu:

- User là manager hiện tại của dự án.
- User còn nhiệm vụ đang hoạt động trong dự án.

Nhiệm vụ đang hoạt động gồm:

```text
TODO
IN_PROGRESS
REVIEW
```

Response khi còn nhiệm vụ:

```http
409 Conflict
```

```json
{
  "error": {
    "code": "PROJECT_MEMBER_HAS_ACTIVE_TASKS",
    "message": "Không thể xóa thành viên đang phụ trách nhiệm vụ chưa hoàn thành.",
    "details": {
      "activeTaskCount": 3
    }
  }
}
```

---

# 18. Tasks API

## 18.1. Lấy danh sách nhiệm vụ

```http
GET /api/tasks
```

Quyền dữ liệu:

- ADMIN: toàn bộ nhiệm vụ.
- MANAGER: nhiệm vụ thuộc dự án mình quản lý hoặc tham gia.
- MEMBER: nhiệm vụ thuộc dự án mình tham gia theo chính sách hệ thống.

Query parameters:

| Field       | Type         | Mô tả                    |
| ----------- | ------------ | ------------------------ |
| page        | number       | Trang                    |
| pageSize    | number       | Số lượng                 |
| search      | string       | Tìm theo tiêu đề         |
| projectId   | string       | Lọc dự án                |
| assigneeId  | string       | Lọc người phụ trách      |
| createdById | string       | Lọc người tạo            |
| status      | TaskStatus   | Lọc trạng thái           |
| priority    | TaskPriority | Lọc mức độ ưu tiên       |
| overdue     | boolean      | Chỉ lấy nhiệm vụ quá hạn |
| dueFrom     | ISO date     | Deadline từ              |
| dueTo       | ISO date     | Deadline đến             |
| sortBy      | string       | Field sắp xếp            |
| sortOrder   | asc/desc     | Thứ tự                   |

Ví dụ:

```http
GET /api/tasks?projectId=project-id&status=IN_PROGRESS
```

Ví dụ lấy nhiệm vụ quá hạn:

```http
GET /api/tasks?overdue=true
```

Response:

```json
{
  "data": [
    {
      "id": "task-id",
      "title": "Thiết kế trang giới thiệu cuộc thi",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "progress": 40,
      "startDate": "2026-08-01T00:00:00.000Z",
      "dueDate": "2026-08-10T23:59:59.000Z",
      "isOverdue": false,
      "project": {
        "id": "project-id",
        "code": "ANGC-WEB-2026",
        "name": "Xây dựng website cuộc thi ANGC 2026"
      },
      "assignee": {
        "id": "member-id",
        "name": "Trần Thị Member"
      },
      "createdBy": {
        "id": "manager-id",
        "name": "Nguyễn Văn Manager"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 5,
    "totalPages": 1
  }
}
```

`isOverdue` là giá trị tính toán, không phải cột cố định trong database.

## 18.2. Lấy nhiệm vụ của người dùng hiện tại

```http
GET /api/my-tasks
```

User ID được lấy từ session.

Không chấp nhận:

```http
GET /api/my-tasks?userId=other-user
```

Query parameters:

```text
page
pageSize
search
status
priority
projectId
overdue
dueFrom
dueTo
```

## 18.3. Tạo nhiệm vụ

```http
POST /api/tasks
```

Quyền:

```text
ADMIN
MANAGER
```

Request:

```json
{
  "title": "Thiết kế trang giới thiệu cuộc thi",
  "description": "Thiết kế bố cục trang chủ.",
  "projectId": "project-id",
  "assigneeId": "member-id",
  "priority": "HIGH",
  "startDate": "2026-08-01T00:00:00.000Z",
  "dueDate": "2026-08-10T23:59:59.000Z"
}
```

Không nhận:

```text
createdById
actorId
status
completedAt
```

Giá trị mặc định:

```text
status = TODO
progress = 0
```

Business rules:

- Project phải tồn tại.
- User phụ trách phải tồn tại.
- Assignee phải là thành viên dự án.
- Assignee phải có trạng thái `ACTIVE`.
- `dueDate` không nhỏ hơn `startDate`.
- `dueDate` phải nằm trong thời gian dự án, trừ quyền đặc biệt.
- Phải tạo Activity Log.

Response:

```http
201 Created
```

## 18.4. Lấy chi tiết nhiệm vụ

```http
GET /api/tasks/:taskId
```

Response:

```json
{
  "data": {
    "id": "task-id",
    "title": "Thiết kế trang giới thiệu cuộc thi",
    "description": "Thiết kế bố cục trang chủ.",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "progress": 40,
    "startDate": "2026-08-01T00:00:00.000Z",
    "dueDate": "2026-08-10T23:59:59.000Z",
    "completedAt": null,
    "result": null,
    "isOverdue": false,
    "project": {
      "id": "project-id",
      "code": "ANGC-WEB-2026",
      "name": "Xây dựng website cuộc thi ANGC 2026"
    },
    "assignee": {
      "id": "member-id",
      "name": "Trần Thị Member",
      "email": "member@lydinc.local"
    },
    "createdBy": {
      "id": "manager-id",
      "name": "Nguyễn Văn Manager"
    },
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-08-05T00:00:00.000Z"
  }
}
```

## 18.5. Cập nhật nhiệm vụ

```http
PATCH /api/tasks/:taskId
```

Quyền:

- ADMIN: toàn bộ.
- Project Manager: nhiệm vụ trong dự án mình quản lý.
- MEMBER: chỉ cập nhật các field được cho phép của nhiệm vụ mình phụ trách.

Request dành cho manager:

```json
{
  "title": "Thiết kế trang chủ cuộc thi",
  "description": "Cập nhật mô tả.",
  "priority": "URGENT",
  "startDate": "2026-08-01T00:00:00.000Z",
  "dueDate": "2026-08-12T23:59:59.000Z",
  "assigneeId": "member-id"
}
```

MEMBER không được sửa:

```text
projectId
assigneeId
createdById
priority
dueDate
```

trừ khi chính sách sau này cho phép.

## 18.6. Cập nhật tiến độ

```http
PATCH /api/tasks/:taskId/progress
```

Request:

```json
{
  "progress": 60
}
```

Validation:

- Phải là số nguyên.
- Tối thiểu 0.
- Tối đa 100.

Business rules:

- MEMBER chỉ cập nhật task mình phụ trách.
- Progress bằng 100 không tự động chuyển task thành `COMPLETED`.
- Task `COMPLETED` phải có progress bằng 100.

Response:

```json
{
  "data": {
    "id": "task-id",
    "progress": 60,
    "status": "IN_PROGRESS"
  },
  "message": "Cập nhật tiến độ thành công."
}
```

## 18.7. Cập nhật kết quả công việc

```http
PATCH /api/tasks/:taskId/result
```

Request:

```json
{
  "result": "https://example.com/design"
}
```

`result` có thể là:

- Link tài liệu.
- Link Google Drive.
- Link Canva.
- Nội dung mô tả kết quả.
- Ghi chú bàn giao.

Trong MVP, hệ thống chưa upload file trực tiếp.

## 18.8. Thay đổi trạng thái nhiệm vụ

```http
PATCH /api/tasks/:taskId/status
```

Request:

```json
{
  "status": "REVIEW"
}
```

Luồng trạng thái chuẩn:

```text
TODO → IN_PROGRESS
IN_PROGRESS → REVIEW
REVIEW → COMPLETED
REVIEW → IN_PROGRESS
TODO → CANCELLED
IN_PROGRESS → CANCELLED
REVIEW → CANCELLED
```

Quy tắc:

- MEMBER chỉ cập nhật task mình phụ trách.
- MEMBER được chuyển `TODO` sang `IN_PROGRESS`.
- MEMBER được chuyển `IN_PROGRESS` sang `REVIEW`.
- MEMBER không được chuyển trực tiếp `TODO` sang `COMPLETED`.
- Chỉ ADMIN hoặc Project Manager được chuyển `REVIEW` sang `COMPLETED`.
- Khi `COMPLETED`, progress phải bằng 100.
- Khi `COMPLETED`, `completedAt` được thiết lập.
- Khi rời `COMPLETED`, `completedAt` phải được xóa nếu thao tác được cho phép.
- Mỗi lần đổi trạng thái phải tạo Activity Log.

Response lỗi chuyển trạng thái:

```http
422 Unprocessable Entity
```

```json
{
  "error": {
    "code": "INVALID_TASK_STATUS_TRANSITION",
    "message": "Không thể chuyển nhiệm vụ từ TODO sang COMPLETED.",
    "details": {
      "currentStatus": "TODO",
      "requestedStatus": "COMPLETED"
    }
  }
}
```

## 18.9. Hủy nhiệm vụ

Sử dụng endpoint trạng thái:

```http
PATCH /api/tasks/:taskId/status
```

Request:

```json
{
  "status": "CANCELLED"
}
```

## 18.10. Xóa nhiệm vụ

```http
DELETE /api/tasks/:taskId
```

Trong MVP:

- MEMBER không được xóa.
- Ưu tiên chuyển `CANCELLED`.
- Task có bình luận hoặc log không nên xóa vật lý.
- Endpoint có thể chỉ dành cho ADMIN.

---

# 19. Comments API

## 19.1. Lấy bình luận của nhiệm vụ

```http
GET /api/tasks/:taskId/comments
```

Quyền:

- Người dùng phải có quyền xem task.

Query parameters:

```text
page
pageSize
sortOrder
```

Mặc định:

```text
sortOrder = asc
```

Response:

```json
{
  "data": [
    {
      "id": "comment-id",
      "content": "Em đã hoàn thành bản thiết kế đầu tiên.",
      "author": {
        "id": "member-id",
        "name": "Trần Thị Member"
      },
      "createdAt": "2026-08-05T08:30:00.000Z",
      "updatedAt": "2026-08-05T08:30:00.000Z",
      "canEdit": true,
      "canDelete": true
    }
  ]
}
```

`canEdit` và `canDelete` là giá trị tính toán theo user hiện tại.

## 19.2. Tạo bình luận

```http
POST /api/tasks/:taskId/comments
```

Request:

```json
{
  "content": "Em đã hoàn thành bản thiết kế đầu tiên."
}
```

Validation:

- Nội dung bắt buộc.
- Loại bỏ khoảng trắng thừa.
- Không được chỉ chứa khoảng trắng.
- Có giới hạn độ dài.

`authorId` phải lấy từ session.

Response:

```http
201 Created
```

## 19.3. Cập nhật bình luận

```http
PATCH /api/comments/:commentId
```

Request:

```json
{
  "content": "Em đã cập nhật lại bản thiết kế."
}
```

Quyền:

- Người dùng chỉ sửa bình luận của chính mình.
- ADMIN có thể có quyền quản trị nội dung.

## 19.4. Xóa bình luận

```http
DELETE /api/comments/:commentId
```

Quyền:

- Tác giả bình luận.
- ADMIN theo chính sách quản trị.

Trong tương lai có thể chuyển sang soft delete.

---

# 20. Activity Logs API

## 20.1. Lấy lịch sử hoạt động

```http
GET /api/activity-logs
```

Query parameters:

| Field      | Type     | Mô tả           |
| ---------- | -------- | --------------- |
| page       | number   | Trang           |
| pageSize   | number   | Số lượng        |
| entityType | string   | Loại đối tượng  |
| entityId   | string   | ID đối tượng    |
| actorId    | string   | Người thực hiện |
| action     | string   | Loại hành động  |
| from       | ISO date | Từ ngày         |
| to         | ISO date | Đến ngày        |

Ví dụ:

```http
GET /api/activity-logs?entityType=TASK&entityId=task-id
```

Response:

```json
{
  "data": [
    {
      "id": "log-id",
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
      "actor": {
        "id": "user-id",
        "name": "Nguyễn Văn A"
      },
      "createdAt": "2026-08-10T08:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

## 20.2. Quy tắc Activity Log API

Không cung cấp public endpoint để:

```text
POST /api/activity-logs
PATCH /api/activity-logs/:id
DELETE /api/activity-logs/:id
```

Activity Log chỉ được tạo từ service layer.

Người dùng không được:

- Tạo log giả.
- Sửa log.
- Xóa log.

---

# 21. Dashboard API

## 21.1. Lấy thống kê tổng quan

```http
GET /api/dashboard/summary
```

Quyền dữ liệu:

- ADMIN: toàn hệ thống.
- MANAGER: dự án mình quản lý hoặc tham gia.
- MEMBER: nhiệm vụ và dự án liên quan.

Query parameters tùy chọn:

```text
departmentId
projectId
from
to
```

Response:

```json
{
  "data": {
    "projects": {
      "total": 6,
      "active": 4,
      "planning": 1,
      "onHold": 1,
      "completed": 0,
      "cancelled": 0
    },
    "tasks": {
      "total": 30,
      "todo": 8,
      "inProgress": 10,
      "review": 4,
      "completed": 6,
      "cancelled": 0,
      "overdue": 2
    },
    "upcomingTasks": [
      {
        "id": "task-id",
        "title": "Kiểm tra giao diện trên điện thoại",
        "dueDate": "2026-08-30T23:59:59.000Z",
        "priority": "HIGH",
        "project": {
          "id": "project-id",
          "name": "Xây dựng website cuộc thi ANGC 2026"
        }
      }
    ]
  }
}
```

## 21.2. Thống kê theo dự án

```http
GET /api/dashboard/projects/:projectId
```

Response:

```json
{
  "data": {
    "project": {
      "id": "project-id",
      "code": "ANGC-WEB-2026",
      "name": "Xây dựng website cuộc thi ANGC 2026"
    },
    "taskSummary": {
      "total": 5,
      "todo": 2,
      "inProgress": 1,
      "review": 1,
      "completed": 1,
      "cancelled": 0,
      "overdue": 0
    },
    "progress": 46
  }
}
```

Cách tính tiến độ dự án phải được quy định rõ trong business logic.

Ví dụ MVP:

```text
Project progress =
Tổng progress của các task / số lượng task
```

Nếu dự án chưa có task:

```text
progress = 0
```

---

# 22. Error codes

Các error code dự kiến:

## 22.1. Authentication

```text
AUTHENTICATION_REQUIRED
INVALID_CREDENTIALS
SESSION_EXPIRED
ACCOUNT_INACTIVE
ACCOUNT_LOCKED
```

## 22.2. Authorization

```text
FORBIDDEN
INSUFFICIENT_ROLE
RESOURCE_ACCESS_DENIED
```

## 22.3. Validation

```text
VALIDATION_ERROR
INVALID_QUERY_PARAMETERS
INVALID_DATE_FORMAT
INVALID_DATE_RANGE
```

## 22.4. Users

```text
USER_NOT_FOUND
EMAIL_ALREADY_EXISTS
INVALID_USER_ROLE
CANNOT_LOCK_LAST_ADMIN
CURRENT_PASSWORD_INVALID
```

## 22.5. Departments

```text
DEPARTMENT_NOT_FOUND
DEPARTMENT_NAME_EXISTS
DEPARTMENT_IN_USE
```

## 22.6. Projects

```text
PROJECT_NOT_FOUND
PROJECT_CODE_EXISTS
PROJECT_DATE_RANGE_INVALID
INVALID_PROJECT_MANAGER
PROJECT_ACCESS_DENIED
```

## 22.7. Project Members

```text
PROJECT_MEMBER_NOT_FOUND
PROJECT_MEMBER_EXISTS
PROJECT_MANAGER_CANNOT_BE_REMOVED
PROJECT_MEMBER_HAS_ACTIVE_TASKS
```

## 22.8. Tasks

```text
TASK_NOT_FOUND
TASK_ACCESS_DENIED
USER_NOT_PROJECT_MEMBER
INVALID_TASK_STATUS_TRANSITION
TASK_PROGRESS_INVALID
TASK_DATE_RANGE_INVALID
TASK_ASSIGNEE_INACTIVE
TASK_COMPLETION_REQUIRES_FULL_PROGRESS
```

## 22.9. Comments

```text
COMMENT_NOT_FOUND
COMMENT_ACCESS_DENIED
COMMENT_CONTENT_EMPTY
```

## 22.10. System

```text
CONFLICT
RATE_LIMIT_EXCEEDED
DATABASE_ERROR
INTERNAL_SERVER_ERROR
```

---

# 23. Ví dụ response lỗi

## 23.1. Không tìm thấy resource

```http
404 Not Found
```

```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Không tìm thấy nhiệm vụ.",
    "details": null
  }
}
```

## 23.2. Không có quyền

```http
403 Forbidden
```

```json
{
  "error": {
    "code": "TASK_ACCESS_DENIED",
    "message": "Bạn không có quyền truy cập nhiệm vụ này.",
    "details": null
  }
}
```

## 23.3. Dữ liệu bị trùng

```http
409 Conflict
```

```json
{
  "error": {
    "code": "PROJECT_CODE_EXISTS",
    "message": "Mã dự án đã tồn tại.",
    "details": {
      "field": "code"
    }
  }
}
```

## 23.4. Lỗi nghiệp vụ

```http
422 Unprocessable Entity
```

```json
{
  "error": {
    "code": "USER_NOT_PROJECT_MEMBER",
    "message": "Người được giao nhiệm vụ phải là thành viên của dự án.",
    "details": {
      "userId": "user-id",
      "projectId": "project-id"
    }
  }
}
```

## 23.5. Lỗi hệ thống

```http
500 Internal Server Error
```

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
    "details": null
  }
}
```

Không trả về:

- Stack trace.
- Prisma error gốc.
- SQL query.
- Database URL.
- File path nội bộ.
- Secret.

---

# 24. Validation

Mọi dữ liệu đầu vào phải được validate bằng Zod.

Cần validate:

- Request body.
- Query parameters.
- Route parameters.
- Enum.
- Date.
- Email.
- Pagination.
- Sort field.

Ví dụ:

```ts
const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional(),
  projectId: z.string().min(1),
  assigneeId: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date(),
});
```

Validation schema chỉ kiểm tra cấu trúc dữ liệu.

Business rule phải được kiểm tra trong service.

---

# 25. Bảo mật API

## 25.1. Không tin dữ liệu từ client

Không tin tưởng:

- Role gửi từ frontend.
- User ID hiện tại gửi từ frontend.
- `createdById`.
- `actorId`.
- Quyền chỉnh sửa do UI quyết định.

## 25.2. Không trả dữ liệu nhạy cảm

Không trả qua API:

```text
passwordHash
AUTH_SECRET
DATABASE_URL
sessionToken
accessToken
refreshToken
```

## 25.3. Password

- Mật khẩu không được lưu dạng văn bản.
- Mật khẩu không được ghi vào log.
- Mật khẩu không được trả trong response.
- Không gửi password hash xuống client.

## 25.4. Error message

Không để error message tiết lộ:

- Database structure.
- SQL query.
- Internal file path.
- Framework stack trace.
- Secret.

## 25.5. Authorization

Mọi endpoint truy cập resource phải kiểm tra:

1. Người dùng đã đăng nhập chưa.
2. Tài khoản còn ACTIVE không.
3. Role có phù hợp không.
4. Người dùng có quyền trên resource cụ thể không.

---

# 26. Transaction

Các thao tác nhiều bước phải sử dụng database transaction.

Ví dụ tạo task:

1. Tạo Task.
2. Tạo ActivityLog.
3. Commit.

Ví dụ đổi trạng thái:

1. Đọc Task hiện tại.
2. Kiểm tra transition.
3. Cập nhật Task.
4. Cập nhật `completedAt`.
5. Tạo ActivityLog.
6. Commit.

Nếu một bước thất bại, toàn bộ transaction phải rollback.

---

# 27. Idempotency

Các endpoint tạo mới thông thường không mặc định idempotent.

Frontend cần tránh gửi trùng request khi:

- Người dùng double-click.
- Mạng chậm.
- Retry tự động.

Trong tương lai, các thao tác quan trọng có thể hỗ trợ header:

```http
Idempotency-Key: unique-request-key
```

MVP chưa bắt buộc triển khai `Idempotency-Key`, nhưng UI phải khóa nút submit trong lúc request đang xử lý.

---

# 28. Rate limiting

MVP nên ưu tiên rate limiting cho:

- Đăng nhập.
- Reset mật khẩu.
- Tạo bình luận liên tục.
- Endpoint có chi phí cao.

Khi vượt giới hạn:

```http
429 Too Many Requests
```

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
    "details": null
  }
}
```

---

# 29. Caching

Không cache dữ liệu có tính cá nhân hoặc phân quyền nếu chưa kiểm soát rõ cache key.

Các dữ liệu như sau phải cẩn thận:

- Danh sách task theo user.
- Dashboard theo role.
- Project detail theo membership.
- User profile.

Có thể cache các dữ liệu ít thay đổi như:

- Danh sách enum.
- Danh sách phòng ban công khai nội bộ.

Mọi chiến lược cache phải bảo đảm không làm lộ dữ liệu giữa người dùng.

---

# 30. Logging

Server có thể ghi:

- Endpoint.
- HTTP method.
- Response status.
- Thời gian xử lý.
- User ID nội bộ nếu phù hợp.
- Error code.
- Request ID.

Không ghi:

- Mật khẩu.
- Password hash.
- Session token.
- Secret.
- Toàn bộ request body nhạy cảm.

---

# 31. Request ID

Mỗi request có thể được gắn request ID để hỗ trợ debug.

Ví dụ response header:

```http
X-Request-Id: request-id
```

Response lỗi có thể kèm:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Đã xảy ra lỗi hệ thống.",
    "details": {
      "requestId": "request-id"
    }
  }
}
```

Không dùng request ID để tiết lộ thông tin nội bộ.

---

# 32. API route structure

Cấu trúc route dự kiến:

```text
src/app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts
│
├── users/
│   ├── route.ts
│   └── [userId]/
│       ├── route.ts
│       ├── status/
│       │   └── route.ts
│       └── password/
│           └── route.ts
│
├── departments/
│   ├── route.ts
│   └── [departmentId]/
│       └── route.ts
│
├── projects/
│   ├── route.ts
│   └── [projectId]/
│       ├── route.ts
│       ├── status/
│       │   └── route.ts
│       └── members/
│           ├── route.ts
│           └── [userId]/
│               └── route.ts
│
├── tasks/
│   ├── route.ts
│   └── [taskId]/
│       ├── route.ts
│       ├── progress/
│       │   └── route.ts
│       ├── result/
│       │   └── route.ts
│       ├── status/
│       │   └── route.ts
│       └── comments/
│           └── route.ts
│
├── comments/
│   └── [commentId]/
│       └── route.ts
│
├── my-tasks/
│   └── route.ts
│
├── activity-logs/
│   └── route.ts
│
└── dashboard/
    ├── summary/
    │   └── route.ts
    └── projects/
        └── [projectId]/
            └── route.ts
```

---

# 33. Trách nhiệm của Route Handler

Route Handler chỉ thực hiện:

1. Lấy session.
2. Đọc route parameters.
3. Đọc query parameters.
4. Đọc request body.
5. Validate input.
6. Gọi service.
7. Trả response.
8. Chuyển AppError thành HTTP response.

Route Handler không chứa:

- Business logic phức tạp.
- Prisma query dài.
- Transaction.
- Logic phân quyền chi tiết.
- Logic tạo Activity Log.

Ví dụ:

```ts
export async function POST(request: Request) {
  const actor = await requireActiveSessionUser();
  const body = await request.json();
  const input = createTaskSchema.parse(body);

  const task = await createTask({
    actor,
    input,
  });

  return Response.json(
    {
      data: task,
      message: 'Tạo nhiệm vụ thành công.',
    },
    {
      status: 201,
    },
  );
}
```

---

# 34. API testing

Mỗi endpoint quan trọng cần kiểm tra:

- Request hợp lệ.
- Request thiếu field.
- Request sai type.
- Người dùng chưa đăng nhập.
- Người dùng sai quyền.
- Resource không tồn tại.
- Dữ liệu trùng.
- Vi phạm business rule.
- Response không chứa field nhạy cảm.
- Activity Log được tạo.
- Transaction rollback khi lỗi.

Ví dụ test cho tạo task:

```text
[ ] ADMIN tạo task thành công
[ ] MANAGER đúng dự án tạo task thành công
[ ] MEMBER bị từ chối
[ ] Assignee không thuộc dự án bị từ chối
[ ] dueDate nhỏ hơn startDate bị từ chối
[ ] Project không tồn tại trả 404
[ ] Task được tạo với TODO và progress 0
[ ] Activity Log được tạo
[ ] Response không có dữ liệu nhạy cảm
```

---

# 35. Phiên bản API

MVP chưa bắt buộc thêm version vào URL.

Hiện tại:

```text
/api/projects
```

Khi API được công khai hoặc có nhiều client độc lập, có thể chuyển sang:

```text
/api/v1/projects
```

Không thêm version sớm nếu chưa có nhu cầu rõ ràng.

---

# 36. Quy tắc cập nhật tài liệu

Tài liệu này phải được cập nhật khi:

- Thêm endpoint.
- Xóa endpoint.
- Thay đổi request body.
- Thay đổi response body.
- Thay đổi quyền.
- Thay đổi error code.
- Thay đổi business rule.
- Thay đổi pagination hoặc filter.

Không để tài liệu khác với code thực tế.

Mọi Pull Request thay đổi API phải xem xét cập nhật:

```text
docs/API.md
docs/REQUIREMENTS.md
tests
```

---

# 37. Definition of Done cho API

Một endpoint được xem là hoàn thành khi:

```text
[ ] Có Route Handler
[ ] Có validation schema
[ ] Có authentication
[ ] Có authorization
[ ] Có service
[ ] Có error handling
[ ] Không trả dữ liệu nhạy cảm
[ ] Có test trường hợp thành công
[ ] Có test trường hợp lỗi
[ ] Có Activity Log nếu cần
[ ] Có transaction nếu cần
[ ] API.md được cập nhật
[ ] Lint thành công
[ ] Type-check thành công
[ ] Test thành công
[ ] Build thành công
```
