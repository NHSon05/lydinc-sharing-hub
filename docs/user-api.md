Đọc kỹ các file sau trước khi sửa code:

- AGENTS.md
- docs/PRODUCT.md
- docs/REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DATABASE.md
- docs/API.md

Ngoài ra, hãy kiểm tra implementation thực tế của:

- Authentication
- SessionUser
- Departments module
- AppError
- API response helpers
- Prisma schema
- Activity Log
- Cách tổ chức repository, service, policy và test trong repository hiện tại

Mục tiêu:
Triển khai hoàn chỉnh backend và API cho module Users của dự án LYDINC TaskHub.

Không xây dựng UI trong nhiệm vụ này.

==================================================

1. PHẠM VI API
   \==================================================

Triển khai các endpoint:

GET /api/users
POST /api/users
GET /api/users/:userId
PATCH /api/users/:userId
PATCH /api/users/:userId/status
PATCH /api/users/:userId/password

Nếu tài liệu và implementation hiện tại đã có endpoint riêng cho hồ sơ cá nhân, có thể bổ sung:

GET /api/me
PATCH /api/me
PATCH /api/me/password

Không tự ý thêm endpoint ngoài phạm vi nếu chưa có nhu cầu rõ ràng.

================================================== 2. QUYỀN TRUY CẬP
==================================================

GET /api/users

- Chỉ ADMIN được xem danh sách toàn bộ người dùng.
- Không cho MANAGER hoặc MEMBER xem toàn bộ danh sách qua endpoint này.
- Nếu sau này cần danh sách thành viên để giao việc, phải dùng endpoint có phạm vi dữ liệu riêng, không dùng API quản trị này.

POST /api/users

- Chỉ ADMIN được tạo người dùng.

GET /api/users/:userId

- ADMIN được xem mọi người dùng.
- Người dùng được xem hồ sơ của chính mình nếu business rule hiện tại cho phép.
- MANAGER và MEMBER không được xem hồ sơ quản trị của người khác.

PATCH /api/users/:userId

- Chỉ ADMIN được cập nhật:
  - name
  - email
  - role
  - departmentId
- Người dùng không được tự thay đổi role, status hoặc departmentId.
- Nếu hỗ trợ cập nhật hồ sơ cá nhân, chỉ cho phép cập nhật field đã quy định riêng.

PATCH /api/users/:userId/status

- Chỉ ADMIN.
- Dùng để chuyển trạng thái:
  - ACTIVE
  - INACTIVE
  - LOCKED

PATCH /api/users/:userId/password

- Người dùng được đổi mật khẩu của chính mình khi cung cấp đúng mật khẩu hiện tại.
- ADMIN có thể reset mật khẩu người dùng theo chính sách hệ thống.
- Phải phân biệt rõ hai use case:
  - Self change password.
  - Admin reset password.

Mọi quyền phải được kiểm tra ở server.
Không chỉ dựa vào việc UI ẩn nút.

================================================== 3. CẤU TRÚC MODULE ĐỀ XUẤT
==================================================

Kiểm tra cấu trúc hiện tại trước khi tạo mới.

Cấu trúc đề xuất:

src/modules/users/
├── user.types.ts
├── user.schema.ts
├── user.policy.ts
├── user.repository.ts
├── user.service.ts
├── user.mapper.ts
├── user.errors.ts
└── user.test.ts

Route:

src/app/api/users/
├── route.ts
└── [userId]/
├── route.ts
├── status/
│ └── route.ts
└── password/
└── route.ts

Nếu đã có convention khác trong repository, phải tuân thủ convention hiện tại.

================================================== 4. USER TYPES
==================================================

Tạo type rõ ràng cho:

- UserListQuery
- CreateUserInput
- UpdateUserInput
- UpdateUserStatusInput
- ChangeOwnPasswordInput
- ResetUserPasswordInput
- UserListItem
- UserDetail
- PaginatedUsers

Không dùng `any`.

Không dùng trực tiếp Prisma User type làm response nếu type đó chứa:

- passwordHash
- trường nội bộ không cần thiết
- relation không phù hợp

