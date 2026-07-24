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
- Projects API
- Departments API
- Users API
- Design system hiện tại
- Component dùng chung
- Toast system
- Error response format
- Cách project hiện tại xử lý Server Component và Client Component
- Cách project hiện tại đồng bộ search/filter/pagination với URL

Mục tiêu:
Xây dựng hoàn chỉnh giao diện quản lý dự án cho module Projects của LYDINC TaskHub.

Phạm vi:

- Chỉ xây dựng UI và tích hợp với Projects API đã có.
- Không sửa Prisma schema.
- Không tạo migration.
- Không thay đổi business logic backend.
- Không tự ý mở rộng tính năng ngoài phạm vi.
- Không refactor các module không liên quan.

==================================================

1. ROUTE VÀ PHẠM VI GIAO DIỆN
   \==================================================

Xây dựng các route:

/projects
/projects/[projectId]

Nếu kiến trúc hiện tại quy định trang quản trị nằm dưới `/admin`, có thể dùng:

/admin/projects
/admin/projects/[projectId]

Phải tuân thủ routing convention hiện tại của repository, không tự thay đổi toàn bộ cấu trúc route.

Trang danh sách dự án phải hỗ trợ:

1. Hiển thị danh sách dự án.
2. Tìm kiếm theo mã hoặc tên dự án.
3. Lọc theo trạng thái.
4. Lọc theo phòng ban.
5. Lọc theo người quản lý.
6. Lọc theo khoảng thời gian.
7. Sắp xếp.
8. Phân trang.
9. Tạo dự án.
10. Chỉnh sửa dự án.
11. Xem chi tiết dự án.
12. Thay đổi trạng thái dự án.
13. Xóa dự án nếu người dùng có quyền.
14. Hiển thị số thành viên.
15. Hiển thị số nhiệm vụ.
16. Hiển thị tiến độ.
17. Có loading state.
18. Có empty state.
19. Có no-result state.
20. Có error state.
21. Có toast hoặc feedback rõ ràng.
22. Có kiểm soát quyền hiển thị theo role và quyền trên từng dự án.

Không triển khai trong nhiệm vụ này:

- Quản lý thành viên dự án chi tiết.
- Kanban nhiệm vụ.
- Bình luận.
- File đính kèm.
- Gantt chart.
- Báo cáo nâng cao.
- Import hoặc export.
- Bulk actions.
- Notification.
- Project template.
- Project cloning.

================================================== 2. API SỬ DỤNG
==================================================

Projects:

GET /api/projects
POST /api/projects
GET /api/projects/:projectId
PATCH /api/projects/:projectId
PATCH /api/projects/:projectId/status
DELETE /api/projects/:projectId

Departments:

GET /api/departments

Users:

GET /api/users

Nếu Users API quản trị chỉ cho ADMIN truy cập, không được dùng endpoint đó cho MANAGER chỉ để chọn Project Manager.

Trong trường hợp đó:

- Kiểm tra xem backend đã có endpoint danh sách người dùng có thể làm Project Manager chưa.
- Nếu chưa có, không tự ý tạo endpoint trong nhiệm vụ UI.
- Báo cáo rõ đây là dependency backend còn thiếu.
- Không dùng dữ liệu hard-code để thay thế.

Phải kiểm tra response thực tế của API trước khi code.
Không giả định hoàn toàn theo docs nếu implementation hiện tại khác.

================================================== 3. QUYỀN TRUY CẬP VÀ HIỂN THỊ
==================================================

ADMIN:

- Xem tất cả dự án.
- Tạo dự án.
- Chỉnh sửa mọi dự án.
- Thay đổi trạng thái mọi dự án.
- Xóa dự án nếu backend cho phép.
- Xem chi tiết mọi dự án.

MANAGER:

- Xem dự án mình quản lý hoặc tham gia, theo dữ liệu backend trả về.
- Tạo dự án nếu policy backend cho phép.
- Chỉnh sửa dự án mình quản lý.
- Thay đổi trạng thái dự án mình quản lý.
- Không xóa dự án nếu backend chỉ cho ADMIN.
- Không thấy hành động trên dự án không thuộc quyền quản lý.

MEMBER:

- Chỉ xem dự án mình tham gia.
- Không thấy nút tạo dự án nếu backend không cho phép.
- Không thấy nút chỉnh sửa.
- Không thấy nút thay đổi trạng thái.
- Không thấy nút xóa.

Yêu cầu:

- Role phải lấy từ session hợp lệ phía server.
- Không đọc role từ localStorage.
- Không chỉ kiểm tra role tổng quát; với MANAGER phải kiểm tra quyền trên từng dự án nếu API trả thông tin phù hợp.
- UI chỉ điều khiển hiển thị.
- Backend vẫn là nơi kiểm tra quyền cuối cùng.
- Không render menu thao tác rỗng.

