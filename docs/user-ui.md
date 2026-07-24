Đọc kỹ các file sau trước khi sửa code:

- AGENTS.md
- docs/PRODUCT.md
- docs/REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DATABASE.md
- docs/API.md

Kiểm tra implementation thực tế của:

- Users API
- Departments API
- Authentication
- SessionUser
- Design system hiện tại
- Components dùng chung
- Error response format
- Toast system
- Form validation
- Table và pagination hiện tại

Mục tiêu:
Xây dựng hoàn chỉnh UI quản lý người dùng cho LYDINC TaskHub.

Phạm vi tập trung vào trang quản trị người dùng và tích hợp với Users API đã có.

Không sửa Prisma schema, migration hoặc business logic backend nếu không thật sự cần thiết.

==================================================

1. ROUTE VÀ PHẠM VI
   \==================================================

Xây dựng trang:

/admin/users

Chỉ ADMIN được truy cập trang quản trị người dùng.

Nếu MANAGER hoặc MEMBER truy cập trực tiếp:

- Chuyển đến trang phù hợp.
  hoặc
- Hiển thị trang 403 theo convention hiện tại.

Trang hỗ trợ:

1. Hiển thị danh sách người dùng.
2. Tìm kiếm theo tên hoặc email.
3. Lọc theo vai trò.
4. Lọc theo trạng thái.
5. Lọc theo phòng ban.
6. Phân trang.
7. Tạo người dùng.
8. Xem thông tin chi tiết.
9. Chỉnh sửa người dùng.
10. Thay đổi trạng thái tài khoản.
11. Reset mật khẩu.
12. Hiển thị loading state.
13. Hiển thị empty state.
14. Hiển thị no-result state.
15. Hiển thị error state.
16. Hiển thị toast thành công hoặc lỗi.

Không triển khai:

- Xóa user vật lý.
- Import Excel.
- Export Excel.
- Bulk action.
- Gửi email mời.
- Avatar upload.
- Phân quyền tùy biến.
- Reset password qua email.
- Audit log UI đầy đủ nếu chưa thuộc scope.

================================================== 2. API SỬ DỤNG
==================================================

GET /api/users
POST /api/users
GET /api/users/:userId
PATCH /api/users/:userId
PATCH /api/users/:userId/status
PATCH /api/users/:userId/password

Departments:

GET /api/departments

Dùng Departments API để hiển thị lựa chọn phòng ban.

Kiểm tra response thực tế trước khi code.
Không giả định code giống hoàn toàn tài liệu.

================================================== 3. CẤU TRÚC FILE ĐỀ XUẤT
==================================================

Kiểm tra cấu trúc hiện tại trước khi tạo file.

Đề xuất:

src/app/(dashboard)/admin/users/
├── page.tsx
├── loading.tsx
└── error.tsx

src/components/users/
├── user-page-header.tsx
├── user-toolbar.tsx
├── user-search.tsx
├── user-filters.tsx
├── user-table.tsx
├── user-table-row.tsx
├── user-pagination.tsx
├── user-form.tsx
├── create-user-dialog.tsx
├── edit-user-dialog.tsx
├── user-detail-dialog.tsx
├── change-user-status-dialog.tsx
├── reset-user-password-dialog.tsx
├── user-empty-state.tsx
├── user-table-skeleton.tsx
├── user-role-badge.tsx
└── user-status-badge.tsx

Không bắt buộc tạo mọi file nếu có thể tổ chức gọn hơn.

Không gom toàn bộ logic vào một Client Component lớn.

================================================== 4. KIẾN TRÚC UI
==================================================

- Page ưu tiên là Server Component.
- Lấy session ở server.
- Chỉ render trang quản trị nếu actor là ADMIN.
- Dữ liệu ban đầu có thể lấy bằng service server-side hoặc API theo convention hiện tại.
- Client Component chỉ dùng cho:
  - Search tương tác.
  - Filter.
  - Pagination tương tác.
  - Dialog.
  - Form.
  - Mutation.
  - Toast.
- Không import Prisma vào Client Component.
- Không đặt business rule trong UI.
- Backend vẫn kiểm tra quyền cuối cùng.
- Không đọc role từ localStorage.
- Không dùng `any`.

================================================== 5. BỐ CỤC TRANG
==================================================

A. Page Header

Tiêu đề:

Quản lý người dùng

Mô tả:

Quản lý tài khoản, vai trò, trạng thái và phòng ban của người dùng trong hệ thống.

Nút chính:

Thêm người dùng

Nút chỉ hiển thị cho ADMIN.

B. Khu vực thống kê ngắn nếu dữ liệu hiện tại hỗ trợ

Có thể hiển thị:

- Tổng người dùng.
- Đang hoạt động.
- Bị khóa.
- Không hoạt động.

Chỉ triển khai nếu API hiện tại hỗ trợ hiệu quả.
Không gọi nhiều API thừa chỉ để tạo các card thống kê.

C. Thanh công cụ

Bao gồm:

- Ô tìm kiếm.
- Bộ lọc vai trò.
- Bộ lọc trạng thái.
- Bộ lọc phòng ban.
- Nút xóa bộ lọc.
- Có thể chọn pageSize nếu design system hiện tại hỗ trợ.

================================================== 6. SEARCH VÀ FILTER
==================================================

Query parameters cần đồng bộ lên URL:

- search
- role
- status
- departmentId
- page
- pageSize
- sortBy
- sortOrder

Ví dụ:

/admin/users?search=nguyen&role=MEMBER&status=ACTIVE&page=1&pageSize=20

Quy tắc:

- Khi thay search hoặc filter, đưa page về 1.
- Search debounce khoảng 300–500 ms hoặc chỉ tìm khi Enter.
- Nút xóa bộ lọc phải đưa về trạng thái mặc định.
- Refresh trang không mất filter.
- Browser Back/Forward hoạt động đúng.
- Không gửi query parameter rỗng không cần thiết.

Placeholder:

Tìm theo tên hoặc email...

Role filter:

- Tất cả vai trò
- Quản trị viên
- Quản lý
- Thành viên

Status filter:

- Tất cả trạng thái
- Đang hoạt động
- Không hoạt động
- Bị khóa

Department filter:

- Tất cả phòng ban
- Danh sách từ API Departments

================================================== 7. BẢNG NGƯỜI DÙNG
==================================================

Các cột đề xuất:

1. STT
2. Người dùng
3. Email
4. Phòng ban
5. Vai trò
6. Trạng thái
7. Ngày tạo
8. Thao tác

Trong cột Người dùng có thể hiển thị:

- Avatar chữ cái đầu.
- Họ tên.
- ID không cần hiển thị.

Không bắt buộc có avatar hình ảnh.

Quy tắc:

- Email có thể copy nếu phù hợp.
- Department rỗng hiển thị dấu gạch hoặc “Chưa phân phòng”.
- Role hiển thị bằng badge.
- Status hiển thị bằng badge.
- Ngày hiển thị định dạng dễ đọc với người Việt.
- Không làm sai ngày do timezone.
- Menu thao tác không được quá nhiều nút nằm ngang.

Menu thao tác:

- Xem chi tiết.
- Chỉnh sửa.
- Khóa tài khoản.
- Mở khóa tài khoản.
- Chuyển sang không hoạt động.
- Kích hoạt tài khoản.
- Reset mật khẩu.

Chỉ hiển thị hành động phù hợp với trạng thái hiện tại.

Ví dụ:

ACTIVE:

- Chỉnh sửa.
- Khóa.
- Chuyển không hoạt động.
- Reset mật khẩu.

LOCKED:

- Mở khóa.
- Chuyển không hoạt động.
- Reset mật khẩu.

INACTIVE:

- Kích hoạt.
- Reset mật khẩu.

Không hiển thị nút “Xóa”.

================================================== 8. ROLE BADGE
==================================================

Hiển thị nhãn tiếng Việt:

ADMIN:
Quản trị viên

MANAGER:
Quản lý

MEMBER:
Thành viên

Dùng style nhất quán với design system.

Không chỉ dựa vào màu để phân biệt.
Badge phải có text rõ ràng.

================================================== 9. STATUS BADGE
==================================================

ACTIVE:
Đang hoạt động

INACTIVE:
Không hoạt động

LOCKED:
Bị khóa

Không hiển thị enum tiếng Anh trực tiếp cho người dùng cuối.

================================================== 10. FORM TẠO NGƯỜI DÙNG
==================================================

Dialog title:

Thêm người dùng

Các field:

1. Họ và tên
2. Email
3. Mật khẩu ban đầu
4. Vai trò
5. Phòng ban

---

10.1. Họ và tên
--------------------------------------------------

- Bắt buộc.
- Trim.
- Tối đa 150 ký tự.
- Placeholder:
  Nhập họ và tên

---

10.2. Email
--------------------------------------------------