================================================== 5. VALIDATION BẰNG ZOD
==================================================

Tạo các schema tối thiểu:

- userIdParamsSchema
- userListQuerySchema
- createUserSchema
- updateUserSchema
- updateUserStatusSchema
- changeOwnPasswordSchema
- resetUserPasswordSchema

---

5.1. Danh sách người dùng
--------------------------------------------------

Query parameters:

- page
- pageSize
- search
- role
- status
- departmentId
- sortBy
- sortOrder

Quy tắc:

- page mặc định 1.
- pageSize mặc định 20.
- pageSize tối đa 100.
- search được trim.
- role phải thuộc UserRole.
- status phải thuộc UserStatus.
- sortOrder chỉ nhận asc hoặc desc.
- sortBy chỉ được nhận các field nằm trong allowlist.

Sort field có thể hỗ trợ:

- name
- email
- role
- status
- createdAt
- updatedAt

Không truyền trực tiếp sort field chưa kiểm soát vào Prisma.

---

5.2. Tạo người dùng
--------------------------------------------------

Request dự kiến:

{
"name": "Nguyễn Văn A",
"email": "a@lydinc.local",
"password": "Password@123",
"role": "MEMBER",
"departmentId": "department-id"
}

Validation:

name:

- Bắt buộc.
- Trim.
- Tối thiểu 1 ký tự.
- Tối đa 150 ký tự.

email:

- Bắt buộc.
- Đúng định dạng email.
- Trim.
- Chuyển về lowercase trước khi lưu.

password:

- Bắt buộc.
- Tối thiểu theo chính sách hiện tại, đề xuất từ 8 ký tự.
- Không lưu plain text.
- Không ghi log.

role:

- ADMIN
- MANAGER
- MEMBER

departmentId:

- Bắt buộc nếu schema hiện tại yêu cầu.
- Department phải tồn tại.

status:

- Không nhận từ client khi tạo.
- Mặc định ACTIVE, trừ khi requirement hiện tại quy định khác.

Không nhận:

- id
- passwordHash
- createdAt
- updatedAt
- createdById
- actorId

---

5.3. Cập nhật người dùng
--------------------------------------------------

Request có thể gồm:

{
"name": "Nguyễn Văn B",
"email": "b@lydinc.local",
"role": "MANAGER",
"departmentId": "department-id"
}

Quy tắc:

- Ít nhất một field phải được gửi.
- Không nhận password trong endpoint cập nhật chung.
- Không nhận status trong endpoint cập nhật chung.
- Không nhận passwordHash.
- Email phải được chuẩn hóa lowercase.
- Không gửi request cập nhật rỗng.

---

5.4. Cập nhật trạng thái
--------------------------------------------------

Request:

{
"status": "LOCKED"
}

Chỉ nhận:

- ACTIVE
- INACTIVE
- LOCKED

---

5.5. Đổi mật khẩu cá nhân
--------------------------------------------------

Request:

{
"currentPassword": "CurrentPassword@123",
"newPassword": "NewPassword@123"
}

Quy tắc:

- currentPassword bắt buộc.
- newPassword đạt chính sách mật khẩu.
- newPassword không được giống currentPassword nếu chính sách yêu cầu.
- userId thực tế lấy từ session trong use case đổi mật khẩu cá nhân.

---

5.6. ADMIN reset mật khẩu
--------------------------------------------------

Request:

{
"newPassword": "TemporaryPassword@123"
}

Quy tắc:

- Chỉ ADMIN.
- Không cần currentPassword của user bị reset.
- Phải tạo Activity Log.
- Không lưu mật khẩu mới trong Activity Log.

================================================== 6. BUSINESS RULES
==================================================

---

6.1. Email
--------------------------------------------------

- Email là duy nhất.
- So sánh email sau khi trim và lowercase.
- Không cho tạo hai tài khoản chỉ khác chữ hoa chữ thường.
- Khi cập nhật, cho phép giữ nguyên email của chính user.
- Nếu email thuộc user khác, trả 409.

Error code:

EMAIL_ALREADY_EXISTS