================================================== 4. CẤU TRÚC FILE ĐỀ XUẤT
==================================================

Kiểm tra cấu trúc hiện tại trước khi tạo file mới.

Cấu trúc đề xuất:

src/app/(dashboard)/projects/
├── page.tsx
├── loading.tsx
├── error.tsx
└── [projectId]/
├── page.tsx
├── loading.tsx
└── error.tsx

Hoặc nếu project đang dùng `/admin`:

src/app/(dashboard)/admin/projects/
├── page.tsx
├── loading.tsx
├── error.tsx
└── [projectId]/
├── page.tsx
├── loading.tsx
└── error.tsx

Components:

src/components/projects/
├── project-page-header.tsx
├── project-toolbar.tsx
├── project-search.tsx
├── project-filters.tsx
├── project-table.tsx
├── project-table-row.tsx
├── project-card.tsx
├── project-pagination.tsx
├── project-form.tsx
├── project-status-badge.tsx
├── project-progress.tsx
├── project-date-range.tsx
├── create-project-dialog.tsx
├── edit-project-dialog.tsx
├── change-project-status-dialog.tsx
├── delete-project-dialog.tsx
├── project-detail-header.tsx
├── project-detail-summary.tsx
├── project-empty-state.tsx
├── project-table-skeleton.tsx
└── project-error-message.tsx

Không bắt buộc tạo toàn bộ file trên nếu có thể tổ chức gọn hơn.

Không gom toàn bộ page, form, table, dialog và mutation vào một Client Component lớn.

================================================== 5. KIẾN TRÚC SERVER VÀ CLIENT COMPONENT
==================================================

Ưu tiên:

- `page.tsx` là Server Component.
- Lấy session ở server.
- Parse search params ở server.
- Dữ liệu ban đầu được lấy ở server.
- Chỉ dùng Client Component cho:
  - Search tương tác.
  - Filter.
  - Pagination.
  - Sort.
  - Dialog.
  - Form.
  - Mutation.
  - Toast.
  - Dropdown menu.
  - Progress interaction nếu có.

Không được:

- Import Prisma vào Client Component.
- Gọi service server-only từ Client Component.
- Đặt business rule trong UI.
- Fetch lại cùng một dữ liệu không cần thiết ở cả server và client.
- Dùng absolute internal URL từ Server Component nếu có thể gọi service trực tiếp theo kiến trúc hiện tại.
- Dùng `window.location.reload()` sau mutation nếu không cần thiết.

Sau mutation:

- Ưu tiên `router.refresh()`.
- Hoặc `revalidatePath` / `revalidateTag` theo convention hiện tại.

================================================== 6. BỐ CỤC TRANG DANH SÁCH
==================================================

Trang gồm các khu vực:

A. Page Header

Tiêu đề:

Quản lý dự án

Mô tả:

Theo dõi, tổ chức và quản lý toàn bộ dự án trong hệ thống.

Nút hành động chính:

Tạo dự án

Chỉ hiển thị khi user có quyền tạo dự án.

B. Thanh công cụ

Bao gồm:

- Ô tìm kiếm.
- Bộ lọc trạng thái.
- Bộ lọc phòng ban.
- Bộ lọc người quản lý.
- Bộ lọc khoảng thời gian.
- Nút xóa bộ lọc.
- Có thể có nút đổi kiểu hiển thị Table/Card nếu design system hiện tại đã có.
- Không tự thêm chế độ hiển thị mới nếu không cần thiết.

C. Nội dung chính

Desktop:

- Hiển thị bảng.

Tablet:

- Có thể rút gọn một số cột.

Mobile:

- Ưu tiên card list nếu bảng quá rộng.
- Hoặc table scroll ngang có kiểm soát.

D. Phân trang

Hiển thị ở cuối danh sách.

================================================== 7. SEARCH, FILTER, SORT VÀ URL STATE
==================================================

Các trạng thái sau nên được đồng bộ lên URL:

- search
- status
- departmentId
- managerId
- startFrom
- startTo
- endFrom
- endTo
- page
- pageSize
- sortBy
- sortOrder

Ví dụ:

/projects?search=angc&status=ACTIVE&departmentId=abc&page=1&pageSize=20

Quy tắc:

- Khi thay đổi search hoặc filter, đưa page về 1.
- Không gửi query parameter rỗng.
- Refresh trang không mất trạng thái.
- Back/Forward của trình duyệt hoạt động đúng.
- Có debounce khoảng 300–500 ms cho search hoặc chỉ tìm khi nhấn Enter.
- Không filter giả toàn bộ dữ liệu ở client khi API đang phân trang server-side.
- Không sort giả ở client nếu API đang phân trang.

