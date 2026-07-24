Đọc kỹ toàn bộ tài liệu và code hiện tại trước khi sửa:

- AGENTS.md
- docs/PRODUCT.md
- docs/REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DATABASE.md
- docs/API.md

Ngoài ra, phải kiểm tra implementation thực tế của:

- Tasks API
- Projects API
- Project Members API
- Users API
- Authentication
- SessionUser
- Design system
- Toast system
- Error response format
- Search params convention
- Date utility
- Các component dùng chung

Mục tiêu:
Xây dựng hoàn chỉnh UI module Tasks cho LYDINC TaskHub.

Phạm vi:

- Trang danh sách nhiệm vụ.
- Trang chi tiết nhiệm vụ.
- Tạo nhiệm vụ.
- Chỉnh sửa nhiệm vụ.
- Đổi trạng thái.
- Đổi người thực hiện.
- Xóa nhiệm vụ.
- Tích hợp API thật.
- Kiểm soát quyền theo role và project context.

Không sửa Prisma schema, migration hoặc business logic backend.

==================================================

1. ROUTE
   \==================================================

Xây dựng route theo convention hiện tại:

/tasks
/tasks/[taskId]

Ngoài ra, nếu trang chi tiết project đã có section task:

/projects/[projectId]/tasks

có thể tái sử dụng component danh sách.

Không tạo nhiều luồng trùng chức năng nếu chưa cần.

================================================== 2. PHẠM VI CHỨC NĂNG
==================================================

Trang danh sách Tasks hỗ trợ:

1. Hiển thị danh sách task.
2. Tìm kiếm theo tiêu đề.
3. Lọc theo project.
4. Lọc theo assignee.
5. Lọc theo trạng thái.
6. Lọc theo độ ưu tiên.
7. Lọc task quá hạn.
8. Lọc theo khoảng hạn hoàn thành.
9. Sắp xếp.
10. Phân trang.
11. Tạo task.
12. Chỉnh sửa task.
13. Xem chi tiết.
14. Đổi trạng thái.
15. Đổi người được giao.
16. Xóa task nếu có quyền.
17. Hiển thị loading.
18. Hiển thị empty state.
19. Hiển thị no-result state.
20. Hiển thị error state.
21. Hiển thị toast.
22. Responsive.
23. Accessibility cơ bản.

Không triển khai:

- Kanban drag-and-drop.
- Calendar.
- Gantt.
- Subtask.
- Checklist.
- Comment.
- Attachment.
- Time tracking.
- Notification.
- Bulk action.
- Import/export.

================================================== 3. API SỬ DỤNG
==================================================

Tasks:

GET /api/tasks
POST /api/tasks
GET /api/tasks/:taskId
PATCH /api/tasks/:taskId
PATCH /api/tasks/:taskId/status
PATCH /api/tasks/:taskId/assignee
DELETE /api/tasks/:taskId

Projects:

GET /api/projects

Project Members:

GET /api/projects/:projectId/members

Hoặc endpoint tương đương theo code hiện tại.

Không dùng GET /api/users toàn hệ thống để chọn assignee nếu business rule yêu cầu chỉ chọn thành viên project.

Assignee selector bắt buộc lấy từ Project Members API hoặc nguồn dữ liệu backend tương đương.

================================================== 4. QUYỀN HIỂN THỊ
==================================================

ADMIN:

- Xem tất cả task.
- Tạo task.
- Sửa task.
- Đổi status.
- Đổi assignee.
- Xóa task.

Project Manager:

- Tạo task trong project mình quản lý.
- Sửa task trong project.
- Đổi status.
- Đổi assignee.
- Xóa task nếu backend cho phép.

Assignee:

- Xem task được giao.
- Có thể đổi status theo backend.
- Không được đổi assignee.
- Không được xóa.
- Không được sửa field quản trị nếu backend không cho.

Project Member khác:

- Xem task nếu backend cho phép.
- Không thấy action trái quyền.

Role lấy từ session server-side.

Quyền theo từng task phải dựa vào dữ liệu backend hoặc context hợp lệ.

Không chỉ kiểm tra role tổng quát.

================================================== 5. CẤU TRÚC FILE ĐỀ XUẤT
==================================================