- Bắt buộc.
- Đúng định dạng.
- Trim.
- Có thể lowercase trước khi gửi.
- Placeholder:
  name@lydinc.local

---

10.3. Mật khẩu
--------------------------------------------------

- Bắt buộc.
- Mặc định type password.
- Có nút hiện/ẩn mật khẩu nếu component hiện tại hỗ trợ.
- Không tự lưu vào localStorage.
- Không hiển thị lại sau khi submit thất bại nếu chính sách UI yêu cầu xóa field nhạy cảm.
- Hiển thị yêu cầu tối thiểu.

Có thể có nút tạo mật khẩu ngẫu nhiên chỉ khi đã có utility an toàn trong dự án.
Không tự thêm feature nếu chưa cần.

---

10.4. Vai trò
--------------------------------------------------

Select:

- Quản trị viên
- Quản lý
- Thành viên

Mặc định đề xuất:

MEMBER

Không cho submit giá trị ngoài enum.

---

10.5. Phòng ban
--------------------------------------------------

Select từ API Departments.

- Bắt buộc nếu backend yêu cầu.
- Hiển thị loading khi danh sách đang tải.
- Hiển thị empty state nếu chưa có phòng ban.
- Không hard-code department.

---

10.6. Submit
--------------------------------------------------

Nút:

- Hủy
- Tạo người dùng

Khi submit:

1. Validate client.
2. Disable form và nút.
3. Gọi POST /api/users.
4. Ngăn double submit.
5. Nếu thành công:
   - Đóng dialog.
   - Reset form.
   - Toast:
     Tạo người dùng thành công.
   - Refresh danh sách.
6. Nếu lỗi:
   - Giữ dialog mở.
   - Hiển thị field error nếu có.
   - Không hiển thị raw error.

Xử lý cụ thể:

EMAIL_ALREADY_EXISTS:
Email này đã được sử dụng.

DEPARTMENT_NOT_FOUND:
Phòng ban đã chọn không còn tồn tại. Vui lòng chọn lại.

FORBIDDEN:
Bạn không có quyền tạo người dùng.

================================================== 11. FORM CHỈNH SỬA NGƯỜI DÙNG
==================================================

Dialog title:

Chỉnh sửa người dùng

Field:

- Họ và tên.
- Email.
- Vai trò.
- Phòng ban.

Không hiển thị password trong form chỉnh sửa chung.

Không gửi:

- password.
- passwordHash.
- status.
- createdAt.
- actorId.

Khi mở dialog:

- Điền dữ liệu hiện tại.
- Không dùng dữ liệu stale nếu detail API đã thay đổi.
- Có thể dùng dữ liệu row nếu đủ, hoặc fetch detail theo API.

Khi submit:

- Chỉ gửi field được phép.
- Không gửi request nếu không có thay đổi, hoặc xử lý thông báo phù hợp.
- Disable khi đang submit.
- Toast khi thành công.
- Refresh danh sách.

Xử lý lỗi:

EMAIL_ALREADY_EXISTS:
Email này đã được sử dụng bởi tài khoản khác.

CANNOT_LOCK_LAST_ADMIN hoặc lỗi liên quan ADMIN cuối cùng:
Không thể thay đổi vai trò vì hệ thống phải còn ít nhất một quản trị viên đang hoạt động.

================================================== 12. XEM CHI TIẾT NGƯỜI DÙNG
==================================================

Có thể dùng dialog hoặc trang chi tiết.

Trong scope này, ưu tiên dialog để giữ luồng quản trị đơn giản.

Hiển thị:

- Họ tên.
- Email.
- Vai trò.
- Trạng thái.
- Phòng ban.
- Ngày tạo.
- Ngày cập nhật.

Không hiển thị:

- passwordHash.
- Thông tin session.
- Dữ liệu nhạy cảm.

================================================== 13. THAY ĐỔI TRẠNG THÁI
==================================================

Dùng dialog xác nhận.

Các hành động:

- Khóa tài khoản.
- Mở khóa tài khoản.
- Chuyển sang không hoạt động.
- Kích hoạt tài khoản.

Endpoint:

PATCH /api/users/:userId/status

Request:

{
"status": "LOCKED"
}

---

13.1. Khóa tài khoản
--------------------------------------------------

Tiêu đề:

Khóa tài khoản

Nội dung:

Tài khoản “{userName}” sẽ không thể đăng nhập hoặc tiếp tục sử dụng hệ thống.

Nút:

- Hủy
- Khóa tài khoản

---

13.2. Mở khóa
--------------------------------------------------

