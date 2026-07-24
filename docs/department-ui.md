Đọc kỹ các file sau trước khi sửa code:

- AGENTS.md
- docs/PRODUCT.md
- docs/REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/DATABASE.md

Mục tiêu:
Xây dựng hoàn chỉnh giao diện quản lý phòng ban cho module Departments của dự án LYDINC TaskHub.

Phạm vi chỉ bao gồm UI và luồng tích hợp với API Departments đã có.
Không sửa Prisma schema, migration, authentication hoặc business logic phía backend nếu không thật sự cần thiết.

==================================================

1. PHẠM VI CHỨC NĂNG
   \==================================================

Xây dựng trang:

/admin/departments

Trang phải hỗ trợ:

1. Hiển thị danh sách phòng ban.
2. Tìm kiếm phòng ban theo tên.
3. Hiển thị số lượng người dùng trong từng phòng ban.
4. Hiển thị số lượng dự án trong từng phòng ban.
5. Tạo phòng ban mới.
6. Chỉnh sửa phòng ban.
7. Xóa phòng ban.
8. Hiển thị thông báo thành công hoặc thất bại.
9. Có trạng thái loading.
10. Có trạng thái dữ liệu rỗng.
11. Có trạng thái lỗi.
12. Có xác nhận trước khi xóa.
13. Có phân trang nếu API đã hỗ trợ.
14. Ẩn thao tác quản trị với người không có quyền ADMIN.

Các endpoint sử dụng:

GET /api/departments
POST /api/departments
GET /api/departments/:departmentId
PATCH /api/departments/:departmentId
DELETE /api/departments/:departmentId

================================================== 2. YÊU CẦU KIẾN TRÚC
==================================================

Tuân thủ kiến trúc hiện tại của dự án.

- Ưu tiên Server Component cho page và dữ liệu ban đầu.
- Chỉ dùng Client Component cho:
  - Form.
  - Dialog.
  - Search tương tác.
  - Pagination tương tác.
  - Toast.
  - Nút tạo, sửa, xóa.
- Không import Prisma vào Client Component.
- Không chứa business logic trong UI.
- Không tự suy diễn quyền từ dữ liệu do client gửi lên.
- Role hiện tại phải lấy từ session phía server.
- UI chỉ ẩn hoặc hiện thao tác để cải thiện trải nghiệm.
- Backend vẫn là nơi kiểm tra quyền cuối cùng.
- Không thêm package mới nếu stack hiện tại đã đáp ứng được.
- Không refactor module không liên quan.

================================================== 3. CẤU TRÚC FILE ĐỀ XUẤT
==================================================

Kiểm tra cấu trúc hiện tại trước khi tạo file mới.

Cấu trúc đề xuất:

src/app/(dashboard)/admin/departments/
├── page.tsx
├── loading.tsx
└── error.tsx

src/components/departments/
├── department-page-header.tsx
├── department-table.tsx
├── department-table-row.tsx
├── department-search.tsx
├── department-pagination.tsx
├── department-form.tsx
├── create-department-dialog.tsx
├── edit-department-dialog.tsx
├── delete-department-dialog.tsx
├── department-empty-state.tsx
└── department-table-skeleton.tsx

Không bắt buộc tạo tất cả file trên nếu có thể tổ chức gọn hơn.
Không gom toàn bộ UI vào một file lớn.

================================================== 4. BỐ CỤC TRANG
==================================================

Trang quản lý phòng ban gồm các khu vực sau:

A. Page Header

Tiêu đề:

Quản lý phòng ban

Mô tả:

Quản lý danh sách phòng ban, đơn vị và thông tin liên quan trong hệ thống.

Nút hành động bên phải:

Thêm phòng ban

Nút này chỉ hiển thị cho ADMIN.

B. Thanh tìm kiếm và bộ lọc

Có ô tìm kiếm với placeholder:

Tìm theo tên phòng ban...

Hành vi:

- Giá trị tìm kiếm được đồng bộ lên URL bằng query parameter `search`.
- Không tìm kiếm lại sau mỗi ký tự nếu gây quá nhiều request.
- Có debounce khoảng 300–500 ms hoặc tìm kiếm khi người dùng nhấn Enter.
- Khi thay đổi từ khóa, đưa `page` về 1.
- Có nút xóa nhanh từ khóa nếu phù hợp.

C. Bảng dữ liệu

Các cột:

1. STT
2. Tên phòng ban
3. Mô tả
4. Số nhân sự
5. Số dự án
6. Ngày tạo
7. Thao tác

Quy tắc hiển thị:

- Mô tả dài phải được rút gọn hợp lý.
- Có tooltip hoặc title để xem toàn bộ mô tả nếu cần.
- Số nhân sự và số dự án hiển thị rõ ràng.
- Ngày tạo hiển thị theo định dạng dễ đọc với người Việt.
- Không làm sai lệch dữ liệu UTC khi format ngày.
- Cột thao tác chỉ hiện cho ADMIN.
- Không để bảng tràn ngang khó sử dụng trên màn hình nhỏ.

D. Phân trang

Hiển thị:

- Trang hiện tại.
- Tổng số trang.
- Tổng số phòng ban.
- Nút Trang trước.
- Nút Trang sau.
- Có thể chọn số dòng mỗi trang nếu hệ thống hiện tại hỗ trợ.

Query parameter:

- page
- pageSize
- search
- includeCounts=true

================================================== 5. FORM TẠO VÀ CHỈNH SỬA
==================================================

Form gồm:

1. Tên phòng ban
2. Mô tả

Validation phía client phải tương thích với backend.

Tên phòng ban:

- Bắt buộc.
- Trim khoảng trắng.
- Tối đa 150 ký tự.
- Hiển thị lỗi ngay dưới field.

Mô tả:

- Không bắt buộc.
- Tối đa 1000 ký tự.
- Có bộ đếm ký tự nếu phù hợp.

Không gửi các field không thuộc API như:

- actorId
- createdById
- createdAt
- userCount
- projectCount

A. Dialog tạo phòng ban

Tiêu đề:

Thêm phòng ban

Nút:

- Hủy
- Tạo phòng ban

Khi submit:

1. Disable nút submit.
2. Hiển thị trạng thái đang xử lý.
3. Gọi POST /api/departments.
4. Nếu thành công:
   - Đóng dialog.
   - Hiển thị toast thành công.
   - Refresh danh sách.
   - Reset form.
5. Nếu thất bại:
   - Giữ dialog mở.
   - Hiển thị lỗi đúng vị trí.
   - Không mất dữ liệu người dùng đã nhập.

B. Dialog chỉnh sửa phòng ban

Tiêu đề:

Chỉnh sửa phòng ban

Form phải được điền dữ liệu hiện tại.

Nút:

- Hủy
- Lưu thay đổi

Khi submit:

1. Chỉ gửi các field được phép.
2. Gọi PATCH /api/departments/:departmentId.
3. Không gửi request nếu dữ liệu không thay đổi, hoặc xử lý hợp lý.
4. Hiển thị lỗi tên trùng nếu API trả `DEPARTMENT_NAME_EXISTS`.
5. Sau khi thành công:
   - Đóng dialog.
   - Toast thành công.
   - Refresh dữ liệu.

================================================== 6. XÓA PHÒNG BAN
==================================================

Sử dụng dialog xác nhận.

Tiêu đề:

Xóa phòng ban

Nội dung cảnh báo:

Bạn có chắc chắn muốn xóa phòng ban “{departmentName}” không? Thao tác này không thể hoàn tác.

Nút:

- Hủy
- Xóa phòng ban

Nút xóa nên có kiểu cảnh báo.

Khi gọi:

DELETE /api/departments/:departmentId

Xử lý các lỗi cụ thể:

1. `DEPARTMENT_IN_USE`

