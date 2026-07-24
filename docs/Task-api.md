Đọc kỹ toàn bộ tài liệu và code hiện tại trước khi sửa:

- AGENTS.md
- docs/PRODUCT.md
- docs/REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DATABASE.md
- docs/API.md

Ngoài ra, phải kiểm tra implementation thực tế của:

- Authentication
- SessionUser
- Users module
- Projects module
- Project Members module
- Activity Log
- AppError
- API response helpers
- Prisma schema
- Cách tổ chức repository, service, policy, mapper và test hiện tại

Mục tiêu:
Triển khai hoàn chỉnh backend và API cho module Tasks của LYDINC TaskHub.

Không xây dựng UI trong nhiệm vụ này.

==================================================

1. DEPENDENCY BẮT BUỘC
   \==================================================

Trước khi code, phải xác minh:

1. Project model đã tồn tại.
2. User model đã tồn tại.
3. Quan hệ Project Member đã tồn tại.
4. Có cách xác định một user có thuộc project hay không.
5. Có cách xác định Project Manager.
6. Có enum TaskStatus và TaskPriority hoặc cấu trúc tương đương.
7. Có ActivityLog hoặc cơ chế audit tương đương.

Nếu Project Members chưa tồn tại:

- Không được bỏ qua business rule kiểm tra thành viên dự án.
- Không được tự gán mọi user vào mọi project.
- Không được hard-code quyền.
- Hãy dừng ở bước phân tích và báo dependency backend còn thiếu.
- Đề xuất rõ module Project Members cần được hoàn thành trước.

================================================== 2. PHẠM VI API
==================================================

Triển khai các endpoint:

GET /api/tasks
POST /api/tasks
GET /api/tasks/:taskId
PATCH /api/tasks/:taskId
PATCH /api/tasks/:taskId/status
PATCH /api/tasks/:taskId/assignee
DELETE /api/tasks/:taskId

Có thể bổ sung endpoint:

GET /api/projects/:projectId/tasks

chỉ khi routing và API contract hiện tại đã quy định theo project.

Không tự ý tạo cả hai kiểu endpoint trùng chức năng nếu không cần thiết.

================================================== 3. PHẠM VI NGHIỆP VỤ
==================================================

Task cần hỗ trợ tối thiểu:

- Thuộc một Project.
- Có tiêu đề.
- Có mô tả.
- Có trạng thái.
- Có độ ưu tiên.
- Có người được giao.
- Có người tạo.
- Có ngày bắt đầu nếu schema hỗ trợ.
- Có hạn hoàn thành.
- Có ngày hoàn thành.
- Có thứ tự hoặc position nếu schema hiện tại hỗ trợ.
- Có Activity Log khi thay đổi.

Không triển khai trong scope này:

- Subtask.
- Checklist.
- File attachment.
- Comment.
- Dependency giữa task.
- Recurring task.
- Time tracking.
- Automation.
- Notification.
- Kanban drag-and-drop backend.
- Bulk update.
- Task template.

================================================== 4. CẤU TRÚC MODULE ĐỀ XUẤT
==================================================

Kiểm tra convention hiện tại trước khi tạo file.

Đề xuất:

src/modules/tasks/
├── task.types.ts
├── task.schema.ts
├── task.policy.ts
├── task.repository.ts
├── task.service.ts
├── task.mapper.ts
├── task.errors.ts
└── task.test.ts

Route:

src/app/api/tasks/
├── route.ts
└── [taskId]/
├── route.ts
├── status/
│ └── route.ts
└── assignee/
└── route.ts

Nếu project dùng nested route:

src/app/api/projects/[projectId]/tasks/route.ts

phải tuân thủ API.md và cấu trúc hiện tại.

================================================== 5. TASK TYPES
==================================================

Tạo type rõ ràng cho:

- TaskListQuery
- CreateTaskInput
- UpdateTaskInput
- ChangeTaskStatusInput
- ChangeTaskAssigneeInput
- TaskListItem
- TaskDetail
- TaskStatus
- TaskPriority
- PaginatedTasks

Không dùng `any`.

Không dùng trực tiếp Prisma Task type làm response nếu chứa foreign key hoặc field nội bộ không cần thiết.

================================================== 6. VALIDATION BẰNG ZOD
==================================================

Tạo schema tối thiểu:

- taskIdParamsSchema
- taskListQuerySchema
- createTaskSchema
- updateTaskSchema
- changeTaskStatusSchema
- changeTaskAssigneeSchema

---

6.1. Query danh sách
--------------------------------------------------

Hỗ trợ:

- page
- pageSize
- search
- projectId
- assigneeId
- createdById nếu API cho phép
- status
- priority
- dueFrom
- dueTo
- overdue
- sortBy
- sortOrder

Quy tắc:

- page mặc định 1.
- pageSize mặc định 20.
- pageSize tối đa 100.
- search được trim.
- status thuộc enum hợp lệ.
- priority thuộc enum hợp lệ.
- sortOrder chỉ asc hoặc desc.
- sortBy chỉ nhận allowlist.

Sort field có thể gồm:

- title
- status
- priority
- dueDate
- createdAt
- updatedAt

Không truyền sort field chưa kiểm soát trực tiếp vào Prisma.

---

6.2. Tạo task
--------------------------------------------------

Request dự kiến:

{
"projectId": "project-id",
"title": "Thiết kế giao diện trang chủ",
"description": "Hoàn thiện giao diện responsive.",
"assigneeId": "user-id",
"priority": "HIGH",
"startDate": "2026-07-24",
"dueDate": "2026-07-30"
}

Validation:

projectId:

- Bắt buộc.
- Project phải tồn tại.

title:

- Bắt buộc.
- Trim.
- Tối đa theo schema hiện tại, đề xuất 200 ký tự.

description:

- Không bắt buộc.
- Tối đa theo schema hiện tại.

assigneeId:

- Có thể bắt buộc hoặc nullable theo requirement hiện tại.
- Nếu có, user phải tồn tại.
- User phải là thành viên của project.

priority:

- Thuộc enum hợp lệ.
- Có thể mặc định MEDIUM nếu backend quy định.

status:

- Không nhận từ client khi tạo nếu backend luôn mặc định TODO.
- Nếu được nhận, chỉ cho trạng thái khởi tạo hợp lệ.

startDate và dueDate:

- Nếu cả hai có giá trị: startDate <= dueDate.
- Không làm lệch ngày do timezone.

Không nhận:

- id
- createdById
- actorId
- completedAt
- createdAt
- updatedAt
- project relation
- assignee relation
- activity logs

---

6.3. Cập nhật task
--------------------------------------------------

Cho phép cập nhật:

- title
- description
- priority
- startDate
- dueDate

Có thể cho phép assigneeId trong endpoint chung nếu API.md hiện tại quy định.

Nếu đã có endpoint riêng `/assignee`, không cập nhật assignee qua endpoint chung.

Không cập nhật status qua endpoint chung nếu đã có `/status`.

Ít nhất một field phải được gửi.

---

6.4. Đổi trạng thái
--------------------------------------------------

Request:

{
"status": "IN_PROGRESS"
}

Chỉ nhận trạng thái hợp lệ.

---

6.5. Đổi người được giao
--------------------------------------------------

Request:

{
"assigneeId": "user-id"
}

Nếu cho phép bỏ giao việc:

{
"assigneeId": null
}

phải phù hợp Prisma schema và requirement hiện tại.

================================================== 7. TASK STATUS
==================================================

Ưu tiên dùng enum đã có trong Prisma.

Nếu chưa có tài liệu rõ, đề xuất:

- TODO
- IN_PROGRESS
- IN_REVIEW
- DONE
- CANCELLED

Không tự thêm enum nếu Prisma schema hiện tại khác.

Mapping nghiệp vụ:

TODO
→ Chưa thực hiện

IN_PROGRESS
→ Đang thực hiện

IN_REVIEW
→ Chờ đánh giá

DONE
→ Hoàn thành

CANCELLED
→ Đã hủy

Phải có transition hợp lệ.

Ví dụ đề xuất:

TODO:

- IN_PROGRESS
- CANCELLED

IN_PROGRESS:

- TODO
- IN_REVIEW
- DONE
- CANCELLED

IN_REVIEW:

- IN_PROGRESS
- DONE
- CANCELLED

DONE:

- IN_PROGRESS nếu business cho phép mở lại

CANCELLED:

- TODO nếu business cho phép khôi phục

Không hard-code transition trái với docs hoặc backend hiện tại.

================================================== 8. TASK PRIORITY
==================================================

Ưu tiên enum hiện tại.

Nếu chưa có, đề xuất:

- LOW
- MEDIUM
- HIGH
- URGENT