Tiêu đề:

Mở khóa tài khoản

Nội dung:

Tài khoản “{userName}” sẽ có thể đăng nhập lại nếu thông tin xác thực hợp lệ.

---

13.3. Không hoạt động
--------------------------------------------------

Tiêu đề:

Chuyển tài khoản sang không hoạt động

Nội dung:

Tài khoản sẽ bị vô hiệu hóa nhưng dữ liệu lịch sử vẫn được giữ lại.

---

13.4. Kích hoạt
--------------------------------------------------

Tiêu đề:

Kích hoạt tài khoản

Nội dung:

Tài khoản sẽ được phép sử dụng lại hệ thống.

---

13.5. Lỗi
--------------------------------------------------

CANNOT_LOCK_LAST_ADMIN:

Không thể khóa hoặc vô hiệu hóa quản trị viên đang hoạt động cuối cùng của hệ thống.

CANNOT_DISABLE_CURRENT_USER:

Bạn không thể khóa hoặc vô hiệu hóa chính tài khoản đang sử dụng.

USER_NOT_FOUND:

Người dùng không còn tồn tại. Danh sách sẽ được cập nhật lại.

Không đóng dialog nếu thao tác thất bại.

================================================== 14. RESET MẬT KHẨU
==================================================

Dialog title:

Đặt lại mật khẩu

Nội dung cảnh báo:

Bạn đang đặt lại mật khẩu cho tài khoản “{userName}”.

Field:

- Mật khẩu mới.
- Xác nhận mật khẩu mới.

Validation:

- Mật khẩu đạt yêu cầu.
- Xác nhận mật khẩu phải khớp.
- Không lưu mật khẩu vào localStorage.
- Không hiển thị mật khẩu trong toast.
- Không gửi email tự động nếu backend chưa hỗ trợ.

Nút:

- Hủy
- Đặt lại mật khẩu

Sau khi thành công:

- Đóng dialog.
- Xóa dữ liệu mật khẩu khỏi state.
- Toast:
  Đặt lại mật khẩu thành công.

Không hiển thị lại mật khẩu sau khi thành công.

================================================== 15. LOADING STATE
==================================================

Tạo skeleton cho:

- Toolbar.
- Table header.
- 5–8 dòng dữ liệu.
- Badge.
- Action menu.

Không chỉ hiển thị chữ “Loading...”.

Khi submit từng dialog:

- Chỉ loading dialog đó.
- Không khóa toàn trang nếu không cần thiết.

================================================== 16. EMPTY STATE
==================================================

Nếu chưa có user:

Tiêu đề:

Chưa có người dùng

Mô tả:

Hãy tạo tài khoản đầu tiên để bắt đầu phân quyền và tổ chức nhân sự trong hệ thống.

Nút:

Thêm người dùng

Nếu tìm kiếm hoặc lọc không có kết quả:

Tiêu đề:

Không tìm thấy người dùng

Mô tả:

Không có người dùng nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.

Nút:

Xóa bộ lọc

================================================== 17. ERROR STATE
==================================================

Tạo `error.tsx` hoặc component phù hợp.

Nội dung:

Không thể tải danh sách người dùng.

Nút:

Thử lại

Không hiển thị:

- Stack trace.
- Raw Prisma error.
- Internal error object.
- HTML error từ server.

================================================== 18. PHÂN TRANG
==================================================

Hiển thị:

- Trang hiện tại.
- Tổng số trang.
- Tổng số người dùng.
- Trang trước.
- Trang sau.
- Page size nếu design hiện tại hỗ trợ.

STT phải tính đúng theo page:

STT = (page - 1) * pageSize + rowIndex + 1

Khi filter thay đổi:

page = 1

Không cho đi tới page nhỏ hơn 1 hoặc lớn hơn totalPages.

================================================== 19. SẮP XẾP
==================================================

Nếu API đã hỗ trợ:

- Họ tên.
- Email.
- Ngày tạo.

Query:

- sortBy
- sortOrder

Không triển khai sort giả ở client nếu danh sách đang phân trang từ server.

Nếu API chưa hỗ trợ ổn định, không bắt buộc làm trong scope đầu tiên.

================================================== 20. RESPONSIVE
==================================================

Desktop:

- Hiển thị bảng đầy đủ.

Tablet:

- Có thể ẩn bớt cột ít quan trọng.
- Giữ tên, email, role, status và thao tác.

Mobile:

Chọn một trong hai:

1. Card list.
2. Table scroll ngang có kiểm soát.