---

6.2. Department
--------------------------------------------------

- Department phải tồn tại.
- Không cho gán user vào department không tồn tại.
- Nếu department là bắt buộc theo Prisma schema, không cho null.
- Không tự động tạo department trong Users service.

Error code:

DEPARTMENT_NOT_FOUND

---

6.3. Role
--------------------------------------------------

- Role phải hợp lệ.
- Không tin role từ session phía client.
- Chỉ ADMIN có quyền thay đổi role.
- Không cho người dùng tự nâng role.

Error code:

INVALID_USER_ROLE
hoặc
INSUFFICIENT_ROLE

---

6.4. Trạng thái tài khoản
--------------------------------------------------

- ACTIVE: được phép đăng nhập và sử dụng hệ thống.
- INACTIVE: không được sử dụng hệ thống.
- LOCKED: không được sử dụng hệ thống.

Khi khóa hoặc vô hiệu hóa tài khoản:

- Các request mới phải bị từ chối.
- Nếu session vẫn còn hiệu lực, các thao tác quan trọng phải kiểm tra lại status trong database theo kiến trúc Authentication hiện tại.

---

6.5. Bảo vệ ADMIN cuối cùng
--------------------------------------------------

Không cho phép:

- Khóa ADMIN ACTIVE cuối cùng.
- Chuyển role của ADMIN ACTIVE cuối cùng sang role khác.
- Vô hiệu hóa ADMIN ACTIVE cuối cùng.

Error code:

CANNOT_DISABLE_LAST_ADMIN
hoặc dùng code đã quy định trong API.md:

CANNOT_LOCK_LAST_ADMIN

Hãy chọn một error code thống nhất và cập nhật tài liệu nếu implementation khác API.md.

---

6.6. ADMIN tự khóa tài khoản
--------------------------------------------------

Ưu tiên không cho ADMIN tự khóa hoặc vô hiệu hóa chính mình trong cùng session.

Error code:

CANNOT_DISABLE_CURRENT_USER

Nếu requirement hiện tại cho phép, phải nêu rõ lý do.

---

6.7. Xóa người dùng
--------------------------------------------------

Không triển khai DELETE /api/users/:userId trong nhiệm vụ này.

Trong MVP, dùng trạng thái:

- INACTIVE
- LOCKED

Không xóa vật lý user vì có thể liên quan đến:

- Project
- Task
- Comment
- Activity Log

---

6.8. Password
--------------------------------------------------

- Hash bằng thư viện đang dùng trong Authentication, ví dụ bcryptjs.
- Không tự thêm thư viện hash khác.
- Không lưu plain password.
- Không trả passwordHash.
- Không ghi password vào console, log hoặc Activity Log.
- Không cho API trả mật khẩu tạm sau khi lưu, trừ khi hệ thống có flow rõ ràng và được yêu cầu riêng.

================================================== 7. POLICY
==================================================

Tạo các hàm policy phù hợp:

- canListUsers(actor)
- canCreateUser(actor)
- canViewUser(actor, targetUser)
- canUpdateUser(actor, targetUser)
- canChangeUserRole(actor, targetUser)
- canChangeUserStatus(actor, targetUser)
- canResetUserPassword(actor, targetUser)
- canChangeOwnPassword(actor, targetUserId)

Policy không thực hiện Prisma query nếu convention hiện tại không cho phép.

Policy chỉ đánh giá quyền dựa trên actor và resource đã được service tải lên.

================================================== 8. REPOSITORY
==================================================

Tạo các hàm tối thiểu:

- findUsers()
- countUsers()
- findUserById()
- findUserByEmail()
- findUserByEmailExcludingId()
- createUserRecord()
- updateUserRecord()
- updateUserStatusRecord()
- updateUserPasswordRecord()
- countActiveAdmins()
- findDepartmentById() hoặc dùng Department repository hiện tại

Repository chỉ truy cập database.

Repository không quyết định:

- Actor có quyền hay không.
- Có được khóa ADMIN cuối cùng hay không.
- Có được đổi role hay không.
- Mật khẩu hiện tại đúng hay không.