src/app/(dashboard)/tasks/
├── page.tsx
├── loading.tsx
├── error.tsx
└── [taskId]/
├── page.tsx
├── loading.tsx
└── error.tsx

src/components/tasks/
├── task-page-header.tsx
├── task-toolbar.tsx
├── task-search.tsx
├── task-filters.tsx
├── task-table.tsx
├── task-table-row.tsx
├── task-card.tsx
├── task-pagination.tsx
├── task-form.tsx
├── create-task-dialog.tsx
├── edit-task-dialog.tsx
├── change-task-status-dialog.tsx
├── change-task-assignee-dialog.tsx
├── delete-task-dialog.tsx
├── task-status-badge.tsx
├── task-priority-badge.tsx
├── task-due-date.tsx
├── task-empty-state.tsx
├── task-table-skeleton.tsx
└── task-error-message.tsx

Không bắt buộc tạo tất cả file nếu có cách tổ chức gọn hơn.

Không gom tất cả vào một Client Component lớn.

================================================== 6. SERVER VÀ CLIENT COMPONENT
==================================================

Ưu tiên:

- page.tsx là Server Component.
- Lấy session ở server.
- Parse search params ở server.
- Fetch dữ liệu ban đầu ở server.
- Client Component chỉ dùng cho:
  - Search.
  - Filter.
  - Sort.
  - Pagination.
  - Dialog.
  - Form.
  - Mutation.
  - Dropdown.
  - Toast.

Không import Prisma vào Client Component.

Không fetch trùng dữ liệu ở server và client nếu không cần.

Sau mutation:

- router.refresh()
  hoặc
- revalidatePath/revalidateTag theo convention hiện tại.

================================================== 7. PAGE HEADER
==================================================

Tiêu đề:

Quản lý nhiệm vụ

Mô tả:

Theo dõi, phân công và cập nhật tiến độ các nhiệm vụ trong dự án.

Nút:

Tạo nhiệm vụ

Chỉ hiển thị nếu user có quyền tạo task trong ít nhất một project.

Nếu user có quyền theo từng project nhưng không có project hợp lệ:

- Disable nút hoặc không hiển thị.
- Có thông báo phù hợp.

================================================== 8. SEARCH VÀ FILTER
==================================================

Đồng bộ lên URL:

- search
- projectId
- assigneeId
- status
- priority
- overdue
- dueFrom
- dueTo
- page
- pageSize
- sortBy
- sortOrder

Ví dụ:

/tasks?projectId=abc&status=IN_PROGRESS&priority=HIGH&page=1

Quy tắc:

- Thay filter đưa page về 1.
- Không gửi query rỗng.
- Search debounce 300–500 ms hoặc Enter.
- Back/Forward hoạt động.
- Refresh không mất filter.
- Không filter giả ở client nếu server pagination.

Placeholder:

Tìm theo tiêu đề nhiệm vụ...

Project filter:

- Tất cả dự án.
- Dữ liệu theo phạm vi actor được xem.

Assignee filter:

- Tất cả người thực hiện.
- Có thể phụ thuộc project đang chọn.
- Không hiển thị người ngoài project nếu project được chọn.

Status filter:

- Tất cả trạng thái.
- Chưa thực hiện.
- Đang thực hiện.
- Chờ đánh giá.
- Hoàn thành.
- Đã hủy.

Priority filter:

- Tất cả mức độ.
- Thấp.
- Trung bình.
- Cao.
- Khẩn cấp.

Overdue filter:

- Tất cả.
- Quá hạn.
- Chưa quá hạn.

================================================== 9. BẢNG TASK
==================================================

Cột đề xuất:

1. STT
2. Nhiệm vụ
3. Dự án
4. Người thực hiện
5. Trạng thái
6. Ưu tiên
7. Hạn hoàn thành
8. Cập nhật gần nhất
9. Thao tác

Trong cột Nhiệm vụ:

- Tiêu đề.
- Mô tả rút gọn nếu phù hợp.
- Click để mở trang chi tiết.

Quy tắc:

- Project hiển thị mã và tên.
- Assignee hiển thị tên.
- Nếu chưa giao, hiển thị “Chưa phân công”.
- Status dùng badge.
- Priority dùng badge.
- Due date hiển thị trạng thái quá hạn.
- Task quá hạn cần có text/icon rõ, không chỉ màu.
- Task DONE hoặc CANCELLED không đánh dấu quá hạn.
- STT tính đúng theo pagination.

================================================== 10. STATUS BADGE
==================================================

Mapping theo enum thực tế.

Ví dụ:

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

Không hiển thị raw enum.

================================================== 11. PRIORITY BADGE
==================================================

LOW
→ Thấp

MEDIUM
→ Trung bình

HIGH
→ Cao

URGENT
→ Khẩn cấp

Không chỉ dùng màu để phân biệt.

================================================== 12. HẠN HOÀN THÀNH
==================================================

Hiển thị:

- dd/MM/yyyy
- “Quá hạn X ngày” nếu quá hạn.
- “Hôm nay” nếu đến hạn trong ngày.
- “Còn X ngày” nếu phù hợp với UX hiện tại.

Không tự tính sai timezone.

Nếu dueDate null:

- Hiển thị “Chưa có hạn”.

================================================== 13. FORM TẠO TASK
==================================================

Dialog title:

Tạo nhiệm vụ

Field:

1. Dự án
2. Tiêu đề
3. Mô tả
4. Người thực hiện
5. Độ ưu tiên
6. Ngày bắt đầu
7. Hạn hoàn thành

---

13.1. Project
--------------------------------------------------

- Bắt buộc.
- Chỉ hiển thị project actor có quyền tạo task.
- Không hard-code.
- Khi đổi project:
  - Reset assignee nếu assignee cũ không thuộc project mới.
  - Tải lại danh sách Project Members.

---

13.2. Title
--------------------------------------------------

- Bắt buộc.
- Trim.
- Tối đa theo schema backend.
- Placeholder:
  Nhập tiêu đề nhiệm vụ

---

13.3. Description
--------------------------------------------------

- Không bắt buộc.
- Textarea.
- Không rich text trong scope này.

---

13.4. Assignee
--------------------------------------------------

- Dữ liệu từ Project Members.
- Không dùng toàn bộ Users API.
- Chỉ hiển thị user ACTIVE nếu backend trả status.
- Nếu chưa chọn project:
  - Disable field.
  - Hiển thị “Chọn dự án trước”.

- Nếu project chưa có thành viên:
  - Hiển thị empty state.
  - Không hard-code user.

---

13.5. Priority
--------------------------------------------------

Select theo enum.

Mặc định:

MEDIUM

---

13.6. Dates
--------------------------------------------------

- startDate <= dueDate.
- Không lệch ngày do timezone.
- Hiển thị lỗi dưới field.

Thông báo:

Hạn hoàn thành phải bằng hoặc sau ngày bắt đầu.

---

13.7. Submit
--------------------------------------------------

Nút:

- Hủy
- Tạo nhiệm vụ

Khi submit:

1. Validate.
2. Disable nút.
3. Ngăn double submit.
4. POST /api/tasks.
5. Thành công:
   - Đóng dialog.
   - Reset form.
   - Toast:
     Tạo nhiệm vụ thành công.
   - Refresh.
6. Thất bại:
   - Giữ dialog.
   - Không mất dữ liệu.
   - Hiển thị lỗi thân thiện.

================================================== 14. FORM CHỈNH SỬA
==================================================

Dialog title:

Chỉnh sửa nhiệm vụ

Field:

- Tiêu đề.
- Mô tả.
- Độ ưu tiên.
- Ngày bắt đầu.
- Hạn hoàn thành.

Nếu backend cho phép đổi assignee trong endpoint riêng:

- Không đặt assignee trong form chung.

Nếu status có endpoint riêng:

- Không đặt status trong form chung.

Không gửi:

- actorId
- createdById
- completedAt
- createdAt
- updatedAt
- project relation
- assignee relation

Khi mở:

- Điền dữ liệu hiện tại.
- Không giữ dữ liệu task trước.
- Fetch detail nếu row data không đủ.
- Có loading state trong dialog nếu cần.

================================================== 15. ĐỔI TRẠNG THÁI
==================================================

Dialog title tùy hành động:

- Bắt đầu nhiệm vụ.
- Chuyển sang chờ đánh giá.
- Hoàn thành nhiệm vụ.
- Mở lại nhiệm vụ.
- Hủy nhiệm vụ.

Chỉ hiển thị transition hợp lệ.

Assignee chỉ thấy transition backend cho phép.

Khi chuyển DONE:

- Nội dung xác nhận:
  Nhiệm vụ sẽ được đánh dấu hoàn thành.

Không cho chọn trạng thái hiện tại.

Lỗi:

INVALID_TASK_STATUS_TRANSITION
→ Không thể chuyển nhiệm vụ sang trạng thái này từ trạng thái hiện tại.

================================================== 16. ĐỔI NGƯỜI THỰC HIỆN
==================================================

Chỉ hiển thị cho ADMIN hoặc Project Manager.

Dialog title:

Thay đổi người thực hiện

Danh sách:

- Chỉ Project Members.
- Không hiển thị user ngoài project.
- Có thể có “Chưa phân công” nếu backend cho null.

Khi thành công:

Toast:
Cập nhật người thực hiện thành công.

Lỗi:

ASSIGNEE_NOT_PROJECT_MEMBER
→ Người được chọn không còn là thành viên của dự án.

ASSIGNEE_NOT_ACTIVE
→ Tài khoản được chọn hiện không hoạt động.

================================================== 17. XÓA TASK
==================================================

Chỉ hiển thị theo quyền backend.

Dialog:

Tiêu đề:
Xóa nhiệm vụ

Nội dung:
Bạn có chắc chắn muốn xóa nhiệm vụ “{taskTitle}” không? Thao tác này không thể hoàn tác.

Nút:

- Hủy.
- Xóa nhiệm vụ.

Không đóng dialog nếu lỗi.

================================================== 18. TRANG CHI TIẾT TASK
==================================================

Route:

/tasks/[taskId]

Hiển thị:

A. Header

- Tiêu đề.
- Status badge.
- Priority badge.
- Project.
- Menu action theo quyền.

B. Thông tin

- Mô tả.
- Assignee.
- Người tạo nếu API trả.
- Ngày bắt đầu.
- Hạn hoàn thành.
- Ngày hoàn thành.
- Ngày tạo.
- Ngày cập nhật.

C. Trạng thái thời gian

- Đúng hạn.
- Quá hạn.
- Hoàn thành.
- Đã hủy.

D. Placeholder module sau

Có thể có section:

- Bình luận.
- Hoạt động.
- File đính kèm.

Nhưng chỉ hiển thị placeholder hoặc không hiển thị trong scope này.

Không gọi API chưa có.

================================================== 19. MAPPING API ERROR
==================================================

TASK_NOT_FOUND
→ Nhiệm vụ không còn tồn tại.

PROJECT_NOT_FOUND
→ Dự án không còn tồn tại.

PROJECT_NOT_ACTIVE
→ Không thể tạo hoặc cập nhật nhiệm vụ trong dự án này.

PROJECT_CLOSED
→ Dự án đã đóng và không cho phép thay đổi nhiệm vụ.

ASSIGNEE_NOT_FOUND
→ Người thực hiện không còn tồn tại.

ASSIGNEE_NOT_PROJECT_MEMBER
→ Người được chọn không phải thành viên dự án.

ASSIGNEE_NOT_ACTIVE
→ Tài khoản được chọn không hoạt động.

INVALID_TASK_DATE_RANGE
→ Hạn hoàn thành phải bằng hoặc sau ngày bắt đầu.

INVALID_TASK_STATUS_TRANSITION
→ Không thể chuyển nhiệm vụ sang trạng thái này.

FORBIDDEN
→ Bạn không có quyền thực hiện thao tác này.

VALIDATION_ERROR
→ Dữ liệu nhập chưa hợp lệ.

INTERNAL_SERVER_ERROR
→ Đã xảy ra lỗi hệ thống. Vui lòng thử lại.

Không hiển thị raw error.

================================================== 20. EMPTY STATE
==================================================

Không có task:

Tiêu đề:
Chưa có nhiệm vụ