Placeholder:

Tìm theo mã hoặc tên dự án...

Status filter:

- Tất cả trạng thái
- Lập kế hoạch
- Đang thực hiện
- Tạm dừng
- Hoàn thành
- Đã hủy

Department filter:

- Tất cả phòng ban
- Dữ liệu từ Departments API

Manager filter:

- Tất cả người quản lý
- Dữ liệu từ endpoint backend phù hợp

Date filter:

Có thể dùng:

- Ngày bắt đầu từ
- Ngày bắt đầu đến
- Ngày kết thúc từ
- Ngày kết thúc đến

Hoặc date range picker nếu design system hiện tại đã hỗ trợ.

Không cài thêm package date picker nếu project đã có giải pháp sẵn.

================================================== 8. BẢNG DỰ ÁN
==================================================

Các cột đề xuất:

1. STT
2. Mã dự án
3. Tên dự án
4. Phòng ban
5. Người quản lý
6. Trạng thái
7. Tiến độ
8. Thành viên
9. Nhiệm vụ
10. Thời gian
11. Thao tác

Có thể tách thời gian thành:

- Ngày bắt đầu
- Ngày kết thúc

Nhưng cần cân đối độ rộng bảng.

Quy tắc hiển thị:

- Mã dự án hiển thị rõ và dễ copy nếu phù hợp.
- Tên dự án có thể click để mở trang chi tiết.
- Tên dài phải truncate hợp lý.
- Có tooltip hoặc title nếu cần.
- Phòng ban hiển thị tên, không hiển thị ID.
- Người quản lý hiển thị tên.
- Trạng thái dùng badge.
- Tiến độ dùng progress bar và số phần trăm.
- Số thành viên và nhiệm vụ hiển thị dạng số.
- Ngày hiển thị theo định dạng dễ đọc với người Việt.
- Không làm lệch ngày do timezone.
- STT phải tính đúng theo phân trang:

STT = (page - 1) * pageSize + rowIndex + 1

Không hiển thị raw enum tiếng Anh cho người dùng cuối.

================================================== 9. PROJECT STATUS BADGE
==================================================

Mapping:

PLANNING
→ Lập kế hoạch

ACTIVE
→ Đang thực hiện

ON_HOLD
→ Tạm dừng

COMPLETED
→ Hoàn thành

CANCELLED
→ Đã hủy

Yêu cầu:

- Badge phải có text.
- Không chỉ dựa vào màu.
- Style nhất quán với design system.
- Không hard-code màu ngẫu nhiên.
- Không sử dụng quá nhiều màu gây rối.

================================================== 10. TIẾN ĐỘ DỰ ÁN
==================================================

Nếu API trả progress:

- Hiển thị progress bar.
- Hiển thị số phần trăm.
- Giới hạn trong khoảng 0–100.
- Nếu dữ liệu vượt giới hạn do backend lỗi, clamp để UI không vỡ nhưng phải báo cáo lại.
- Không tự tính progress từ dữ liệu thiếu nếu business rule backend chưa xác định.

Nếu API không trả progress:

- Không tự suy diễn một công thức mới.
- Có thể hiển thị dấu gạch hoặc “Chưa có dữ liệu”.
- Báo cáo dependency backend còn thiếu.

================================================== 11. FORM TẠO DỰ ÁN
==================================================

Dialog title:

Tạo dự án

Các field:

1. Mã dự án
2. Tên dự án
3. Mô tả
4. Phòng ban
5. Người quản lý
6. Ngày bắt đầu
7. Ngày kết thúc
8. Trạng thái ban đầu

---

11.1. Mã dự án
--------------------------------------------------

- Bắt buộc.
- Trim.
- Uppercase trước khi gửi nếu backend quy định.
- Tối đa theo schema hiện tại.
- Placeholder:
  VD: ANGC-2026

- Không cho phép ký tự không hợp lệ nếu backend đã quy định regex.
- Hiển thị lỗi ngay dưới field.

---

11.2. Tên dự án
--------------------------------------------------

- Bắt buộc.
- Trim.
- Tối đa theo schema hiện tại.
- Placeholder:
  Nhập tên dự án

---

11.3. Mô tả
--------------------------------------------------

- Không bắt buộc.
- Textarea.
- Tối đa theo schema hiện tại.
- Có bộ đếm ký tự nếu phù hợp.
- Không dùng rich text editor trong scope này.

---

11.4. Phòng ban
--------------------------------------------------

- Dữ liệu từ Departments API.
- Bắt buộc nếu backend yêu cầu.
- Có loading state.
- Có empty state.
- Không hard-code.