================================================== 9. SERVICE
==================================================

Tạo các use case:

- listUsers()
- getUserById()
- createUser()
- updateUser()
- updateUserStatus()
- changeOwnPassword()
- resetUserPassword()

---

9.1. listUsers
--------------------------------------------------

Luồng:

1. Kiểm tra actor ACTIVE.
2. Kiểm tra quyền ADMIN.
3. Chuẩn hóa filter.
4. Gọi repository.
5. Map kết quả.
6. Trả pagination.

Không trả passwordHash.

---

9.2. createUser
--------------------------------------------------

Luồng:

1. Kiểm tra actor.
2. Kiểm tra quyền ADMIN.
3. Chuẩn hóa email.
4. Kiểm tra email trùng.
5. Kiểm tra Department.
6. Hash password.
7. Chạy transaction:
   - Tạo user.
   - Tạo Activity Log.
8. Map response.
9. Không trả passwordHash.

Activity Log ví dụ:

action: USER_CREATED
entityType: USER
entityId: userId
newValue:
{
"name": "...",
"email": "...",
"role": "MEMBER",
"status": "ACTIVE",
"departmentId": "..."
}

Không log password.

---

9.3. updateUser
--------------------------------------------------

Luồng:

1. Kiểm tra actor ADMIN.
2. Tải target user.
3. Kiểm tra target tồn tại.
4. Kiểm tra quyền.
5. Nếu cập nhật email:
   - Chuẩn hóa.
   - Kiểm tra trùng với user khác.
6. Nếu cập nhật department:
   - Kiểm tra department tồn tại.
7. Nếu cập nhật role:
   - Không làm mất ADMIN ACTIVE cuối cùng.
8. Transaction:
   - Cập nhật user.
   - Ghi Activity Log với oldValue và newValue.
9. Map response.

Chỉ ghi các field thực sự thay đổi vào Activity Log nếu có thể.

---

9.4. updateUserStatus
--------------------------------------------------

Luồng:

1. Kiểm tra actor ADMIN.
2. Tải target user.
3. Kiểm tra target tồn tại.
4. Không cho actor tự khóa nếu policy quy định.
5. Nếu target là ADMIN ACTIVE:
   - Kiểm tra còn ADMIN ACTIVE khác hay không.
6. Transaction:
   - Cập nhật status.
   - Ghi Activity Log.
7. Trả user đã map.

Activity action:

USER_STATUS_CHANGED

---

9.5. changeOwnPassword
--------------------------------------------------

Luồng:

1. Lấy userId từ session.
2. Tải user kèm passwordHash.
3. Kiểm tra tài khoản ACTIVE.
4. So sánh currentPassword.
5. Nếu sai, trả lỗi chung phù hợp.
6. Hash newPassword.
7. Transaction:
   - Cập nhật passwordHash.
   - Ghi Activity Log không chứa mật khẩu.
8. Trả response không chứa dữ liệu nhạy cảm.

Error code:

CURRENT_PASSWORD_INVALID

---

9.6. resetUserPassword
--------------------------------------------------

Luồng:

1. Chỉ ADMIN.
2. Kiểm tra target user.
3. Hash newPassword.
4. Transaction:
   - Cập nhật passwordHash.
   - Ghi Activity Log.
5. Không trả password.
6. Không log password.

Activity action:

USER_PASSWORD_RESET

================================================== 10. USER MAPPER
==================================================

Tạo mapper tách riêng.

Response danh sách dự kiến:

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
"createdAt": "2026-07-22T00:00:00.000Z",
"updatedAt": "2026-07-22T00:00:00.000Z"
}

Không trả:

- password
- passwordHash
- session token
- secret
- relation không cần thiết

================================================== 11. ROUTE HANDLERS
==================================================

Route Handler chỉ làm:

1. Đọc session.
2. Parse params/query/body.
3. Validate Zod.
4. Gọi service.
5. Trả response chuẩn.
6. Chuyển AppError thành HTTP response.

Không đặt trong Route Handler:

- Prisma query dài.
- Hash password.
- Logic ADMIN cuối cùng.
- Transaction.
- Logic tạo Activity Log.
- Business rule.

================================================== 12. RESPONSE API
==================================================

Danh sách:

{
"data": [],
"pagination": {
"page": 1,
"pageSize": 20,
"totalItems": 100,
"totalPages": 5
}
}

Tạo mới:

HTTP 201

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
}
},
"message": "Tạo người dùng thành công."
}

Cập nhật:

HTTP 200

{
"data": {},
"message": "Cập nhật người dùng thành công."
}

Đổi trạng thái:

{
"data": {
"id": "user-id",
"status": "LOCKED"
},
"message": "Cập nhật trạng thái tài khoản thành công."
}

Đổi mật khẩu:

{
"data": null,
"message": "Đổi mật khẩu thành công."
}

================================================== 13. ERROR CODES
==================================================

Sử dụng hoặc bổ sung các code:

AUTHENTICATION_REQUIRED
ACCOUNT_INACTIVE
ACCOUNT_LOCKED
FORBIDDEN
USER_NOT_FOUND
EMAIL_ALREADY_EXISTS
INVALID_USER_ROLE
DEPARTMENT_NOT_FOUND
CURRENT_PASSWORD_INVALID
CANNOT_LOCK_LAST_ADMIN
CANNOT_DISABLE_CURRENT_USER
VALIDATION_ERROR
INTERNAL_SERVER_ERROR

HTTP mapping:

- 400: Validation sai.
- 401: Chưa đăng nhập.
- 403: Không có quyền hoặc tài khoản không hoạt động.
- 404: User hoặc Department không tồn tại.
- 409: Email trùng hoặc xung đột ADMIN cuối cùng.
- 422: Business rule không hợp lệ.
- 500: Lỗi hệ thống.

Không trả raw Prisma error.

================================================== 14. ACTIVITY LOG
==================================================

Ghi log cho:

- USER_CREATED
- USER_UPDATED
- USER_ROLE_CHANGED
- USER_STATUS_CHANGED
- USER_PASSWORD_CHANGED
- USER_PASSWORD_RESET

Có thể dùng action thống nhất với schema hiện tại.

Không ghi:

- Plain password.
- Password hash.
- Session token.
- Secret.

actorId phải lấy từ session.

================================================== 15. TRANSACTION
==================================================

Dùng transaction khi:

- Tạo user + Activity Log.
- Cập nhật user + Activity Log.
- Đổi role + Activity Log.
- Đổi status + Activity Log.
- Đổi/reset password + Activity Log.

Nếu log thất bại, thay đổi chính phải rollback nếu kiến trúc hiện tại yêu cầu log là bắt buộc.

================================================== 16. TESTING
==================================================

Viết test theo hệ thống test hiện tại.

Các trường hợp tối thiểu:

Danh sách:
[ ] ADMIN xem danh sách thành công
[ ] MANAGER bị 403
[ ] MEMBER bị 403
[ ] Người chưa đăng nhập bị 401
[ ] Search theo tên hoặc email
[ ] Lọc theo role
[ ] Lọc theo status
[ ] Lọc theo department
[ ] Pagination đúng
[ ] Không trả passwordHash

Tạo user:
[ ] ADMIN tạo user thành công
[ ] MANAGER bị 403
[ ] MEMBER bị 403
[ ] Email được lowercase
[ ] Email trùng trả 409
[ ] Department không tồn tại trả 404
[ ] Password được hash
[ ] Response không có passwordHash
[ ] Activity Log được tạo
[ ] Transaction rollback khi log thất bại

Cập nhật:
[ ] ADMIN cập nhật tên thành công
[ ] ADMIN cập nhật email thành công
[ ] Email trùng user khác trả 409
[ ] Department không tồn tại trả 404
[ ] Role không hợp lệ trả 400
[ ] Không cho mất ADMIN ACTIVE cuối cùng
[ ] Activity Log lưu oldValue và newValue