Mô tả:
Hãy tạo nhiệm vụ đầu tiên để bắt đầu theo dõi tiến độ công việc.

Nếu có quyền:

Nút:
Tạo nhiệm vụ

No-result:

Tiêu đề:
Không tìm thấy nhiệm vụ

Mô tả:
Không có nhiệm vụ nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.

Nút:
Xóa bộ lọc

================================================== 21. LOADING VÀ ERROR STATE
==================================================

Loading:

- Skeleton toolbar.
- Skeleton table.
- 5–8 dòng.
- Skeleton badge.
- Skeleton pagination.

Detail:

- Skeleton header.
- Skeleton metadata.
- Skeleton description.

Error:

Tiêu đề:
Không thể tải danh sách nhiệm vụ

Nút:
Thử lại

Không hiển thị stack trace.

================================================== 22. RESPONSIVE
==================================================

Desktop:

- Table đầy đủ.

Tablet:

- Ẩn bớt cột cập nhật gần nhất.
- Giữ title, project, assignee, status, priority, due date.

Mobile:

- Card list.

Card hiển thị:

- Title.
- Project.
- Status.
- Priority.
- Assignee.
- Due date.
- Action menu.

Dialog:

- Có scroll.
- Footer không bị che.
- Không tràn ngang.

================================================== 23. ACCESSIBILITY
==================================================

- Input có label.
- Error liên kết field.
- Dialog quản lý focus.
- Icon button có aria-label.
- Badge có text.
- Không chỉ dùng màu.
- Due status có nội dung rõ.
- Menu dùng được bàn phím.
- Button loading có aria-busy.
- Form submit bằng keyboard.
- Progress/status không dùng icon đơn lẻ khó hiểu.

================================================== 24. TYPE SAFETY
==================================================

Tạo type:

- TaskListItem
- TaskDetail
- TaskStatus
- TaskPriority
- TaskListResponse
- TaskPagination
- CreateTaskInput
- UpdateTaskInput
- ChangeTaskStatusInput
- ChangeTaskAssigneeInput
- ProjectOption
- ProjectMemberOption
- ApiErrorResponse

Không dùng any.

Không dùng Prisma type trực tiếp trong client nếu có field thừa.

================================================== 25. TESTING
==================================================

Quyền:

[ ] ADMIN thấy mọi action
[ ] Project Manager thấy action trong project mình quản lý
[ ] Assignee chỉ thấy action được phép
[ ] Member khác không thấy action trái quyền
[ ] Role không lấy từ localStorage

Danh sách:

[ ] Hiển thị task đúng
[ ] Hiển thị project
[ ] Hiển thị assignee
[ ] Hiển thị status
[ ] Hiển thị priority
[ ] Hiển thị overdue
[ ] STT đúng

Filter:

[ ] Search cập nhật URL
[ ] Project filter cập nhật URL
[ ] Assignee filter cập nhật URL
[ ] Status filter cập nhật URL
[ ] Priority filter cập nhật URL
[ ] Overdue filter cập nhật URL
[ ] Thay filter đưa page về 1
[ ] Xóa filter hoạt động

Create:

[ ] Project bắt buộc
[ ] Title bắt buộc
[ ] Assignee lấy từ project members
[ ] Đổi project reset assignee không hợp lệ
[ ] Date range validate
[ ] Tạo thành công
[ ] Không gửi actorId
[ ] Không gửi completedAt

Edit:

[ ] Form điền dữ liệu hiện tại
[ ] Không giữ dữ liệu task trước
[ ] Sửa thành công
[ ] Không sửa status trong form chung
[ ] Không sửa assignee trong form chung nếu có endpoint riêng

Status:

[ ] Hiển thị transition hợp lệ
[ ] Đổi status thành công
[ ] Transition sai hiển thị lỗi
[ ] Dialog không đóng khi lỗi

Assignee:

[ ] Chỉ Project Manager/Admin thấy
[ ] Chỉ hiển thị project member
[ ] Đổi assignee thành công
[ ] User ngoài project hiển thị lỗi

Delete:

[ ] Có confirmation
[ ] Xóa thành công
[ ] Không có quyền không thấy action
[ ] Dialog không đóng khi lỗi

Detail:

[ ] Hiển thị thông tin đầy đủ
[ ] 404 khi task không tồn tại
[ ] 403 khi không có quyền

States:

[ ] Loading skeleton
[ ] Empty state
[ ] No-result state
[ ] Error state
[ ] Responsive cơ bản
[ ] Accessibility cơ bản

================================================== 26. NHỮNG ĐIỀU KHÔNG ĐƯỢC LÀM
==================================================

- Không sửa Prisma schema.
- Không tạo migration.
- Không thay business rule backend.
- Không gọi Prisma trong Client Component.
- Không dùng any.
- Không dùng toàn bộ Users API để chọn assignee nếu phải chọn Project Member.
- Không hard-code project.
- Không hard-code user.
- Không thêm Kanban.
- Không thêm subtask.
- Không thêm comment.
- Không thêm attachment.
- Không thêm notification.
- Không thêm bulk action.
- Không thêm import/export.
- Không dùng window.location.reload nếu không cần.
- Không hiển thị raw enum.
- Không hiển thị raw error.
- Không tự tính quyền chỉ dựa vào role.
- Không refactor toàn dashboard.

================================================== 27. TRÌNH TỰ THỰC HIỆN
==================================================

Trước khi code:

1. Đọc docs.
2. Kiểm tra Tasks API.
3. Kiểm tra Task enum.
4. Kiểm tra Project Members API.
5. Kiểm tra quyền theo project.
6. Kiểm tra session.
7. Kiểm tra design system.
8. Kiểm tra URL search params.
9. Kiểm tra date utility.
10. Kiểm tra error mapping.
11. Đề xuất layout.
12. Liệt kê file tạo/sửa.
13. Nêu Server/Client Component.
14. Nêu dependency còn thiếu.
15. Chưa code nếu không có cách lấy Project Members.

Trong khi code:

1. Tạo types.
2. Tạo page danh sách.
3. Tạo toolbar.
4. Tạo filters.
5. Tạo table/card.
6. Tạo pagination.
7. Tạo form.
8. Tạo dialog create.
9. Tạo dialog edit.
10. Tạo dialog status.
11. Tạo dialog assignee.
12. Tạo dialog delete.
13. Tạo detail page.
14. Tạo loading/empty/error.
15. Viết test.

================================================== 28. DEFINITION OF DONE
==================================================

[ ] Route /tasks hoạt động
[ ] Route /tasks/[taskId] hoạt động
[ ] Dữ liệu từ API thật
[ ] Search hoạt động
[ ] Filter project hoạt động
[ ] Filter assignee hoạt động
[ ] Filter status hoạt động
[ ] Filter priority hoạt động
[ ] Overdue filter hoạt động
[ ] Pagination hoạt động
[ ] Tạo task hoạt động
[ ] Sửa task hoạt động
[ ] Đổi status hoạt động
[ ] Đổi assignee hoạt động
[ ] Xóa task hoạt động
[ ] Assignee chỉ lấy từ Project Members
[ ] Quyền ADMIN đúng
[ ] Quyền Project Manager đúng
[ ] Quyền Assignee đúng
[ ] Có loading
[ ] Có empty
[ ] Có no-result
[ ] Có error
[ ] Có toast
[ ] Có validation
[ ] Có responsive
[ ] Có accessibility cơ bản
[ ] Không dùng any
[ ] Không import Prisma vào client
[ ] Test thành công
[ ] pnpm lint thành công
[ ] pnpm exec tsc --noEmit thành công
[ ] pnpm test thành công
[ ] pnpm build thành công

================================================== 29. BÁO CÁO SAU KHI HOÀN THÀNH
==================================================

Báo cáo:

1. File đã tạo.
2. File đã sửa.
3. Route đã xây dựng.
4. Cấu trúc Server/Client Component.
5. Cách lấy danh sách task.
6. Cách lấy Project Members.
7. Cách xử lý quyền.
8. Cách xử lý overdue.
9. Cách xử lý create/edit/status/assignee/delete.
10. Cách map API error.
11. Test đã viết.
12. Kết quả lint.
13. Kết quả type-check.
14. Kết quả test.
15. Kết quả build.
16. Dependency còn thiếu.
17. Rủi ro còn lại.