Hiển thị:

Không thể xóa phòng ban này vì vẫn còn người dùng hoặc dự án đang liên kết.

Nếu API trả số lượng:

- Hiển thị số người dùng.
- Hiển thị số dự án.

2. `DEPARTMENT_NOT_FOUND`

Hiển thị:

Phòng ban không còn tồn tại. Danh sách sẽ được cập nhật lại.

3. `FORBIDDEN`

Hiển thị:

Bạn không có quyền thực hiện thao tác này.

4. Lỗi không xác định

Hiển thị:

Không thể xóa phòng ban. Vui lòng thử lại.

Không tự động đóng dialog nếu thao tác thất bại.

================================================== 7. TRẠNG THÁI GIAO DIỆN
==================================================

A. Loading state

Tạo skeleton cho bảng.

Skeleton nên mô phỏng:

- Header bảng.
- 5–8 dòng dữ liệu.
- Các ô dữ liệu.
- Nút thao tác.

Không chỉ hiển thị chữ “Loading...”.

B. Empty state

Khi hệ thống chưa có phòng ban:

Tiêu đề:

Chưa có phòng ban

Mô tả:

Hãy tạo phòng ban đầu tiên để bắt đầu tổ chức người dùng và dự án.

Nếu user là ADMIN, hiển thị nút:

Thêm phòng ban

Khi tìm kiếm không có kết quả:

Tiêu đề:

Không tìm thấy phòng ban

Mô tả:

Không có phòng ban nào phù hợp với từ khóa tìm kiếm.

Có nút:

Xóa bộ lọc

C. Error state

Tạo `error.tsx` hoặc component lỗi phù hợp.

Nội dung:

Không thể tải danh sách phòng ban.

Có nút:

Thử lại

Không hiển thị stack trace hoặc lỗi kỹ thuật cho người dùng.

================================================== 8. RESPONSIVE
==================================================

Trang phải sử dụng tốt trên:

- Desktop.
- Tablet.
- Mobile.

Desktop:

- Hiển thị bảng đầy đủ.

Mobile:

Có thể chọn một trong hai hướng:

1. Bảng có scroll ngang được kiểm soát.
2. Chuyển từng dòng thành card.

Ưu tiên giải pháp phù hợp với design system hiện tại.

Nút tạo phòng ban không được che khuất tiêu đề.

Dialog phải vừa màn hình nhỏ và có thể cuộn khi nội dung dài.

================================================== 9. ACCESSIBILITY
==================================================

Yêu cầu:

- Các button phải có tên rõ ràng.
- Icon-only button phải có `aria-label`.
- Dialog phải quản lý focus đúng.
- Có thể thao tác bằng bàn phím.
- Label phải liên kết đúng với input.
- Error message phải liên kết với field.
- Không chỉ dùng màu sắc để thể hiện lỗi.
- Nút xóa phải có nội dung hoặc mô tả rõ ràng.
- Trạng thái loading của nút nên có `aria-busy` nếu phù hợp.

================================================== 10. UX VÀ THÔNG BÁO
==================================================

Thông báo thành công:

- Tạo phòng ban thành công.
- Cập nhật phòng ban thành công.
- Xóa phòng ban thành công.

Thông báo lỗi cần ưu tiên message từ error code đã chuẩn hóa.

Không hiển thị trực tiếp:

- Raw Prisma error.
- Stack trace.
- HTML lỗi.
- Nội dung lỗi kỹ thuật.

Trong lúc submit:

- Disable các nút liên quan.
- Ngăn double-click.
- Không gửi request trùng.
- Không đóng dialog bằng thao tác ngoài ý muốn nếu đang xử lý.

================================================== 11. QUẢN LÝ URL VÀ STATE
==================================================

Ưu tiên lưu các trạng thái sau trong URL:

- search
- page
- pageSize

Ví dụ:

/admin/departments?search=chuyen-doi-so&page=1&pageSize=20