---

11.5. Người quản lý
--------------------------------------------------

- Chỉ hiển thị user có role phù hợp:
  - ADMIN
  - MANAGER
- Không hiển thị MEMBER.
- Dữ liệu phải từ endpoint backend hợp lệ.
- Không lấy toàn bộ user rồi tự dùng nếu endpoint đó không cho role hiện tại truy cập.
- Nếu không có người quản lý phù hợp, hiển thị thông báo rõ.

---

11.6. Ngày bắt đầu và kết thúc
--------------------------------------------------

Validation phía client:

- Ngày bắt đầu bắt buộc nếu backend yêu cầu.
- Ngày kết thúc bắt buộc nếu backend yêu cầu.
- `startDate <= endDate`.
- Không chuyển ngày sai do UTC.
- Gửi theo định dạng API yêu cầu.

Thông báo lỗi:

Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.

---

11.7. Trạng thái ban đầu
--------------------------------------------------

Mặc định:

PLANNING

Nếu backend không cho client truyền status khi tạo, không hiển thị field này.

Phải kiểm tra implementation thực tế.

---

11.8. Submit
--------------------------------------------------

Nút:

- Hủy
- Tạo dự án

Khi submit:

1. Validate client.
2. Disable nút và field cần thiết.
3. Ngăn double submit.
4. Gọi POST /api/projects.
5. Nếu thành công:
   - Đóng dialog.
   - Reset form.
   - Toast:
     Tạo dự án thành công.
   - Refresh danh sách.
6. Nếu thất bại:
   - Giữ dialog mở.
   - Không mất dữ liệu đã nhập.
   - Hiển thị field error hoặc form error phù hợp.
   - Không hiển thị raw error.

================================================== 12. FORM CHỈNH SỬA DỰ ÁN
==================================================

Dialog title:

Chỉnh sửa dự án

Field:

- Mã dự án.
- Tên dự án.
- Mô tả.
- Phòng ban.
- Người quản lý.
- Ngày bắt đầu.
- Ngày kết thúc.

Không chỉnh status trong form chung nếu đã có endpoint status riêng.

Không hiển thị hoặc gửi:

- createdById
- actorId
- createdAt
- updatedAt
- progress
- taskCount
- memberCount
- internal fields

Khi mở dialog:

- Điền dữ liệu hiện tại.
- Không để dữ liệu dự án trước còn trong form dự án sau.
- Có thể dùng row data nếu đủ chính xác.
- Nếu cần dữ liệu đầy đủ, gọi detail API.
- Có loading state trong dialog nếu fetch detail.

Khi submit:

- Chỉ gửi field được phép.
- Có thể chỉ gửi field đã thay đổi.
- Không gửi request rỗng.
- Disable trong lúc submit.
- Toast khi thành công.
- Refresh dữ liệu.

================================================== 13. TRANG CHI TIẾT DỰ ÁN
==================================================

Xây dựng route:

/projects/[projectId]

Hoặc route tương ứng theo convention hiện tại.

Trang chi tiết gồm:

A. Header

- Mã dự án.
- Tên dự án.
- Status badge.
- Nút quay lại.
- Menu hành động theo quyền:
  - Chỉnh sửa.
  - Thay đổi trạng thái.
  - Xóa.

B. Thông tin tổng quan

- Phòng ban.
- Người quản lý.
- Ngày bắt đầu.
- Ngày kết thúc.
- Ngày tạo.
- Người tạo nếu API trả và business cho phép.
- Mô tả.

C. Thống kê

- Tiến độ.
- Số thành viên.
- Tổng số nhiệm vụ.
- Số nhiệm vụ hoàn thành nếu API trả.

D. Placeholder cho module sau

Có thể hiển thị các section hoặc tabs:

- Thành viên
- Nhiệm vụ
- Hoạt động

Nhưng trong nhiệm vụ này:

- Chỉ hiển thị summary hoặc placeholder rõ ràng.
- Không triển khai CRUD thành viên.
- Không triển khai task board.
- Không gọi API chưa tồn tại.

Nếu không tìm thấy dự án:

- Hiển thị trang 404 hoặc notFound theo convention hiện tại.

Nếu không có quyền:

- Hiển thị 403 hoặc redirect phù hợp.

================================================== 14. THAY ĐỔI TRẠNG THÁI
==================================================

Dùng dialog xác nhận.

Endpoint:

PATCH /api/projects/:projectId/status

Request:

{
"status": "ACTIVE"
}

Dialog title thay đổi theo hành động:

- Bắt đầu dự án
- Tạm dừng dự án
- Tiếp tục dự án
- Hoàn thành dự án
- Hủy dự án

