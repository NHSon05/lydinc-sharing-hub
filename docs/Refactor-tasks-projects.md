Đọc kỹ toàn bộ tài liệu và code hiện tại trước khi sửa:

- AGENTS.md
- docs/PRODUCT.md
- docs/REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DATABASE.md
- docs/API.md

Kiểm tra implementation thực tế của:

- Authentication
- SessionUser
- Departments module
- Users module
- Projects module
- Tasks module nếu đã tồn tại
- Activity Log
- Prisma schema
- AppError và API response helpers
- Design system hiện tại
- Cách tổ chức repository, service, policy, mapper và route handler

Mục tiêu:
Hoàn thiện luồng quản lý dự án của LYDINC TaskHub theo cấu trúc:

1. Khi tạo hoặc chỉnh sửa dự án, có thể thêm người dùng vào dự án.
2. Có thể quản lý danh sách thành viên của từng dự án.
3. Mỗi Task phải thuộc một Project.
4. Người phụ trách Task phải là thành viên của Project đó.
5. Có đầy đủ chức năng thêm, chỉnh sửa và xóa cho:
   - Project Members.
   - Tasks.
6. Tất cả thao tác phải được kiểm tra quyền phía backend.
7. UI phải tích hợp API thật, không dùng dữ liệu hard-code.

==================================================

1. MÔ HÌNH NGHIỆP VỤ
   \==================================================

Quan hệ chính:

Project
→ có nhiều ProjectMember

User
→ có thể tham gia nhiều Project thông qua ProjectMember

Project
→ có nhiều Task

Task
→ thuộc đúng một Project

Task
→ có thể được giao cho một User

Quy tắc bắt buộc:

- User được giao Task phải là ProjectMember của Project chứa Task.
- Không được giao Task cho user ngoài Project.
- Khi xóa một user khỏi Project, phải xử lý các Task đang được giao cho user đó.
- Không được để Task giữ assignee không còn là thành viên Project.
- Không lấy toàn bộ Users làm danh sách assignee cho Task.
- Assignee selector chỉ lấy Project Members.

================================================== 2. PROJECT MEMBER MODEL
==================================================

Kiểm tra Prisma schema hiện tại.

Mô hình đề xuất:

ProjectMember {
id
projectId
userId
role
joinedAt
createdAt
updatedAt
}

ProjectMemberRole đề xuất:

- OWNER
- MANAGER
- MEMBER
- VIEWER

Nếu schema hiện tại chỉ có:

- MANAGER
- MEMBER

thì giữ nguyên enum hiện tại, không tự tạo migration khi chưa được yêu cầu.

Ràng buộc bắt buộc:

- Một user chỉ xuất hiện một lần trong một project.
- Unique composite:

  projectId + userId

- Project Manager chính phải là thành viên dự án.
- Nếu Project model đã có managerId, khi tạo Project cần đồng bộ manager vào ProjectMember theo role phù hợp.
- Không cho thêm cùng một user hai lần.

================================================== 3. API PROJECT MEMBERS
==================================================

Triển khai hoặc hoàn thiện:

GET /api/projects/:projectId/members
POST /api/projects/:projectId/members
PATCH /api/projects/:projectId/members/:memberId
DELETE /api/projects/:projectId/members/:memberId

Có thể dùng userId thay memberId nếu API.md hiện tại quy định:

PATCH /api/projects/:projectId/members/:userId
DELETE /api/projects/:projectId/members/:userId

Chỉ chọn một convention thống nhất.

---

3.1. GET danh sách thành viên
--------------------------------------------------

Response dự kiến:

{
"data": [
{
"id": "project-member-id",
"role": "MEMBER",
"joinedAt": "2026-07-24T00:00:00.000Z",
"user": {
"id": "user-id",
"name": "Nguyễn Văn A",
"email": "a@lydinc.local",
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

Không trả:

- passwordHash
- session
- token
- relation nội bộ không cần thiết

---

3.2. POST thêm thành viên
--------------------------------------------------

Request:

{
"userId": "user-id",
"role": "MEMBER"
}

Validation:

- Project phải tồn tại.
- User phải tồn tại.
- User phải ACTIVE.
- User chưa thuộc Project.
- Role phải hợp lệ.
- Không nhận actorId từ frontend.

Error codes:

PROJECT_NOT_FOUND
USER_NOT_FOUND
USER_NOT_ACTIVE
PROJECT_MEMBER_ALREADY_EXISTS
INVALID_PROJECT_MEMBER_ROLE

---

3.3. PATCH chỉnh sửa thành viên
--------------------------------------------------

Request:

{
"role": "MANAGER"
}

Chỉ cho cập nhật các field được phép.

Không cho:

- Đổi userId.
- Đổi projectId.
- Nhận actorId.
- Nhận joinedAt từ frontend.

Quy tắc:

- Không được hạ quyền hoặc xóa Project Owner/Manager cuối cùng nếu hệ thống yêu cầu Project luôn có người quản lý.
- Nếu thay đổi Project Manager chính, phải cập nhật nhất quán với `Project.managerId`.
- Nếu Project model chỉ cho một manager, không được tạo nhiều manager trái schema.

---

3.4. DELETE thành viên
--------------------------------------------------

Trước khi xóa thành viên khỏi Project, phải kiểm tra Task đang được giao cho user đó.

Nếu thành viên không có Task đang phụ trách:

- Cho phép xóa.

Nếu thành viên đang có Task chưa hoàn thành:

Ưu tiên trả lỗi:

PROJECT_MEMBER_HAS_ASSIGNED_TASKS

Response có thể gồm:

{
"error": {
"code": "PROJECT_MEMBER_HAS_ASSIGNED_TASKS",
"message": "Thành viên đang phụ trách nhiệm vụ trong dự án.",
"details": {
"assignedTaskCount": 3
}
}
}

Không tự động xóa Task.

Không tự động chuyển Task cho user khác.

Có thể cho phép bỏ gán các Task trước khi xóa thành viên thông qua một thao tác riêng, nhưng không thực hiện ngầm.

Nếu chỉ còn Project Manager cuối cùng:

PROJECT_REQUIRES_MANAGER

================================================== 4. TẠO PROJECT KÈM THÀNH VIÊN
==================================================

Mở rộng form và API tạo Project để có thể nhận danh sách thành viên ban đầu.

Request dự kiến:

{
"code": "ANGC-2026",
"name": "Website ANGC 2026",
"description": "Xây dựng website cuộc thi.",
"departmentId": "department-id",
"managerId": "manager-user-id",
"startDate": "2026-07-24",
"endDate": "2026-08-30",
"members": [
{
"userId": "manager-user-id",
"role": "MANAGER"
},
{
"userId": "member-user-id",
"role": "MEMBER"
}
]
}

Nếu không muốn thay đổi POST /api/projects hiện tại, có thể triển khai UI theo hai bước:

1. POST /api/projects.
2. POST từng Project Member hoặc dùng endpoint batch.

Ưu tiên một transaction backend duy nhất nếu API và architecture hiện tại cho phép.

Luồng tạo Project:

1. Kiểm tra actor có quyền.
2. Validate thông tin Project.
3. Kiểm tra Department.
4. Kiểm tra Manager.
5. Kiểm tra danh sách member.
6. Loại bỏ user trùng.
7. Bảo đảm manager nằm trong danh sách member.
8. Transaction:
   - Tạo Project.
   - Tạo Project Members.
   - Ghi Activity Log cho Project.
   - Ghi Activity Log thành viên nếu cần.
9. Nếu một phần thất bại, rollback toàn bộ.

Không để xảy ra tình trạng:

- Project được tạo nhưng member chưa được thêm.
- Manager không thuộc Project.
- Danh sách member bị thêm một phần.

================================================== 5. QUẢN LÝ THÀNH VIÊN TRÊN UI PROJECT
==================================================

Trang chi tiết:

/projects/[projectId]

Thêm section hoặc tab:

Thành viên dự án

Hiển thị:

- Họ tên.
- Email.
- Phòng ban.
- Vai trò hệ thống.
- Vai trò trong dự án.
- Trạng thái tài khoản.
- Ngày tham gia.
- Thao tác.

Các thao tác:

- Thêm thành viên.
- Chỉnh sửa vai trò.
- Xóa khỏi dự án.

---

5.1. Dialog thêm thành viên
--------------------------------------------------

Tiêu đề:

Thêm thành viên vào dự án

Field:

- Người dùng.
- Vai trò trong dự án.

Danh sách người dùng:

- Chỉ hiển thị user ACTIVE.
- Không hiển thị user đã thuộc dự án.
- Có search theo tên hoặc email.
- Không hard-code dữ liệu.
- Dùng endpoint backend phù hợp.

Nếu Users API hiện tại chỉ ADMIN truy cập nhưng Project Manager được thêm thành viên:

- Backend cần endpoint scoped riêng, ví dụ:

  GET /api/projects/:projectId/member-candidates

- Không sử dụng API quản trị `/api/users` trái quyền.
- Không tự tạo endpoint trong phần UI.
- Báo dependency backend nếu chưa có.

---

5.2. Dialog chỉnh sửa thành viên
--------------------------------------------------

Tiêu đề:

Chỉnh sửa vai trò thành viên

Hiển thị:

- Họ tên.
- Email.
- Vai trò hiện tại.
- Select vai trò mới.

Không cho sửa:

- User.
- Project.
- Email.
- Role hệ thống.

---

5.3. Dialog xóa thành viên
--------------------------------------------------

Tiêu đề:

Xóa thành viên khỏi dự án

Nội dung:

Bạn có chắc chắn muốn xóa “{userName}” khỏi dự án này không?

Nếu có Task đang phụ trách:

Không thể xóa thành viên vì người này vẫn đang phụ trách {count} nhiệm vụ. Hãy chuyển người phụ trách hoặc bỏ phân công trước.

Dialog không được đóng khi API trả lỗi.

================================================== 6. TASK API
==================================================

Triển khai hoặc hoàn thiện:

GET /api/projects/:projectId/tasks
POST /api/projects/:projectId/tasks
GET /api/tasks/:taskId
PATCH /api/tasks/:taskId
PATCH /api/tasks/:taskId/status
PATCH /api/tasks/:taskId/assignee
DELETE /api/tasks/:taskId

Hoặc sử dụng:

GET /api/tasks?projectId=:projectId
POST /api/tasks

theo convention hiện tại.

Không tạo endpoint trùng chức năng nếu không cần.

================================================== 7. TẠO TASK
==================================================

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

Quy tắc:

- Project phải tồn tại.
- Actor phải có quyền tạo Task trong Project.
- Assignee phải tồn tại.
- Assignee phải ACTIVE.
- Assignee phải là ProjectMember.
- Không nhận createdById.
- createdById lấy từ session.
- Không nhận completedAt từ frontend.
- Trạng thái mặc định theo backend, ví dụ TODO.
- startDate phải nhỏ hơn hoặc bằng dueDate.

Error codes:

TASK_NOT_FOUND
PROJECT_NOT_FOUND
ASSIGNEE_NOT_FOUND
ASSIGNEE_NOT_ACTIVE
ASSIGNEE_NOT_PROJECT_MEMBER
INVALID_TASK_DATE_RANGE
FORBIDDEN

================================================== 8. CHỈNH SỬA TASK
==================================================

Cho phép cập nhật:

- title
- description
- priority
- startDate
- dueDate

Nếu assignee có endpoint riêng:

- Không cập nhật assignee trong PATCH chung.

Nếu status có endpoint riêng:

- Không cập nhật status trong PATCH chung.

Không cho cập nhật:

- projectId
- createdById
- completedAt
- createdAt
- updatedAt
- actorId

Khi cập nhật ngày:

- Merge dữ liệu cũ và mới.
- Sau đó kiểm tra startDate <= dueDate.

================================================== 9. ĐỔI NGƯỜI PHỤ TRÁCH TASK
==================================================

Endpoint:

PATCH /api/tasks/:taskId/assignee

Request:

{
"assigneeId": "user-id"
}

Hoặc:

{
"assigneeId": null
}

nếu backend cho phép Task chưa phân công.

Quy tắc:

- Người mới phải là thành viên của chính Project chứa Task.
- User phải ACTIVE.
- Chỉ ADMIN hoặc Project Manager được đổi assignee.
- Không dùng user ngoài Project.
- Không lấy danh sách từ toàn bộ Users API trong UI.

================================================== 10. XÓA TASK
==================================================

Endpoint:

DELETE /api/tasks/:taskId

Quyền đề xuất:

- ADMIN.
- Project Manager của Project chứa Task.

Không cho:

- Assignee tự xóa Task nếu không phải Project Manager.
- Thành viên khác xóa Task.

Khi xóa:

- Kiểm tra Task tồn tại.
- Kiểm tra quyền.
- Xóa theo hard delete hoặc soft delete đúng schema hiện tại.
- Ghi Activity Log.
- Dùng transaction nếu Activity Log bắt buộc.

Không xóa Project hoặc Project Member liên quan.

================================================== 11. ACTIVITY LOG
==================================================

Ghi log cho:

- PROJECT_MEMBER_ADDED
- PROJECT_MEMBER_ROLE_CHANGED
- PROJECT_MEMBER_REMOVED
- TASK_CREATED
- TASK_UPDATED
- TASK_STATUS_CHANGED
- TASK_ASSIGNEE_CHANGED
- TASK_DELETED

Log cần có:

- actorId từ session.
- entityType.
- entityId.
- projectId nếu schema hỗ trợ.
- oldValue.
- newValue.

Không nhận actorId từ frontend.

================================================== 12. POLICY
==================================================

Project Member policy:

- canViewProjectMembers(actor, projectContext)
- canAddProjectMember(actor, projectContext)
- canUpdateProjectMember(actor, projectContext)
- canRemoveProjectMember(actor, projectContext)

Task policy:

- canViewTask(actor, taskContext)
- canCreateTask(actor, projectContext)
- canUpdateTask(actor, taskContext)
- canChangeTaskStatus(actor, taskContext)
- canChangeTaskAssignee(actor, taskContext)
- canDeleteTask(actor, taskContext)

Quyền đề xuất:

ADMIN:

- Toàn quyền.

Project Manager:

- Quản lý member và task trong project mình quản lý.

Project Member:

- Xem project.
- Xem task.
- Assignee có thể đổi trạng thái Task của mình nếu backend cho phép.
- Không thêm hoặc xóa member.
- Không đổi assignee.
- Không xóa Task.

================================================== 13. REPOSITORY
==================================================

Project Member repository:

- findProjectMembers(projectId)
- findProjectMember(projectId, userId)
- findProjectMemberById(memberId)
- createProjectMember()
- createManyProjectMembers()
- updateProjectMemberRole()
- deleteProjectMember()
- countProjectManagers()
- countAssignedTasks(projectId, userId)
- findMemberCandidates()

Task repository:

- findProjectTasks()
- findTaskById()
- createTaskRecord()
- updateTaskRecord()
- updateTaskStatusRecord()
- updateTaskAssigneeRecord()
- deleteTaskRecord()
- findProjectMembership(projectId, userId)

Repository chỉ truy cập database.

Không đặt permission hoặc business rule trong repository.

================================================== 14. SERVICE
==================================================

Project Member use cases:

- listProjectMembers()
- addProjectMember()
- updateProjectMemberRole()
- removeProjectMember()

Task use cases:

- listProjectTasks()
- createTask()
- updateTask()
- changeTaskStatus()
- changeTaskAssignee()
- deleteTask()

Mọi service phải:

1. Kiểm tra actor ACTIVE.
2. Tải resource.
3. Kiểm tra quyền.
4. Kiểm tra business rule.
5. Thực hiện transaction.
6. Ghi Activity Log.
7. Map DTO.
8. Không trả dữ liệu nhạy cảm.

================================================== 15. UI TRANG CHI TIẾT PROJECT
==================================================

Trang:

/projects/[projectId]

Bố cục đề xuất:

A. Header dự án

- Mã dự án.
- Tên dự án.
- Trạng thái.
- Người quản lý.
- Nút chỉnh sửa.
- Nút đổi trạng thái.

B. Thống kê

- Tổng thành viên.
- Tổng nhiệm vụ.
- Nhiệm vụ hoàn thành.
- Tiến độ.

C. Tabs

1. Tổng quan
2. Thành viên
3. Nhiệm vụ
4. Hoạt động nếu đã có

Không cần tạo Activity Logs UI nếu chưa thuộc scope.

================================================== 16. TAB THÀNH VIÊN
==================================================

Hiển thị bảng:

1. Thành viên
2. Email
3. Phòng ban
4. Vai trò dự án
5. Trạng thái tài khoản
6. Ngày tham gia
7. Thao tác

Nút:

Thêm thành viên

Action:

- Chỉnh sửa vai trò.
- Xóa khỏi dự án.

Empty state:

Chưa có thành viên trong dự án.

Mô tả:

Hãy thêm thành viên để bắt đầu phân công nhiệm vụ.

================================================== 17. TAB NHIỆM VỤ
==================================================

Hiển thị:

- Search.
- Filter trạng thái.
- Filter độ ưu tiên.
- Filter người phụ trách.
- Nút tạo nhiệm vụ.
- Table hoặc card list.

Cột:

1. Nhiệm vụ
2. Người phụ trách
3. Trạng thái
4. Ưu tiên
5. Ngày bắt đầu
6. Hạn hoàn thành
7. Thao tác

Action:

- Xem chi tiết.
- Chỉnh sửa.
- Đổi trạng thái.
- Đổi người phụ trách.
- Xóa.

Assignee filter và assignee form:

- Chỉ dùng danh sách Project Members.
- Không dùng toàn bộ Users.

================================================== 18. FORM TẠO PROJECT
==================================================

Form tạo Project có các bước hoặc section:

Bước 1: Thông tin dự án

- Mã dự án.
- Tên dự án.
- Mô tả.
- Phòng ban.
- Người quản lý.
- Ngày bắt đầu.
- Ngày kết thúc.

Bước 2: Thành viên dự án

- Tìm và chọn nhiều người dùng.
- Chọn vai trò từng người.
- Manager được tự động thêm vào danh sách.
- Không cho chọn trùng.
- Có thể xóa người khỏi danh sách trước khi submit.
- Không được xóa manager chính khỏi danh sách.

Có thể triển khai:

- Form nhiều bước.
- Hoặc một dialog lớn có hai section.

Ưu tiên phù hợp design system hiện tại.

Khi submit:

- Nếu backend hỗ trợ tạo Project kèm member:
  Gửi một request transaction.

- Nếu backend yêu cầu hai bước:
  Tạo Project trước, sau đó thêm member.
  Nếu bước thêm member thất bại, phải báo rõ trạng thái không hoàn chỉnh và không giả vờ thành công toàn bộ.

Ưu tiên backend transaction để tránh dữ liệu dang dở.

================================================== 19. FORM TẠO TASK
==================================================

Field:

- Tiêu đề.
- Mô tả.
- Người phụ trách.
- Ưu tiên.
- Ngày bắt đầu.
- Hạn hoàn thành.

Vì Task được tạo trong trang Project:

- Không cần cho người dùng chọn Project.
- projectId lấy từ route hoặc context hiện tại.
- Không nhận projectId tùy ý từ input UI.

Assignee:

- Lấy từ GET Project Members.
- Hiển thị tên, email và vai trò dự án.
- Nếu Project chưa có thành viên phù hợp:
  Hiển thị:
  Dự án chưa có thành viên để phân công nhiệm vụ.

Không dùng toàn bộ danh sách User.

================================================== 20. FORM CHỈNH SỬA TASK
==================================================

Field:

- Tiêu đề.
- Mô tả.
- Ưu tiên.
- Ngày bắt đầu.
- Hạn hoàn thành.

Không chỉnh:

- Project.
- Status nếu có dialog riêng.
- Assignee nếu có dialog riêng.

Khi submit:

- Chỉ gửi field được phép.
- Không gửi actorId.
- Không gửi completedAt.
- Không gửi relation object.
- Không mất dữ liệu khi API lỗi.
- Không đóng dialog khi lỗi.

================================================== 21. DIALOG XÓA TASK
==================================================

Tiêu đề:

Xóa nhiệm vụ

Nội dung:

Bạn có chắc chắn muốn xóa nhiệm vụ “{taskTitle}” không? Thao tác này không thể hoàn tác.

Nút:

- Hủy.
- Xóa nhiệm vụ.

Chỉ hiển thị theo quyền.

Sau khi thành công:

- Đóng dialog.
- Toast:
  Xóa nhiệm vụ thành công.
- Refresh danh sách.

================================================== 22. ERROR MAPPING
==================================================

PROJECT_MEMBER_ALREADY_EXISTS
→ Người dùng này đã là thành viên của dự án.

PROJECT_MEMBER_NOT_FOUND
→ Thành viên không còn tồn tại trong dự án.

PROJECT_MEMBER_HAS_ASSIGNED_TASKS
→ Không thể xóa thành viên vì người này vẫn đang phụ trách nhiệm vụ.

PROJECT_REQUIRES_MANAGER
→ Dự án phải có ít nhất một người quản lý.

USER_NOT_ACTIVE
→ Tài khoản được chọn hiện không hoạt động.

ASSIGNEE_NOT_PROJECT_MEMBER
→ Người được chọn không phải thành viên của dự án.

ASSIGNEE_NOT_ACTIVE
→ Người được chọn hiện không hoạt động.

TASK_NOT_FOUND
→ Nhiệm vụ không còn tồn tại.

INVALID_TASK_DATE_RANGE
→ Hạn hoàn thành phải bằng hoặc sau ngày bắt đầu.

FORBIDDEN
→ Bạn không có quyền thực hiện thao tác này.

VALIDATION_ERROR
→ Dữ liệu nhập chưa hợp lệ.

INTERNAL_SERVER_ERROR
→ Đã xảy ra lỗi hệ thống. Vui lòng thử lại.

Không hiển thị raw Prisma error hoặc stack trace.

================================================== 23. TESTING
==================================================

Project Members:

[ ] Tạo Project kèm Manager
[ ] Tạo Project kèm nhiều member
[ ] Manager tự động là Project Member
[ ] Không thêm user trùng
[ ] Không thêm user inactive
[ ] ADMIN thêm member
[ ] Project Manager thêm member
[ ] Member thường không thêm được member
[ ] Chỉnh sửa role thành công
[ ] Không làm mất manager cuối cùng
[ ] Xóa member không có task thành công
[ ] Không xóa member đang phụ trách task
[ ] Activity Log được tạo
[ ] Transaction rollback khi có lỗi

Tasks:

[ ] Tạo Task thuộc Project
[ ] createdBy lấy từ session
[ ] Assignee là Project Member
[ ] Không giao cho user ngoài Project
[ ] Không giao cho user inactive
[ ] Chỉnh sửa Task thành công
[ ] Đổi assignee thành công
[ ] Đổi status thành công
[ ] Xóa Task thành công
[ ] Người không có quyền bị 403
[ ] Activity Log được tạo
[ ] Không trả dữ liệu nhạy cảm

UI:

[ ] Form tạo Project có section thành viên
[ ] Không chọn user trùng
[ ] Manager luôn nằm trong danh sách
[ ] Tab thành viên hiển thị đúng
[ ] Thêm member thành công
[ ] Sửa role thành công
[ ] Xóa member thành công
[ ] Member có Task không bị xóa
[ ] Tab Tasks hiển thị đúng
[ ] Tạo Task chỉ chọn Project Member
[ ] Sửa Task thành công
[ ] Đổi assignee chỉ hiển thị Project Member
[ ] Xóa Task có confirmation
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Responsive cơ bản

================================================== 24. NHỮNG ĐIỀU KHÔNG ĐƯỢC LÀM
==================================================

- Không giao Task cho user ngoài Project.
- Không dùng toàn bộ Users API làm assignee selector.
- Không nhận actorId từ frontend.
- Không nhận createdById từ frontend.
- Không tự động xóa Task khi xóa Project Member.
- Không tự động đổi assignee mà không có xác nhận.
- Không để Manager không thuộc Project Members.
- Không thêm user trùng trong Project.
- Không hard-code User hoặc Project.
- Không dùng `any`.
- Không import Prisma trong Client Component.
- Không đặt business logic trong Route Handler.
- Không sửa Authentication.
- Không thêm comment, attachment, subtask hoặc notification.
- Không thêm Kanban drag-and-drop trong scope này.
- Không refactor module không liên quan.

================================================== 25. DEFINITION OF DONE
==================================================

Chỉ xem là hoàn thành khi:

[ ] Tạo Project kèm thành viên hoạt động
[ ] Manager là thành viên Project
[ ] Có API danh sách thành viên
[ ] Có API thêm thành viên
[ ] Có API sửa vai trò
[ ] Có API xóa thành viên
[ ] Không thêm user trùng
[ ] Không xóa member đang có Task
[ ] Trang chi tiết Project có tab Thành viên
[ ] Trang chi tiết Project có tab Nhiệm vụ
[ ] Tạo Task trong Project hoạt động
[ ] Assignee chỉ là Project Member
[ ] Chỉnh sửa Task hoạt động
[ ] Đổi assignee hoạt động
[ ] Đổi status hoạt động
[ ] Xóa Task hoạt động
[ ] Có authentication
[ ] Có authorization
[ ] Có Activity Log
[ ] Có transaction
[ ] Có validation
[ ] Có error mapping
[ ] Có loading/empty/error state
[ ] Không dùng any
[ ] Không trả dữ liệu nhạy cảm
[ ] Test thành công
[ ] pnpm lint thành công
[ ] pnpm exec tsc --noEmit thành công
[ ] pnpm test thành công
[ ] pnpm build thành công

================================================== 26. TRÌNH TỰ THỰC HIỆN
==================================================

Trước khi code:

1. Kiểm tra Prisma ProjectMember.
2. Kiểm tra quan hệ Project, User và Task.
3. Kiểm tra managerId của Project.
4. Kiểm tra Tasks hiện tại.
5. Kiểm tra permission.
6. Kiểm tra Activity Log.
7. Kiểm tra API contract.
8. Kiểm tra UI Project Detail.
9. Nêu điểm chưa khớp giữa docs và code.
10. Liệt kê file tạo hoặc sửa.
11. Đề xuất transaction khi tạo Project kèm member.
12. Chờ xác nhận trước khi thay đổi schema hoặc migration.

Thứ tự code:

1. Project Member types và schema.
2. Project Member repository.
3. Project Member policy.
4. Project Member service.
5. Project Member API.
6. Mở rộng tạo Project kèm member.
7. Task membership validation.
8. Task API create/edit/delete/assignee.
9. UI form tạo Project.
10. UI tab thành viên.
11. UI tab Tasks.
12. Dialog create/edit/delete.
13. Tests.
14. Cập nhật docs/API.md.

================================================== 27. BÁO CÁO SAU KHI HOÀN THÀNH
==================================================

Báo cáo:

1. File đã tạo.
2. File đã sửa.
3. Có thay đổi Prisma schema hay không.
4. Có migration hay không.
5. API Project Members đã triển khai.
6. Cách tạo Project kèm member.
7. Cách đảm bảo Manager là Project Member.
8. Cách đảm bảo assignee thuộc Project.
9. Cách xử lý khi xóa member có Task.
10. Cách xử lý chỉnh sửa và xóa Task.
11. Permission đã áp dụng.
12. Activity Log đã tạo.
13. Tests đã viết.
14. Kết quả lint.
15. Kết quả type-check.
16. Kết quả test.
17. Kết quả build.
18. Rủi ro hoặc dependency còn lại.