Mặc định:

MEDIUM

Không hiển thị hoặc xử lý giá trị ngoài enum.

================================================== 9. QUYỀN TRUY CẬP
==================================================

GET /api/tasks

ADMIN:

- Xem tất cả task.

MANAGER:

- Xem task trong project mình quản lý hoặc tham gia.

MEMBER:

- Xem task trong project mình tham gia.
- Có thể giới hạn mặc định vào task được giao nếu requirement quy định, nhưng phải tuân thủ API.md.

POST /api/tasks

ADMIN:

- Tạo task trong mọi project.

Project Manager:

- Tạo task trong project mình quản lý.

MANAGER hoặc MEMBER chỉ là thành viên:

- Không được tạo nếu policy hiện tại không cho phép.

PATCH /api/tasks/:taskId

ADMIN:

- Cập nhật mọi task.

Project Manager:

- Cập nhật task trong project mình quản lý.

Assignee:

- Chỉ được cập nhật một số field nếu requirement cho phép.
- Không được tự đổi assignee, project hoặc priority nếu chưa có rule rõ.

PATCH status:

ADMIN:

- Được đổi trạng thái.

Project Manager:

- Được đổi trạng thái task trong project.

Assignee:

- Được đổi trạng thái task được giao, theo transition hợp lệ.

PATCH assignee:

ADMIN hoặc Project Manager.

DELETE:

- Chỉ ADMIN hoặc Project Manager.
- Assignee không được xóa task.

Mọi quyền phải kiểm tra phía server.

================================================== 10. BUSINESS RULES
==================================================

---

10.1. Project
--------------------------------------------------

- Project phải tồn tại.
- Project không được ở trạng thái CANCELLED nếu business không cho thêm task mới.
- Có thể không cho thêm task vào project COMPLETED.
- Phải tuân thủ rule hiện tại.

Error code:

PROJECT_NOT_FOUND
PROJECT_NOT_ACTIVE
PROJECT_CLOSED

---

10.2. Assignee
--------------------------------------------------

- User phải tồn tại.
- User phải ACTIVE.
- User phải là thành viên project.
- Không cho giao task cho user ngoài project.
- Không cho giao task cho user INACTIVE hoặc LOCKED.

Error code:

ASSIGNEE_NOT_FOUND
ASSIGNEE_NOT_PROJECT_MEMBER
ASSIGNEE_NOT_ACTIVE

---

10.3. Ngày
--------------------------------------------------

- startDate <= dueDate.
- Nếu task DONE, có thể set completedAt = thời điểm hiện tại.
- Nếu task rời khỏi DONE, xử lý completedAt theo rule:
  - đặt null nếu mở lại.
- Không nhận completedAt từ frontend.

Error code:

INVALID_TASK_DATE_RANGE

---

10.4. Task quá hạn
--------------------------------------------------

Task được xem là quá hạn khi:

- dueDate < thời điểm hiện tại hoặc ngày hiện tại theo convention.
- status không phải DONE.
- status không phải CANCELLED.

Không lưu field overdue nếu chỉ là dữ liệu suy ra, trừ khi schema hiện tại đã có.

---

10.5. Chuyển trạng thái DONE
--------------------------------------------------

Khi chuyển sang DONE:

- Set completedAt.
- Ghi Activity Log.
- Không tự hoàn thành project.

Khi mở lại:

- Set completedAt = null.

---

10.6. Xóa task
--------------------------------------------------

Nếu hệ thống hỗ trợ hard delete:

- Chỉ ADMIN hoặc Project Manager.
- Ghi Activity Log trong transaction nếu schema cho phép.
- Cân nhắc quan hệ comment sau này.

Nếu schema đã có soft delete:

- Dùng soft delete đúng convention.

Không tự thêm soft delete nếu schema chưa có.

================================================== 11. POLICY
==================================================

Tạo các hàm policy:

- canListTasks(actor)
- canViewTask(actor, taskContext)
- canCreateTask(actor, projectContext)
- canUpdateTask(actor, taskContext)
- canChangeTaskStatus(actor, taskContext)
- canChangeTaskAssignee(actor, taskContext)
- canDeleteTask(actor, taskContext)

`taskContext` có thể gồm:

- projectId
- projectManagerId
- assigneeId
- actor membership
- project status
- task status

Policy không truy cập Prisma nếu convention hiện tại không cho phép.