Status:
[ ] ADMIN khóa user thành công
[ ] ADMIN mở khóa user thành công
[ ] Không cho khóa ADMIN ACTIVE cuối cùng
[ ] Không cho ADMIN tự khóa nếu policy áp dụng
[ ] MANAGER bị 403
[ ] Activity Log được tạo

Password:
[ ] User đổi mật khẩu đúng currentPassword
[ ] Sai currentPassword bị từ chối
[ ] User không đổi mật khẩu người khác
[ ] ADMIN reset mật khẩu thành công
[ ] Password mới được hash
[ ] Không log password
[ ] Response không có passwordHash

================================================== 17. NHỮNG ĐIỀU KHÔNG ĐƯỢC LÀM
==================================================

- Không xây UI.
- Không sửa Prisma schema nếu không bắt buộc.
- Không tạo migration nếu schema hiện tại đã đủ.
- Không triển khai xóa user vật lý.
- Không trả passwordHash.
- Không log password.
- Không nhận actorId từ frontend.
- Không nhận createdById từ frontend.
- Không đặt Prisma trong Route Handler nếu kiến trúc yêu cầu repository.
- Không đặt business logic trong Route Handler.
- Không dùng `any`.
- Không thêm package mới nếu không cần thiết.
- Không sửa Authentication ngoài phạm vi cần thiết.
- Không refactor Departments hoặc Projects.
- Không tự động logout toàn bộ session nếu chưa có cơ chế được thiết kế.
- Không bổ sung email invitation hoặc gửi email trong nhiệm vụ này.

================================================== 18. TRÌNH TỰ THỰC HIỆN
==================================================

Trước khi code:

1. Đọc toàn bộ tài liệu.
2. Kiểm tra Prisma User model.
3. Kiểm tra enum UserRole và UserStatus.
4. Kiểm tra quan hệ User với Department.
5. Kiểm tra Authentication và SessionUser.
6. Kiểm tra cách hash password đang dùng.
7. Kiểm tra ActivityLog schema.
8. Kiểm tra pattern của Departments module.
9. Đề xuất kế hoạch.
10. Liệt kê file tạo hoặc sửa.
11. Nêu rõ điểm nào chưa khớp giữa docs và code.
12. Không sửa code cho tới khi đã hiểu repository.

Trong khi code:

1. Tạo types.
2. Tạo schema.
3. Tạo policy.
4. Tạo repository.
5. Tạo mapper.
6. Tạo service.
7. Tạo Route Handler.
8. Viết tests.
9. Cập nhật API.md nếu implementation khác tài liệu.

================================================== 19. DEFINITION OF DONE
==================================================

[ ] GET /api/users hoạt động
[ ] POST /api/users hoạt động
[ ] GET /api/users/:userId hoạt động
[ ] PATCH /api/users/:userId hoạt động
[ ] PATCH /api/users/:userId/status hoạt động
[ ] PATCH /api/users/:userId/password hoạt động
[ ] Authentication được kiểm tra
[ ] Authorization được kiểm tra
[ ] Email được chuẩn hóa
[ ] Email không trùng
[ ] Department được kiểm tra
[ ] Password được hash
[ ] Không trả passwordHash
[ ] Không làm mất ADMIN cuối cùng
[ ] Có Activity Log
[ ] Có transaction
[ ] Có validation
[ ] Có error handling chuẩn
[ ] Không dùng any
[ ] Test thành công
[ ] pnpm lint thành công
[ ] pnpm exec tsc --noEmit thành công
[ ] pnpm test thành công
[ ] pnpm build thành công

================================================== 20. BÁO CÁO SAU KHI HOÀN THÀNH
==================================================

Báo cáo:

1. File đã tạo.
2. File đã sửa.
3. Endpoint đã hoàn thành.
4. Business rule đã triển khai.
5. Cách bảo vệ ADMIN cuối cùng.
6. Cách chuẩn hóa email.
7. Cách hash mật khẩu.
8. Cách ghi Activity Log.
9. Test đã viết.
10. Kết quả lint.
11. Kết quả type-check.
12. Kết quả test.
13. Kết quả build.
14. Phần khác với docs.
15. Rủi ro hoặc phần chưa xác minh.