Ưu tiên card nếu bảng quá nhiều cột.

Dialog phải:

- Vừa màn hình.
- Có thể cuộn.
- Không để footer bị mất.
- Không để bàn phím ảo che submit trên mobile nếu có thể tránh.

================================================== 21. ACCESSIBILITY
==================================================

- Input có label.
- Error liên kết với input.
- Dialog quản lý focus.
- Có thể đóng bằng Escape khi không submit.
- Icon-only button có aria-label.
- Dropdown có keyboard navigation.
- Badge có text.
- Không chỉ dùng màu để thể hiện status.
- Button loading có aria-busy nếu phù hợp.
- Form submit được bằng bàn phím.
- Confirmation dialog có tiêu đề và mô tả rõ ràng.

================================================== 22. XỬ LÝ API ERROR
==================================================

Tạo helper hoặc mapping error code sang message người dùng.

Ví dụ:

EMAIL_ALREADY_EXISTS
→ Email này đã được sử dụng.

USER_NOT_FOUND
→ Người dùng không còn tồn tại.

DEPARTMENT_NOT_FOUND
→ Phòng ban không còn tồn tại.

CANNOT_LOCK_LAST_ADMIN
→ Hệ thống phải còn ít nhất một quản trị viên đang hoạt động.

CURRENT_PASSWORD_INVALID
→ Mật khẩu hiện tại không chính xác.

FORBIDDEN
→ Bạn không có quyền thực hiện thao tác này.

VALIDATION_ERROR
→ Dữ liệu nhập chưa hợp lệ.

INTERNAL_SERVER_ERROR
→ Đã xảy ra lỗi hệ thống. Vui lòng thử lại.

Không hiển thị raw error message nếu message đó chứa thông tin kỹ thuật.

================================================== 23. DATA FETCHING VÀ REFRESH
==================================================

Ưu tiên Server Component lấy dữ liệu ban đầu.

Sau mutation:

- router.refresh()
  hoặc
- revalidatePath/revalidateTag theo kiến trúc hiện tại.

Không dùng `window.location.reload()` nếu không cần thiết.

Không gọi API nội bộ qua absolute URL từ Server Component nếu có thể gọi service trực tiếp.

Tránh duplicate request giữa Server Component và Client Component.

================================================== 24. FORM STATE
==================================================

- Form tạo và form sửa có state độc lập.
- Khi đóng dialog tạo, reset dữ liệu.
- Khi đóng dialog reset password, xóa password khỏi state.
- Không để dữ liệu user trước còn trong dialog của user sau.
- Không mở nhiều dialog mutation cùng lúc.
- Không giữ password trong global state.

================================================== 25. TESTING
==================================================

Viết test theo hệ thống hiện tại.

Quyền:
[ ] ADMIN truy cập được trang
[ ] MANAGER không truy cập được
[ ] MEMBER không truy cập được
[ ] Role không lấy từ localStorage

Danh sách:
[ ] Hiển thị danh sách đúng
[ ] Không hiển thị passwordHash
[ ] Badge role đúng
[ ] Badge status đúng
[ ] STT đúng theo pagination
[ ] Department hiển thị đúng

Search và filter:
[ ] Search cập nhật URL
[ ] Role filter cập nhật URL
[ ] Status filter cập nhật URL
[ ] Department filter cập nhật URL
[ ] Thay filter đưa page về 1
[ ] Xóa filter hoạt động

Tạo user:
[ ] Form validate tên
[ ] Form validate email
[ ] Form validate password
[ ] Form yêu cầu department nếu bắt buộc
[ ] Tạo thành công
[ ] Email trùng hiển thị đúng lỗi
[ ] Không gửi actorId
[ ] Không gửi passwordHash
[ ] Disable submit khi đang xử lý

Sửa user:
[ ] Form điền dữ liệu hiện tại
[ ] Sửa thành công
[ ] Email trùng hiển thị đúng
[ ] Không có field password trong form sửa chung
[ ] Không gửi request rỗng nếu đã xử lý rule này

Status:
[ ] Mở dialog khóa
[ ] Khóa thành công
[ ] Mở khóa thành công
[ ] Kích hoạt thành công
[ ] Chuyển inactive thành công
[ ] Lỗi ADMIN cuối cùng hiển thị đúng
[ ] Dialog không đóng khi lỗi

Reset password:
[ ] Validate mật khẩu
[ ] Validate confirm password
[ ] Reset thành công
[ ] Xóa password khỏi state sau thành công
[ ] Không hiển thị password trong toast