Nội dung phải giải thích hệ quả.

Ví dụ hoàn thành:

Dự án “{projectName}” sẽ được chuyển sang trạng thái hoàn thành. Hãy đảm bảo các công việc cần thiết đã được xử lý.

Ví dụ hủy:

Dự án “{projectName}” sẽ được đánh dấu đã hủy. Dữ liệu lịch sử vẫn được giữ lại.

Chỉ hiển thị trạng thái chuyển tiếp hợp lệ.

Không hard-code transition nếu backend có trả danh sách transition cho phép.

Nếu backend không trả, sử dụng transition theo docs/API hiện tại.

Không cho người dùng chọn trạng thái hiện tại.

Khi submit:

- Disable.
- Không đóng dialog khi lỗi.
- Refresh dữ liệu khi thành công.
- Toast:
  Cập nhật trạng thái dự án thành công.

================================================== 15. XÓA DỰ ÁN
==================================================

Chỉ hiển thị cho ADMIN nếu backend quy định.

Dùng Alert Dialog.

Tiêu đề:

Xóa dự án

Nội dung:

Bạn có chắc chắn muốn xóa dự án “{projectName}” không? Thao tác này không thể hoàn tác.

Nút:

- Hủy
- Xóa dự án

Nút xóa phải có kiểu cảnh báo.

Xử lý lỗi cụ thể:

PROJECT_HAS_TASKS
→ Không thể xóa dự án vì vẫn còn nhiệm vụ liên quan.

PROJECT_HAS_MEMBERS
→ Không thể xóa dự án vì vẫn còn thành viên liên quan.

PROJECT_NOT_FOUND
→ Dự án không còn tồn tại. Danh sách sẽ được cập nhật lại.

FORBIDDEN
→ Bạn không có quyền xóa dự án này.

Nếu backend khuyến nghị dùng CANCELLED thay vì DELETE:

- Không tự đổi hành vi.
- Tuân thủ API.
- Có thể ưu tiên action “Hủy dự án” thay cho “Xóa” nếu requirement hiện tại quy định.
- Báo cáo rõ hành vi thực tế.

Không đóng dialog nếu thao tác thất bại.

================================================== 16. MAPPING API ERROR
==================================================

Tạo mapping lỗi thân thiện.

PROJECT_CODE_ALREADY_EXISTS
→ Mã dự án này đã được sử dụng.

PROJECT_NOT_FOUND
→ Dự án không còn tồn tại.

DEPARTMENT_NOT_FOUND
→ Phòng ban không còn tồn tại.

MANAGER_NOT_FOUND
→ Người quản lý không còn tồn tại.

INVALID_PROJECT_MANAGER
→ Người được chọn không đủ quyền làm quản lý dự án.

INVALID_PROJECT_DATE_RANGE
→ Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.

INVALID_PROJECT_STATUS_TRANSITION
→ Không thể chuyển dự án sang trạng thái này từ trạng thái hiện tại.

PROJECT_HAS_TASKS
→ Không thể xóa dự án vì vẫn còn nhiệm vụ liên quan.

PROJECT_HAS_MEMBERS
→ Không thể xóa dự án vì vẫn còn thành viên liên quan.

FORBIDDEN
→ Bạn không có quyền thực hiện thao tác này.

VALIDATION_ERROR
→ Dữ liệu nhập chưa hợp lệ.

INTERNAL_SERVER_ERROR
→ Đã xảy ra lỗi hệ thống. Vui lòng thử lại.

Không hiển thị:

- Raw Prisma error.
- Stack trace.
- Internal error object.
- HTML lỗi.
- Response body chưa xử lý.

================================================== 17. LOADING STATE
==================================================

Trang danh sách:

- Skeleton page header nếu cần.
- Skeleton toolbar.
- Skeleton table header.
- 5–8 dòng skeleton.
- Skeleton pagination.

Trang chi tiết:

- Skeleton header.
- Skeleton summary cards.
- Skeleton description.
- Skeleton statistics.

Không chỉ hiển thị chữ “Loading...”.

Mutation:

- Chỉ loading dialog hoặc nút đang thao tác.
- Không khóa toàn bộ trang nếu không cần thiết.
- Nút có `aria-busy` nếu phù hợp.

================================================== 18. EMPTY VÀ NO-RESULT STATE
==================================================

Nếu hệ thống chưa có dự án:

Tiêu đề:

Chưa có dự án

Mô tả:

Hãy tạo dự án đầu tiên để bắt đầu tổ chức công việc và thành viên trong hệ thống.

Nếu user có quyền tạo:

- Hiển thị nút:
  Tạo dự án

Nếu search/filter không có kết quả:

Tiêu đề:

Không tìm thấy dự án

Mô tả:

Không có dự án nào phù hợp với từ khóa hoặc bộ lọc hiện tại.

Nút:

Xóa bộ lọc

Phải phân biệt rõ:

- Empty database.
- No-result do filter.

================================================== 19. ERROR STATE
==================================================

Tạo `error.tsx` hoặc component lỗi phù hợp.

Danh sách:

Tiêu đề:

Không thể tải danh sách dự án

Mô tả:

Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.

Nút:

Thử lại

Trang chi tiết:

Tiêu đề:

Không thể tải thông tin dự án

Không hiển thị lỗi kỹ thuật cho người dùng.

================================================== 20. PHÂN TRANG
==================================================

Hiển thị:

- Trang hiện tại.
- Tổng số trang.
- Tổng số dự án.
- Nút Trang trước.
- Nút Trang sau.
- Page size nếu design system hiện tại hỗ trợ.

Query:

- page
- pageSize

Quy tắc:

- Không cho page < 1.
- Không cho page > totalPages.
- Khi filter/search thay đổi, page về 1.
- Nếu sau khi xóa, page hiện tại không còn dữ liệu, điều chỉnh hợp lý.
- Không fetch toàn bộ dữ liệu chỉ để phân trang client-side.

================================================== 21. SẮP XẾP
==================================================

Nếu API hỗ trợ:

- Mã dự án.
- Tên dự án.
- Ngày bắt đầu.
- Ngày kết thúc.
- Ngày tạo.

Query:

- sortBy
- sortOrder

Header sortable phải:

- Có indicator.
- Có aria-label phù hợp.
- Không sort giả ở client.
- Không cho sort theo field backend không hỗ trợ.

================================================== 22. RESPONSIVE
==================================================

Desktop:

- Table đầy đủ.

Tablet:

- Có thể ẩn cột mô tả.
- Có thể gộp ngày.
- Giữ:
  - Mã.
  - Tên.
  - Trạng thái.
  - Tiến độ.
  - Người quản lý.
  - Thao tác.

Mobile:

Ưu tiên card list.

Mỗi card hiển thị:

- Mã dự án.
- Tên dự án.
- Status badge.
- Progress.
- Người quản lý.
- Phòng ban.
- Thời gian.
- Menu thao tác.

Dialog:

- Vừa màn hình nhỏ.
- Có scroll.
- Footer không bị che.
- Không để form bị tràn ngang.

================================================== 23. ACCESSIBILITY
==================================================

Yêu cầu:

- Input có label.
- Error liên kết với input.
- Dialog quản lý focus đúng.
- Có thể thao tác bằng bàn phím.
- Icon-only button có aria-label.
- Menu thao tác có keyboard navigation.
- Không chỉ dùng màu để thể hiện status.
- Progress có label hoặc aria-valuenow phù hợp.
- Button loading có aria-busy nếu phù hợp.
- Confirmation dialog có tiêu đề và mô tả rõ ràng.
- Form submit được bằng Enter khi hợp lý.
- Không khóa Escape khi không đang submit.
- Link chi tiết có nội dung dễ hiểu.

================================================== 24. FORM STATE VÀ UX
==================================================

- Form tạo và form sửa có state riêng.
- Khi đóng dialog tạo, reset form.
- Khi chuyển sang dự án khác, không giữ dữ liệu cũ.
- Không mở nhiều mutation dialog cùng lúc.
- Không mất dữ liệu form khi API trả lỗi.
- Không tự đóng dialog khi lỗi.
- Ngăn double submit.
- Disable action trong lúc xử lý.
- Không dùng optimistic update cho thao tác xóa hoặc đổi trạng thái nếu chưa có cơ chế rollback an toàn.
- Không lưu dữ liệu form vào localStorage nếu chưa được yêu cầu.

================================================== 25. DATE HANDLING
==================================================

Yêu cầu đặc biệt:

- Kiểm tra cách backend lưu và trả ngày.
- Không format ngày gây lệch một ngày do timezone.
- Không tự thêm giờ local vào chuỗi date-only nếu API dùng date-only.
- Tạo helper dùng chung nếu project đã có convention.
- Không tạo nhiều utility format ngày trùng lặp.

Hiển thị đề xuất:

dd/MM/yyyy

Nếu có thời gian:

dd/MM/yyyy HH:mm

Chỉ hiển thị time khi dữ liệu thực sự có ý nghĩa.

================================================== 26. TYPE SAFETY
==================================================

Tạo type rõ ràng cho:

- ProjectListItem
- ProjectDetail
- ProjectStatus
- ProjectListResponse
- ProjectPagination
- CreateProjectInput
- UpdateProjectInput
- ChangeProjectStatusInput
- DepartmentOption
- ProjectManagerOption
- ApiErrorResponse