Lợi ích:

- Refresh không mất trạng thái.
- Có thể chia sẻ URL.
- Back/Forward hoạt động đúng.

Không lưu dialog state vào URL nếu chưa cần thiết.

================================================== 12. QUYỀN HIỂN THỊ
==================================================

Nếu người dùng là ADMIN:

- Hiển thị nút Thêm phòng ban.
- Hiển thị menu Sửa.
- Hiển thị menu Xóa.

Nếu người dùng là MANAGER hoặc MEMBER:

- Chỉ hiển thị danh sách và chi tiết được phép.
- Không hiển thị nút tạo, sửa, xóa.
- Không render menu thao tác rỗng.

Không lấy role từ localStorage.
Không tin role do Client Component tự xác định.
Role phải được truyền từ Server Component hoặc session hợp lệ.

================================================== 13. DATA FETCHING
==================================================

Ưu tiên Server Component đọc dữ liệu ban đầu.

Có thể triển khai theo một trong hai cách:

Cách 1:
Server Component gọi trực tiếp service phía server.

Cách 2:
Server Component gọi API nội bộ nếu kiến trúc hiện tại yêu cầu.

Ưu tiên cách phù hợp với dự án đang có.

Không gọi API nội bộ qua URL tuyệt đối một cách không cần thiết khi Server Component có thể gọi service.

Sau mutation:

- Dùng `router.refresh()`.
- Hoặc revalidate path/tag theo kiến trúc hiện tại.
- Không reload toàn bộ trình duyệt nếu không cần thiết.

================================================== 14. XỬ LÝ RESPONSE API
==================================================

API danh sách dự kiến:

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

Không giả định field chắc chắn tồn tại nếu API hiện tại khác tài liệu.
Hãy kiểm tra implementation backend thực tế trước khi code UI.

Tạo type rõ ràng cho dữ liệu UI.
Không dùng `any`.

================================================== 15. TESTING
==================================================

Viết test phù hợp với hệ thống test hiện tại.

Các trường hợp tối thiểu:

[ ] ADMIN thấy nút thêm phòng ban
[ ] MANAGER không thấy nút thêm phòng ban
[ ] MEMBER không thấy nút thêm phòng ban
[ ] Hiển thị danh sách đúng
[ ] Hiển thị empty state khi không có dữ liệu
[ ] Hiển thị no-result state khi tìm kiếm không có kết quả
[ ] Form tạo validate tên bắt buộc
[ ] Tạo phòng ban thành công
[ ] Tạo phòng ban trùng tên hiển thị lỗi
[ ] Mở form sửa có dữ liệu hiện tại
[ ] Cập nhật phòng ban thành công
[ ] Mở dialog xác nhận xóa
[ ] Xóa thành công
[ ] Xóa phòng ban đang được sử dụng hiển thị lỗi phù hợp
[ ] Nút submit bị disable trong lúc xử lý
[ ] Không gửi actorId hoặc createdById
[ ] Không hiển thị raw error
[ ] Pagination cập nhật URL đúng
[ ] Search cập nhật URL và đưa page về 1

Không thêm snapshot test lớn nếu không mang lại giá trị.

================================================== 16. DESIGN VÀ STYLE
==================================================

Tuân thủ design system hiện tại của dự án.

Nếu dự án đang dùng Tailwind CSS:

- Sử dụng class nhất quán.
- Không dùng inline style nếu không cần thiết.
- Không hard-code màu ngẫu nhiên.
- Dùng spacing, radius, typography nhất quán.
- Trạng thái hover, focus, disabled phải rõ.

Phong cách mong muốn:

- Chuyên nghiệp.
- Gọn.
- Dễ quét thông tin.
- Phù hợp hệ thống quản trị nội bộ.
- Không dùng quá nhiều màu sắc.
- Nhấn mạnh hành động chính bằng một CTA rõ ràng.
- Hành động xóa phải được phân biệt nhưng không gây rối mắt.