States:
[ ] Loading skeleton
[ ] Empty state
[ ] No-result state
[ ] Error state
[ ] Responsive cơ bản

================================================== 26. DESIGN
==================================================

Tuân thủ design system hiện tại.

Phong cách:

- Chuyên nghiệp.
- Gọn.
- Phù hợp phần mềm quản trị nội bộ.
- Dễ nhận biết role và status.
- Không dùng quá nhiều màu.
- CTA chính rõ.
- Hành động khóa hoặc vô hiệu hóa phải có cảnh báo phù hợp.

Tái sử dụng component sẵn có:

- Button
- Input
- Select
- Dialog
- AlertDialog
- Table
- Badge
- DropdownMenu
- Pagination
- Skeleton
- Toast
- Form

Không tạo component trùng nếu repository đã có.

================================================== 27. NHỮNG ĐIỀU KHÔNG ĐƯỢC LÀM
==================================================

- Không sửa Prisma schema.
- Không tạo migration.
- Không thay đổi Authentication.
- Không triển khai xóa user.
- Không hard-code danh sách phòng ban.
- Không hard-code dữ liệu user.
- Không dùng any.
- Không import Prisma vào Client Component.
- Không lưu mật khẩu vào localStorage.
- Không hiển thị passwordHash.
- Không tự tạo role mới.
- Không thêm bulk action.
- Không thêm import/export.
- Không gửi email.
- Không thêm avatar upload.
- Không refactor toàn dashboard.
- Không cài package nếu chưa cần.
- Không đặt business rule ADMIN cuối cùng trong UI.
- Không dùng UI để thay thế kiểm tra quyền backend.

================================================== 28. TRÌNH TỰ THỰC HIỆN
==================================================

Trước khi code:

1. Đọc tài liệu.
2. Kiểm tra Users API thực tế.
3. Kiểm tra Departments API.
4. Kiểm tra SessionUser.
5. Kiểm tra design system.
6. Kiểm tra component form, dialog và table.
7. Kiểm tra cách project hiện tại xử lý query parameters.
8. Kiểm tra toast và error handling.
9. Đề xuất layout.
10. Liệt kê file tạo/sửa.
11. Nêu phần Server Component và Client Component.
12. Không sửa code trước khi hiểu luồng hiện tại.

Trong khi code:

1. Tạo types UI.
2. Tạo page và data fetching.
3. Tạo toolbar.
4. Tạo table.
5. Tạo search/filter.
6. Tạo pagination.
7. Tạo form dùng chung.
8. Tạo dialog tạo.
9. Tạo dialog sửa.
10. Tạo dialog status.
11. Tạo dialog reset password.
12. Tạo loading/empty/error state.
13. Viết tests.

================================================== 29. DEFINITION OF DONE
==================================================

[ ] /admin/users hoạt động
[ ] Chỉ ADMIN truy cập được
[ ] Danh sách lấy từ backend thật
[ ] Search hoạt động
[ ] Lọc role hoạt động
[ ] Lọc status hoạt động
[ ] Lọc department hoạt động
[ ] Pagination hoạt động
[ ] Tạo user hoạt động
[ ] Sửa user hoạt động
[ ] Khóa/mở khóa hoạt động
[ ] Active/inactive hoạt động
[ ] Reset password hoạt động
[ ] Không có chức năng xóa user
[ ] Không hiển thị passwordHash
[ ] Có loading state
[ ] Có empty state
[ ] Có no-result state
[ ] Có error state
[ ] Có confirmation dialog
[ ] Có toast
[ ] Responsive
[ ] Accessibility cơ bản
[ ] Không dùng any
[ ] Test thành công
[ ] pnpm lint thành công
[ ] pnpm exec tsc --noEmit thành công
[ ] pnpm test thành công
[ ] pnpm build thành công

================================================== 30. BÁO CÁO SAU KHI HOÀN THÀNH
==================================================

Báo cáo:

1. File đã tạo.
2. File đã sửa.
3. Cấu trúc Server/Client Component.
4. Cách lấy dữ liệu.
5. Cách đồng bộ filter với URL.
6. Cách xử lý role và status.
7. Cách xử lý form tạo/sửa.
8. Cách xử lý reset password.
9. Cách map API error.
10. Test đã viết.
11. Kết quả lint.
12. Kết quả type-check.
13. Kết quả test.
14. Kết quả build.
15. Giả định đã sử dụng.
16. Phần chưa xác minh.