================================================== 12. REPOSITORY
==================================================

Tạo các hàm tối thiểu:

- findTasks()
- countTasks()
- findTaskById()
- createTaskRecord()
- updateTaskRecord()
- updateTaskStatusRecord()
- updateTaskAssigneeRecord()
- deleteTaskRecord()
- findProjectById()
- findUserById()
- findProjectMember()
- findProjectMembershipForActor()

Có thể tái sử dụng repository hiện tại thay vì tạo query trùng.

Repository chỉ truy cập database.

Repository không quyết định:

- Actor có quyền hay không.
- Assignee có được giao task hay không.
- Transition có hợp lệ hay không.
- Project có đóng hay không.

================================================== 13. SERVICE
==================================================

Tạo use case:

- listTasks()
- getTask()
- createTask()
- updateTask()
- changeTaskStatus()
- changeTaskAssignee()
- deleteTask()

---

13.1. listTasks
--------------------------------------------------

Luồng:

1. Kiểm tra actor ACTIVE.
2. Xác định phạm vi project actor được xem.
3. Áp dụng filter.
4. Query repository.
5. Map DTO.
6. Trả pagination.

Không để MEMBER dùng query để xem task ngoài project được phép.

---

13.2. getTask
--------------------------------------------------

1. Tải task và context.
2. Nếu không tồn tại → 404.
3. Kiểm tra actor có quyền xem.
4. Map detail response.
5. Không trả relation nội bộ thừa.

---

13.3. createTask
--------------------------------------------------

Luồng:

1. Kiểm tra actor.
2. Tải project.
3. Kiểm tra project tồn tại.
4. Kiểm tra quyền tạo task trong project.
5. Kiểm tra trạng thái project.
6. Nếu có assignee:
   - User tồn tại.
   - ACTIVE.
   - Là thành viên project.
7. Kiểm tra date range.
8. Xác định status khởi tạo.
9. Transaction:
   - Tạo task.
   - Tạo Activity Log.
10. Map response.

Activity:

TASK_CREATED

actorId lấy từ session.

---

13.4. updateTask
--------------------------------------------------

1. Tải task và project context.
2. Kiểm tra quyền.
3. Kiểm tra date range sau khi merge dữ liệu cũ và mới.
4. Không cho sửa field ngoài allowlist.
5. Transaction:
   - Update task.
   - Activity Log.
6. Ghi oldValue/newValue cho field thay đổi.

Activity:

TASK_UPDATED

---

13.5. changeTaskStatus
--------------------------------------------------

1. Tải task và context.
2. Kiểm tra quyền.
3. Kiểm tra transition hợp lệ.
4. Nếu chuyển DONE:
   - completedAt = now.
5. Nếu rời DONE:
   - completedAt = null.
6. Transaction:
   - Update status.
   - Activity Log.
7. Trả DTO.

Activity:

TASK_STATUS_CHANGED

---

13.6. changeTaskAssignee
--------------------------------------------------

1. Tải task và project.
2. Kiểm tra quyền ADMIN hoặc Project Manager.
3. Nếu assigneeId không null:
   - User tồn tại.
   - ACTIVE.
   - Là project member.
4. Transaction:
   - Update assignee.
   - Activity Log.
5. Trả DTO.

Activity:

TASK_ASSIGNEE_CHANGED

---

13.7. deleteTask
--------------------------------------------------

1. Tải task.
2. Kiểm tra quyền.
3. Xử lý relation nếu có.
4. Transaction:
   - Xóa hoặc soft delete.
   - Activity Log nếu cấu trúc dữ liệu cho phép.
5. Trả success response.

Activity:

TASK_DELETED

================================================== 14. MAPPER
==================================================

Task list DTO dự kiến:

{
"id": "task-id",
"title": "Thiết kế giao diện",
"description": "Mô tả ngắn",
"status": "IN_PROGRESS",
"priority": "HIGH",
"project": {
"id": "project-id",
"code": "ANGC-2026",
"name": "Website ANGC"
},
"assignee": {
"id": "user-id",
"name": "Nguyễn Văn A",
"email": "a@lydinc.local"
},
"startDate": "2026-07-24",
"dueDate": "2026-07-30",
"completedAt": null,
"isOverdue": false,
"createdAt": "2026-07-24T06:00:00.000Z",
"updatedAt": "2026-07-24T06:00:00.000Z"
}

Không trả:

- internal foreign keys thừa
- raw Prisma relation
- passwordHash
- actor internals
- dữ liệu session
- field nhạy cảm

================================================== 15. RESPONSE API
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

Tạo task:

HTTP 201

{
"data": {},
"message": "Tạo nhiệm vụ thành công."
}

Cập nhật:

{
"data": {},
"message": "Cập nhật nhiệm vụ thành công."
}

Đổi trạng thái:

{
"data": {},
"message": "Cập nhật trạng thái nhiệm vụ thành công."
}

Đổi assignee:

{
"data": {},
"message": "Cập nhật người thực hiện thành công."
}

Xóa:

{
"data": null,
"message": "Xóa nhiệm vụ thành công."
}

================================================== 16. ERROR CODES
==================================================

Sử dụng hoặc bổ sung:

AUTHENTICATION_REQUIRED
ACCOUNT_INACTIVE
ACCOUNT_LOCKED
FORBIDDEN
TASK_NOT_FOUND
PROJECT_NOT_FOUND
PROJECT_NOT_ACTIVE
PROJECT_CLOSED
ASSIGNEE_NOT_FOUND
ASSIGNEE_NOT_PROJECT_MEMBER
ASSIGNEE_NOT_ACTIVE
INVALID_TASK_STATUS
INVALID_TASK_STATUS_TRANSITION
INVALID_TASK_PRIORITY
INVALID_TASK_DATE_RANGE
VALIDATION_ERROR
INTERNAL_SERVER_ERROR

HTTP mapping:

- 400: Validation sai.
- 401: Chưa đăng nhập.
- 403: Không có quyền.
- 404: Task, Project hoặc User không tồn tại.
- 409: Xung đột trạng thái hoặc relation.
- 422: Business rule không hợp lệ.
- 500: Lỗi hệ thống.

Không trả raw Prisma error.

================================================== 17. ACTIVITY LOG
==================================================

Ghi log cho:

- TASK_CREATED
- TASK_UPDATED
- TASK_STATUS_CHANGED
- TASK_ASSIGNEE_CHANGED
- TASK_DELETED

Log cần có:

- actorId
- entityType = TASK
- entityId
- projectId nếu schema hỗ trợ
- oldValue
- newValue
- timestamp

Không ghi thông tin nhạy cảm.

================================================== 18. TRANSACTION
==================================================

Dùng transaction khi:

- Tạo task + Activity Log.
- Cập nhật task + Activity Log.
- Đổi status + Activity Log.
- Đổi assignee + Activity Log.
- Xóa task + Activity Log.

Nếu log là bắt buộc theo kiến trúc, thao tác chính phải rollback khi log thất bại.

================================================== 19. ROUTE HANDLER
==================================================

Route Handler chỉ làm:

1. Đọc session.
2. Parse params/query/body.
3. Validate bằng Zod.
4. Gọi service.
5. Trả response chuẩn.
6. Chuyển AppError thành HTTP response.

Không đặt:

- Prisma query.
- Permission logic dài.
- Status transition.
- Membership check.
- Transaction.
- Activity Log logic.
- Date business rule.

================================================== 20. TESTING
==================================================

Danh sách:

[ ] ADMIN xem toàn bộ task
[ ] MANAGER chỉ xem task thuộc project được phép
[ ] MEMBER không xem được task ngoài project
[ ] Search hoạt động
[ ] Filter project hoạt động
[ ] Filter assignee hoạt động
[ ] Filter status hoạt động
[ ] Filter priority hoạt động
[ ] Filter overdue hoạt động
[ ] Pagination đúng
[ ] Không trả dữ liệu nhạy cảm

Tạo:

[ ] ADMIN tạo task thành công
[ ] Project Manager tạo task thành công
[ ] MEMBER không có quyền bị 403
[ ] Project không tồn tại trả 404
[ ] Project đóng không cho tạo
[ ] Assignee không tồn tại trả 404
[ ] Assignee ngoài project bị từ chối
[ ] Assignee inactive bị từ chối
[ ] Date range sai bị từ chối
[ ] Activity Log được tạo
[ ] Transaction rollback khi log lỗi

Cập nhật:

[ ] ADMIN cập nhật task
[ ] Project Manager cập nhật task
[ ] Assignee chỉ sửa field được phép nếu business cho phép
[ ] Người ngoài project bị 403
[ ] Không cập nhật field ngoài allowlist
[ ] Date range kiểm tra sau khi merge
[ ] Activity Log có oldValue/newValue