Nếu đã có component dùng chung như:

- Button
- Input
- Textarea
- Dialog
- Table
- Badge
- DropdownMenu
- Pagination
- Toast
- Skeleton

phải tái sử dụng, không tạo phiên bản trùng lặp.

================================================== 17. NHỮNG ĐIỀU KHÔNG ĐƯỢC LÀM
==================================================

- Không sửa Prisma schema.
- Không tạo migration.
- Không thay đổi authentication.
- Không cài Express.
- Không gọi Prisma trong Client Component.
- Không đặt business rule trong UI.
- Không tự tạo API mới ngoài phạm vi.
- Không thêm tính năng import/export.
- Không thêm upload file.
- Không thêm bulk delete.
- Không thêm soft delete nếu backend chưa hỗ trợ.
- Không refactor toàn bộ dashboard.
- Không dùng `any`.
- Không bỏ qua TypeScript error.
- Không chỉ làm giao diện giả mà không tích hợp API thật.
- Không hard-code dữ liệu phòng ban.

================================================== 18. TRÌNH TỰ THỰC HIỆN
==================================================

Trước khi code:

1. Đọc tài liệu dự án.
2. Kiểm tra cấu trúc UI hiện tại.
3. Kiểm tra design system và component dùng chung.
4. Kiểm tra API Departments thực tế.
5. Kiểm tra kiểu SessionUser và cách lấy role.
6. Kiểm tra error response hiện tại.
7. Đề xuất kế hoạch triển khai.
8. Liệt kê file sẽ tạo hoặc sửa.
9. Nêu rõ phần nào dùng Server Component và Client Component.
10. Nêu package cần cài nếu có. Mặc định không cài package mới.

Trong khi code:

1. Xây page và dữ liệu ban đầu.
2. Xây table.
3. Xây search và pagination.
4. Xây form dùng chung.
5. Xây dialog tạo.
6. Xây dialog sửa.
7. Xây dialog xóa.
8. Xử lý loading, empty và error state.
9. Kiểm tra quyền hiển thị.
10. Viết test.

================================================== 19. DEFINITION OF DONE
==================================================

Chỉ xem là hoàn thành khi:

[ ] Trang /admin/departments hoạt động
[ ] Dữ liệu lấy từ API hoặc service thật
[ ] Search hoạt động
[ ] Pagination hoạt động
[ ] ADMIN tạo được phòng ban
[ ] ADMIN sửa được phòng ban
[ ] ADMIN xóa được phòng ban hợp lệ
[ ] Phòng ban đang được sử dụng không bị xóa
[ ] MANAGER và MEMBER không thấy thao tác quản trị
[ ] Có loading state
[ ] Có empty state
[ ] Có error state
[ ] Có confirmation dialog khi xóa
[ ] Có toast hoặc feedback rõ ràng
[ ] Form có validation
[ ] Không gửi field nhạy cảm hoặc field hệ thống
[ ] Không có `any`
[ ] Không có Prisma trong Client Component
[ ] UI responsive
[ ] Accessibility cơ bản đạt yêu cầu
[ ] Test liên quan vượt qua
[ ] pnpm lint thành công
[ ] pnpm exec tsc --noEmit thành công
[ ] pnpm test thành công
[ ] pnpm build thành công

================================================== 20. BÁO CÁO SAU KHI HOÀN THÀNH
==================================================

Sau khi làm xong, báo cáo:

1. Các file đã tạo.
2. Các file đã sửa.
3. Cấu trúc Server Component và Client Component.
4. Cách lấy và refresh dữ liệu.
5. Cách xử lý quyền ADMIN.
6. Cách xử lý lỗi API.
7. Các test đã viết.
8. Các lệnh đã chạy.
9. Kết quả lint.
10. Kết quả type-check.
11. Kết quả test.
12. Kết quả build.
13. Những giả định đã sử dụng.
14. Những phần chưa xác minh hoặc rủi ro còn lại.