Không dùng `any`.

Không dùng Prisma type trực tiếp trong Client Component nếu type đó chứa field thừa hoặc relation nội bộ.

Không dùng type assertion để che lỗi nếu chưa xác minh dữ liệu.

================================================== 27. TESTING
==================================================

Viết test theo hệ thống test hiện tại.

Quyền:

[ ] ADMIN thấy nút tạo dự án
[ ] MANAGER thấy nút tạo nếu backend cho phép
[ ] MEMBER không thấy nút tạo
[ ] MEMBER không thấy edit/status/delete
[ ] MANAGER chỉ thấy action trên dự án được quản lý
[ ] Role không lấy từ localStorage

Danh sách:

[ ] Hiển thị danh sách đúng
[ ] Hiển thị mã dự án
[ ] Hiển thị phòng ban
[ ] Hiển thị người quản lý
[ ] Hiển thị status badge đúng
[ ] Hiển thị progress đúng
[ ] Hiển thị member count
[ ] Hiển thị task count
[ ] STT đúng theo phân trang

Search và filter:

[ ] Search cập nhật URL
[ ] Status filter cập nhật URL
[ ] Department filter cập nhật URL
[ ] Manager filter cập nhật URL
[ ] Date filter cập nhật URL
[ ] Thay filter đưa page về 1
[ ] Xóa filter hoạt động
[ ] Không gửi query rỗng

Tạo dự án:

[ ] Validate mã dự án
[ ] Validate tên dự án
[ ] Validate phòng ban
[ ] Validate người quản lý
[ ] Validate ngày
[ ] Tạo thành công
[ ] Mã trùng hiển thị đúng
[ ] Manager không hợp lệ hiển thị đúng
[ ] Không gửi actorId
[ ] Không gửi createdById
[ ] Disable khi submit

Sửa dự án:

[ ] Form điền dữ liệu hiện tại
[ ] Không giữ dữ liệu dự án trước
[ ] Sửa thành công
[ ] Không sửa status trong form chung
[ ] Không gửi field hệ thống
[ ] Không gửi request rỗng nếu đã xử lý rule này

Status:

[ ] Mở dialog đổi trạng thái
[ ] Chỉ hiển thị transition hợp lệ
[ ] Đổi status thành công
[ ] Transition sai hiển thị lỗi
[ ] Dialog không đóng khi lỗi

Xóa:

[ ] Chỉ ADMIN thấy nút xóa
[ ] Có confirmation dialog
[ ] Xóa thành công
[ ] PROJECT_HAS_TASKS hiển thị đúng
[ ] PROJECT_HAS_MEMBERS hiển thị đúng
[ ] Dialog không đóng khi lỗi

Detail page:

[ ] Hiển thị thông tin dự án
[ ] Hiển thị thống kê
[ ] 404 khi không tìm thấy
[ ] 403 khi không có quyền
[ ] Action đúng theo role

States:

[ ] Loading skeleton
[ ] Empty state
[ ] No-result state
[ ] Error state
[ ] Responsive cơ bản
[ ] Accessibility cơ bản

Không tạo snapshot test lớn nếu không mang lại giá trị.

================================================== 28. DESIGN
==================================================

Tuân thủ design system hiện tại.

Phong cách mong muốn:

- Chuyên nghiệp.
- Hiện đại.
- Gọn.
- Phù hợp hệ thống quản trị nội bộ.
- Dễ quét thông tin.
- Tiến độ và trạng thái dễ nhận biết.
- Không dùng quá nhiều màu.
- CTA chính rõ ràng.
- Hành động nguy hiểm được phân biệt hợp lý.
- Không biến trang thành dashboard quá nhiều card.

Nếu đã có component:

- Button
- Input
- Textarea
- Select
- Combobox
- DatePicker
- Dialog
- AlertDialog
- Table
- Badge
- DropdownMenu
- Pagination
- Skeleton
- Toast
- Progress
- Card
- Form

phải tái sử dụng.

Không tạo component trùng lặp nếu repository đã có.

================================================== 29. NHỮNG ĐIỀU KHÔNG ĐƯỢC LÀM
==================================================