Status:

[ ] Assignee đổi trạng thái task được giao
[ ] Project Manager đổi trạng thái
[ ] Transition hợp lệ thành công
[ ] Transition sai bị từ chối
[ ] Chuyển DONE set completedAt
[ ] Mở lại task xóa completedAt
[ ] Activity Log được tạo

Assignee:

[ ] ADMIN đổi assignee
[ ] Project Manager đổi assignee
[ ] Assignee không tự gán người khác
[ ] User ngoài project bị từ chối
[ ] User inactive bị từ chối
[ ] Activity Log được tạo

Delete:

[ ] ADMIN xóa task
[ ] Project Manager xóa task
[ ] MEMBER bị 403
[ ] Task không tồn tại trả 404
[ ] Activity Log được tạo
[ ] Transaction đúng

================================================== 21. NHỮNG ĐIỀU KHÔNG ĐƯỢC LÀM
==================================================

- Không xây UI.
- Không sửa Prisma schema nếu không thật sự bắt buộc.
- Không tạo migration nếu schema hiện tại đã đủ.
- Không bỏ qua Project Members.
- Không giao task cho user ngoài project.
- Không nhận actorId từ frontend.
- Không nhận completedAt từ frontend.
- Không trả raw Prisma type.
- Không dùng any.
- Không thêm comment.
- Không thêm file upload.
- Không thêm subtask.
- Không thêm notification.
- Không thêm Kanban backend.
- Không thêm time tracking.
- Không thêm bulk update.
- Không đặt business logic trong Route Handler.
- Không refactor module Projects hoặc Users không liên quan.
- Không cài package mới nếu không cần thiết.

================================================== 22. TRÌNH TỰ THỰC HIỆN
==================================================

Trước khi code:

1. Đọc toàn bộ tài liệu.
2. Kiểm tra Prisma Task model.
3. Kiểm tra TaskStatus và TaskPriority.
4. Kiểm tra Project model.
5. Kiểm tra Project Members.
6. Kiểm tra quyền Project Manager.
7. Kiểm tra SessionUser.
8. Kiểm tra ActivityLog.
9. Kiểm tra pattern module hiện tại.
10. Đối chiếu API.md và code.
11. Đề xuất kế hoạch.
12. Liệt kê file tạo/sửa.
13. Nêu dependency còn thiếu.
14. Chưa sửa code nếu Project Members chưa đủ.

Trong khi code:

1. Tạo types.
2. Tạo schemas.
3. Tạo policy.
4. Tạo repository.
5. Tạo mapper.
6. Tạo service.
7. Tạo route.
8. Viết test.
9. Cập nhật API.md nếu cần.

================================================== 23. DEFINITION OF DONE
==================================================

[ ] GET /api/tasks hoạt động
[ ] POST /api/tasks hoạt động
[ ] GET /api/tasks/:taskId hoạt động
[ ] PATCH /api/tasks/:taskId hoạt động
[ ] PATCH /api/tasks/:taskId/status hoạt động
[ ] PATCH /api/tasks/:taskId/assignee hoạt động
[ ] DELETE /api/tasks/:taskId hoạt động
[ ] Có authentication
[ ] Có authorization
[ ] Có membership check
[ ] Có validation
[ ] Có status transition
[ ] Có priority validation
[ ] Có date validation
[ ] Có completedAt handling
[ ] Có Activity Log
[ ] Có transaction
[ ] Không trả dữ liệu nhạy cảm
[ ] Không dùng any
[ ] Test thành công
[ ] pnpm lint thành công
[ ] pnpm exec tsc --noEmit thành công
[ ] pnpm test thành công
[ ] pnpm build thành công

================================================== 24. BÁO CÁO SAU KHI HOÀN THÀNH
==================================================

Báo cáo:

1. File đã tạo.
2. File đã sửa.
3. Endpoint đã hoàn thành.
4. Permission đã triển khai.
5. Membership rule đã triển khai.
6. Status transition đã triển khai.
7. Cách xử lý completedAt.
8. Cách xử lý overdue.
9. Cách ghi Activity Log.
10. Test đã viết.
11. Kết quả lint.
12. Kết quả type-check.
13. Kết quả test.
14. Kết quả build.
15. Điểm khác giữa docs và code.
16. Dependency hoặc rủi ro còn lại.
