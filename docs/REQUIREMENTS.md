# Yêu cầu chức năng – LYDINC TaskHub

## 1. Quy ước

Tài liệu này mô tả các yêu cầu chức năng và điều kiện nghiệm thu của hệ thống.

Các vai trò:

- ADMIN
- MANAGER
- MEMBER

Các trạng thái tài khoản:

- ACTIVE
- INACTIVE
- LOCKED

---

## 2. Authentication

### AUTH-01: Đăng nhập

Người dùng có thể đăng nhập bằng email và mật khẩu.

Điều kiện nghiệm thu:

- Email là bắt buộc.
- Mật khẩu là bắt buộc.
- Email phải được chuẩn hóa trước khi tìm kiếm.
- Mật khẩu phải được kiểm tra bằng password hash.
- Tài khoản phải tồn tại.
- Tài khoản phải có trạng thái ACTIVE.
- Đăng nhập đúng sẽ tạo session.
- Đăng nhập sai không được tiết lộ email hay mật khẩu sai.
- Thông báo lỗi phải có nội dung an toàn.

### AUTH-02: Đăng xuất

Điều kiện nghiệm thu:

- Người dùng đã đăng nhập có thể đăng xuất.
- Session bị xóa hoặc vô hiệu hóa.
- Người dùng được chuyển về trang đăng nhập.

### AUTH-03: Bảo vệ route

Điều kiện nghiệm thu:

- Người chưa đăng nhập không được truy cập dashboard.
- Người chưa đăng nhập được chuyển về `/login`.
- API yêu cầu xác thực phải trả về HTTP 401 khi không có session.

### AUTH-04: Kiểm tra trạng thái tài khoản

Điều kiện nghiệm thu:

- Tài khoản LOCKED không được đăng nhập.
- Tài khoản INACTIVE không được đăng nhập.
- Session của người dùng không còn ACTIVE phải bị từ chối.

---

## 3. Users

### USER-01: Xem danh sách người dùng

Chỉ ADMIN được truy cập.

Điều kiện nghiệm thu:

- Có phân trang.
- Có tìm kiếm theo tên và email.
- Có lọc theo phòng ban.
- Có lọc theo vai trò.
- Có lọc theo trạng thái.
- Không trả về passwordHash.

### USER-02: Tạo người dùng

Chỉ ADMIN được thực hiện.

Dữ liệu bắt buộc:

- name
- email
- password
- role
- departmentId

Điều kiện nghiệm thu:

- Email phải hợp lệ.
- Email không được trùng.
- Mật khẩu phải đạt độ dài tối thiểu.
- Phòng ban phải tồn tại.
- Role phải thuộc enum UserRole.
- Mật khẩu phải được hash trước khi lưu.
- Không trả passwordHash trong response.
- Ghi Activity Log sau khi tạo thành công.

### USER-03: Cập nhật người dùng

Chỉ ADMIN được thực hiện.

Điều kiện nghiệm thu:

- Không cho sửa trực tiếp passwordHash.
- Email mới không được trùng.
- Phòng ban mới phải tồn tại.
- Vai trò phải hợp lệ.
- Ghi Activity Log cho thay đổi quan trọng.

### USER-04: Khóa tài khoản

Chỉ ADMIN được thực hiện.

Điều kiện nghiệm thu:

- Có thể chuyển trạng thái sang LOCKED.
- Người dùng bị khóa không thể đăng nhập.
- Không cho ADMIN tự khóa tài khoản của chính mình nếu đó là ADMIN cuối cùng.

---

## 4. Departments

### DEPARTMENT-01: Xem danh sách phòng ban

Người dùng đã đăng nhập có thể xem.

Điều kiện nghiệm thu:

- Hiển thị tên và mô tả.
- Có thể kèm số lượng thành viên.
- Có thể kèm số lượng dự án.

### DEPARTMENT-02: Tạo phòng ban

Chỉ ADMIN được thực hiện.

Điều kiện nghiệm thu:

- Tên phòng ban là bắt buộc.
- Tên không được trùng.
- Tên phải được loại bỏ khoảng trắng thừa.
- Ghi Activity Log sau khi tạo.

### DEPARTMENT-03: Cập nhật phòng ban

Chỉ ADMIN được thực hiện.

Điều kiện nghiệm thu:

- Phòng ban phải tồn tại.
- Tên mới không được trùng.
- Ghi Activity Log cho nội dung thay đổi.

### DEPARTMENT-04: Xóa phòng ban

Chỉ ADMIN được thực hiện.

Điều kiện nghiệm thu:

- Không được xóa nếu còn người dùng thuộc phòng ban.
- Không được xóa nếu còn dự án thuộc phòng ban.
- Trả về HTTP 409 khi có dữ liệu phụ thuộc.

---

## 5. Projects

### PROJECT-01: Xem danh sách dự án

Điều kiện nghiệm thu:

- ADMIN xem được toàn bộ dự án.
- MANAGER xem được dự án mình quản lý hoặc tham gia.
- MEMBER xem được dự án mình tham gia.
- Có lọc theo trạng thái.
- Có lọc theo phòng ban.
- Có tìm kiếm theo mã hoặc tên dự án.
- Có phân trang.

### PROJECT-02: Tạo dự án

ADMIN và MANAGER được thực hiện.

Dữ liệu bắt buộc:

- code
- name
- status
- startDate
- endDate
- departmentId
- managerId

Điều kiện nghiệm thu:

- Mã dự án không được trùng.
- Ngày kết thúc không nhỏ hơn ngày bắt đầu.
- Phòng ban phải tồn tại.
- Người quản lý phải tồn tại.
- Người quản lý phải có role ADMIN hoặc MANAGER.
- Người tạo dự án được lưu tại createdById.
- Ghi Activity Log sau khi tạo.

### PROJECT-03: Cập nhật dự án

Điều kiện nghiệm thu:

- ADMIN được sửa toàn bộ dự án.
- MANAGER chỉ được sửa dự án mình quản lý.
- MEMBER không được sửa dự án.
- Không cho endDate nhỏ hơn startDate.
- Ghi Activity Log cho các thay đổi quan trọng.

### PROJECT-04: Thêm thành viên

ADMIN hoặc MANAGER của dự án được thực hiện.

Điều kiện nghiệm thu:

- Dự án phải tồn tại.
- Người dùng phải tồn tại.
- Không thêm trùng thành viên.
- Người quản lý dự án phải là thành viên của dự án hoặc được xem là thành viên mặc định.
- Ghi Activity Log sau khi thêm.

### PROJECT-05: Xóa thành viên

Điều kiện nghiệm thu:

- ADMIN hoặc MANAGER của dự án được thực hiện.
- Không được xóa người quản lý dự án trước khi thay manager.
- Không được xóa thành viên nếu còn nhiệm vụ đang giao cho người đó trong dự án, trừ khi đã chuyển nhiệm vụ.
- Ghi Activity Log sau khi xóa.

### PROJECT-06: Xóa dự án

Trong MVP không xóa vật lý dự án đã có dữ liệu.

Điều kiện nghiệm thu:

- Ưu tiên chuyển trạng thái sang CANCELLED.
- Chỉ ADMIN được thực hiện thao tác xóa vật lý nếu hệ thống hỗ trợ.
- Phải có xác nhận.
- Không được xóa nhầm dữ liệu liên quan.

---

## 6. Tasks

### TASK-01: Xem danh sách nhiệm vụ

Điều kiện nghiệm thu:

- ADMIN xem được toàn bộ nhiệm vụ.
- MANAGER xem nhiệm vụ của dự án mình quản lý hoặc tham gia.
- MEMBER xem nhiệm vụ thuộc dự án mình tham gia.
- Có lọc theo dự án.
- Có lọc theo người phụ trách.
- Có lọc theo trạng thái.
- Có lọc theo mức độ ưu tiên.
- Có lọc nhiệm vụ quá hạn.
- Có phân trang.

### TASK-02: Tạo nhiệm vụ

ADMIN và MANAGER được thực hiện.

Dữ liệu bắt buộc:

- title
- projectId
- assigneeId
- dueDate
- priority

Điều kiện nghiệm thu:

- Tiêu đề không được để trống.
- Dự án phải tồn tại.
- Người phụ trách phải tồn tại.
- Người phụ trách phải là thành viên dự án.
- dueDate không được nhỏ hơn startDate nếu có startDate.
- dueDate không được lớn hơn endDate dự án, trừ trường hợp có quyền đặc biệt.
- progress mặc định là 0.
- status mặc định là TODO.
- createdById lấy từ session.
- Ghi Activity Log sau khi tạo.

### TASK-03: Cập nhật nhiệm vụ

Điều kiện nghiệm thu:

- ADMIN được cập nhật toàn bộ nhiệm vụ.
- MANAGER của dự án được cập nhật toàn bộ nhiệm vụ trong dự án.
- MEMBER chỉ được cập nhật trường được phép của nhiệm vụ mình phụ trách.
- MEMBER không được thay đổi assigneeId.
- MEMBER không được thay đổi projectId.
- MEMBER không được tự xác nhận COMPLETED.
- progress phải nằm trong khoảng 0 đến 100.
- Ghi Activity Log khi thay đổi dữ liệu quan trọng.

### TASK-04: Chuyển trạng thái

Luồng trạng thái chuẩn:

- TODO → IN_PROGRESS
- IN_PROGRESS → REVIEW
- REVIEW → COMPLETED
- REVIEW → IN_PROGRESS
- TODO → CANCELLED
- IN_PROGRESS → CANCELLED

Điều kiện nghiệm thu:

- MEMBER chỉ cập nhật nhiệm vụ mình phụ trách.
- MEMBER có thể chuyển TODO sang IN_PROGRESS.
- MEMBER có thể chuyển IN_PROGRESS sang REVIEW.
- MEMBER không được chuyển trực tiếp TODO sang COMPLETED.
- Chỉ ADMIN hoặc MANAGER được chuyển REVIEW sang COMPLETED.
- Khi chuyển COMPLETED, progress phải bằng 100.
- Khi chuyển COMPLETED, completedAt được thiết lập.
- Khi rời khỏi COMPLETED, completedAt phải được xóa nếu thao tác được cho phép.
- Ghi Activity Log cho mỗi lần đổi trạng thái.

### TASK-05: Cập nhật tiến độ

Điều kiện nghiệm thu:

- Progress là số nguyên.
- Progress nằm trong khoảng 0 đến 100.
- Task COMPLETED phải có progress bằng 100.
- Progress bằng 100 không tự động chuyển COMPLETED.
- Chỉ người có quyền mới được cập nhật.

### TASK-06: Xác định nhiệm vụ quá hạn

Nhiệm vụ được xem là quá hạn khi:

- dueDate nhỏ hơn thời điểm hiện tại.
- status không phải COMPLETED.
- status không phải CANCELLED.

Không lưu `isOverdue` cố định trong database.

### TASK-07: Xóa nhiệm vụ

Trong MVP ưu tiên hủy nhiệm vụ thay vì xóa vật lý.

Điều kiện nghiệm thu:

- MEMBER không được xóa.
- MANAGER chỉ xóa nhiệm vụ trong dự án mình quản lý.
- Nếu nhiệm vụ có lịch sử hoặc bình luận, ưu tiên chuyển CANCELLED.
- Thao tác phải được ghi log.

---

## 7. Comments

### COMMENT-01: Xem bình luận

Điều kiện nghiệm thu:

- Chỉ thành viên có quyền xem nhiệm vụ mới xem được bình luận.
- Bình luận được sắp xếp theo thời gian.
- Hiển thị tác giả và ngày tạo.

### COMMENT-02: Tạo bình luận

Điều kiện nghiệm thu:

- Người dùng phải đăng nhập.
- Người dùng phải có quyền xem nhiệm vụ.
- Nội dung không được để trống.
- Nội dung được loại bỏ khoảng trắng thừa.
- Lưu authorId từ session.

### COMMENT-03: Chỉnh sửa bình luận

Điều kiện nghiệm thu:

- Người dùng chỉ sửa bình luận của chính mình.
- ADMIN có thể được cấp quyền quản trị nội dung.
- updatedAt phải được cập nhật.
- Có thể ghi Activity Log nếu cần.

### COMMENT-04: Xóa bình luận

Điều kiện nghiệm thu:

- Người dùng chỉ xóa bình luận của chính mình.
- ADMIN có thể xóa nội dung vi phạm.
- Trong tương lai có thể chuyển sang soft delete.

---

## 8. Activity Logs

### ACTIVITY-01: Tạo log

Log được tạo tự động khi:

- Tạo người dùng.
- Cập nhật trạng thái tài khoản.
- Tạo hoặc sửa phòng ban.
- Tạo hoặc sửa dự án.
- Thêm hoặc xóa thành viên.
- Tạo hoặc sửa nhiệm vụ.
- Đổi trạng thái nhiệm vụ.
- Đổi deadline.
- Đổi người phụ trách.

### ACTIVITY-02: Bảo vệ log

Điều kiện nghiệm thu:

- Người dùng thông thường không được tạo log tùy ý.
- Người dùng không được sửa log.
- Người dùng không được xóa log.
- Log phải có action, entityType, entityId và createdAt.
- actorId có thể null nếu hành động do hệ thống thực hiện.

---

## 9. Yêu cầu phi chức năng

### 9.1. Security

- Không lưu mật khẩu dạng văn bản.
- Không trả passwordHash qua API.
- Mọi input phải được validate.
- Kiểm tra authentication tại server.
- Kiểm tra authorization tại service hoặc policy layer.
- Không tin tưởng role gửi từ frontend.
- Không hardcode secret trong source code.
- Không ghi mật khẩu hoặc token vào log.

### 9.2. Performance

- Danh sách lớn phải có phân trang.
- Các trường lọc thường xuyên cần có database index.
- Không tạo Prisma Client mới cho mỗi request.
- Tránh truy vấn N+1.
- Chỉ select các trường cần thiết.

### 9.3. Reliability

- Thao tác nhiều bước quan trọng phải sử dụng transaction.
- Seed phải có thể chạy lại mà không tạo dữ liệu trùng.
- Migration đã chạy không được tự ý sửa.
- Có quy trình backup trước khi migrate production.

### 9.4. User experience

Mọi trang dữ liệu cần có:

- Loading state.
- Empty state.
- Error state.
- Success feedback.
- Validation message rõ ràng.
- Xác nhận trước thao tác nguy hiểm.