- Không sửa Prisma schema.
- Không tạo migration.
- Không thay đổi Authentication.
- Không thay đổi business rule backend.
- Không gọi Prisma từ Client Component.
- Không dùng `any`.
- Không hard-code dự án.
- Không hard-code phòng ban.
- Không hard-code người quản lý.
- Không tự tạo endpoint backend.
- Không thêm Project Members CRUD.
- Không thêm Tasks UI.
- Không thêm comments.
- Không thêm file upload.
- Không thêm Gantt.
- Không thêm Kanban.
- Không thêm import/export.
- Không thêm bulk actions.
- Không thêm notification.
- Không refactor toàn dashboard.
- Không cài package mới nếu chưa thật sự cần.
- Không dùng UI để thay thế authorization backend.
- Không hiển thị raw enum hoặc raw error cho người dùng.
- Không tự tính progress nếu backend chưa xác định.
- Không dùng `window.location.reload()` nếu không cần thiết.

================================================== 30. TRÌNH TỰ THỰC HIỆN
==================================================

Trước khi code:

1. Đọc toàn bộ tài liệu.
2. Kiểm tra Projects API thực tế.
3. Kiểm tra response list và detail.
4. Kiểm tra Departments API.
5. Kiểm tra endpoint lấy Project Manager.
6. Kiểm tra SessionUser.
7. Kiểm tra permission hiện tại.
8. Kiểm tra design system.
9. Kiểm tra component dùng chung.
10. Kiểm tra cách xử lý search params.
11. Kiểm tra date utilities.
12. Kiểm tra toast và error mapping.
13. Đề xuất layout.
14. Liệt kê file sẽ tạo hoặc sửa.
15. Phân loại Server Component và Client Component.
16. Nêu dependency backend còn thiếu nếu có.
17. Không sửa code trước khi hoàn thành phân tích.

Trong khi code:

1. Tạo types UI.
2. Tạo mapper hoặc adapter dữ liệu nếu cần.
3. Tạo page danh sách.
4. Tạo toolbar.
5. Tạo search/filter/sort.
6. Tạo table và mobile card.
7. Tạo pagination.
8. Tạo form dùng chung.
9. Tạo dialog tạo.
10. Tạo dialog sửa.
11. Tạo dialog đổi trạng thái.
12. Tạo dialog xóa.
13. Tạo trang chi tiết.
14. Tạo loading/empty/error states.
15. Kiểm tra quyền hiển thị.
16. Viết test.
17. Cập nhật docs nếu UI flow khác tài liệu.

================================================== 31. DEFINITION OF DONE
==================================================

Chỉ xem là hoàn thành khi:

[ ] Route danh sách Projects hoạt động
[ ] Route chi tiết Project hoạt động
[ ] Dữ liệu lấy từ backend thật
[ ] Search hoạt động
[ ] Filter status hoạt động
[ ] Filter department hoạt động
[ ] Filter manager hoạt động nếu backend hỗ trợ
[ ] Date filter hoạt động nếu API hỗ trợ
[ ] Sort hoạt động nếu API hỗ trợ
[ ] Pagination hoạt động
[ ] Tạo dự án hoạt động
[ ] Sửa dự án hoạt động
[ ] Đổi trạng thái hoạt động
[ ] Xóa dự án hoạt động theo quyền
[ ] Trang chi tiết hiển thị đúng
[ ] Quyền ADMIN hoạt động
[ ] Quyền MANAGER hoạt động
[ ] Quyền MEMBER hoạt động
[ ] Không hiển thị action trái quyền
[ ] Có loading state
[ ] Có empty state
[ ] Có no-result state
[ ] Có error state
[ ] Có toast hoặc feedback
[ ] Có confirmation dialog
[ ] Có validation
[ ] Có mapping API error
[ ] Có responsive
[ ] Có accessibility cơ bản
[ ] Không dùng any
[ ] Không import Prisma trong Client Component
[ ] Không hard-code dữ liệu
[ ] Không triển khai tính năng ngoài scope
[ ] Test liên quan thành công
[ ] pnpm lint thành công
[ ] pnpm exec tsc --noEmit thành công
[ ] pnpm test thành công
[ ] pnpm build thành công

================================================== 32. BÁO CÁO SAU KHI HOÀN THÀNH
==================================================

Sau khi hoàn thành, báo cáo:

1. Các file đã tạo.
2. Các file đã sửa.
3. Route đã xây dựng.
4. Cấu trúc Server Component và Client Component.
5. Cách lấy dữ liệu danh sách.
6. Cách lấy dữ liệu chi tiết.
7. Cách đồng bộ URL state.
8. Cách xử lý quyền theo role.
9. Cách xử lý quyền trên từng dự án.
10. Cách xử lý create/edit/status/delete.
11. Cách xử lý date.
12. Cách xử lý API error.
13. Các test đã viết.
14. Kết quả lint.
15. Kết quả type-check.
16. Kết quả test.
17. Kết quả build.
18. Những giả định đã sử dụng.
19. Những dependency backend còn thiếu.
20. Những phần chưa xác minh hoặc rủi ro còn lại.
