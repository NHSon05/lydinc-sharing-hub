# LYDINC TaskHub

## 1. Tổng quan sản phẩm

LYDINC TaskHub là hệ thống quản lý dự án và nhiệm vụ nội bộ dành cho LYDINC.

Hệ thống giúp các phòng ban:

- Quản lý danh sách dự án.
- Giao nhiệm vụ cho nhân sự.
- Theo dõi trạng thái và tiến độ công việc.
- Kiểm soát deadline.
- Trao đổi thông qua bình luận.
- Ghi nhận lịch sử thay đổi.
- Tổng hợp tình hình thực hiện công việc.

Phiên bản đầu tiên được xây dựng dưới dạng ứng dụng web nội bộ.

---

## 2. Vấn đề cần giải quyết

Hiện nay, công việc có thể được quản lý qua tin nhắn, email hoặc bảng tính riêng lẻ. Cách quản lý này có một số hạn chế:

- Khó xác định người đang phụ trách công việc.
- Khó theo dõi deadline.
- Dữ liệu phân tán ở nhiều nguồn.
- Không có lịch sử thay đổi rõ ràng.
- Khó tổng hợp tiến độ theo dự án.
- Người quản lý mất nhiều thời gian kiểm tra công việc.
- Nhân sự có thể bỏ sót nhiệm vụ được giao.

LYDINC TaskHub tập trung toàn bộ thông tin dự án và nhiệm vụ vào một hệ thống duy nhất.

---

## 3. Mục tiêu sản phẩm

### 3.1. Mục tiêu chính

- Chuẩn hóa quy trình giao và nhận nhiệm vụ.
- Minh bạch người phụ trách và thời hạn hoàn thành.
- Giúp nhân sự theo dõi công việc cá nhân.
- Giúp quản lý theo dõi tiến độ của phòng ban và dự án.
- Giảm phụ thuộc vào bảng tính và tin nhắn rời rạc.
- Tạo nền tảng để mở rộng sang hệ thống quản trị nội bộ lớn hơn.

### 3.2. Mục tiêu kỹ thuật

- Xây dựng ứng dụng bằng Next.js và TypeScript.
- Áp dụng kiến trúc modular monolith.
- Sử dụng PostgreSQL làm cơ sở dữ liệu.
- Sử dụng Prisma ORM để truy cập dữ liệu.
- Tách business logic khỏi giao diện và API route.
- Kiểm soát authentication và authorization.
- Có khả năng kiểm thử và mở rộng trong tương lai.

---

## 4. Đối tượng sử dụng

Hệ thống có ba nhóm người dùng chính.

### 4.1. ADMIN

ADMIN là quản trị viên hệ thống.

Quyền chính:

- Quản lý người dùng.
- Quản lý phòng ban.
- Gán vai trò cho tài khoản.
- Khóa hoặc mở khóa tài khoản.
- Xem toàn bộ dự án.
- Xem toàn bộ nhiệm vụ.
- Tạo, chỉnh sửa và quản lý dự án.
- Xem các báo cáo toàn hệ thống.

### 4.2. MANAGER

MANAGER là trưởng phòng hoặc người quản lý dự án.

Quyền chính:

- Tạo dự án.
- Quản lý dự án được phân công.
- Thêm thành viên vào dự án.
- Tạo và giao nhiệm vụ.
- Thay đổi người phụ trách nhiệm vụ.
- Cập nhật deadline.
- Kiểm tra kết quả công việc.
- Chuyển nhiệm vụ sang trạng thái hoàn thành.
- Xem tiến độ của dự án và phòng ban.

### 4.3. MEMBER

MEMBER là nhân sự thực hiện công việc.

Quyền chính:

- Xem các dự án mà mình tham gia.
- Xem nhiệm vụ được giao.
- Cập nhật trạng thái nhiệm vụ.
- Cập nhật phần trăm tiến độ.
- Gửi kết quả công việc.
- Viết bình luận.
- Xem lịch sử của nhiệm vụ.

---

## 5. Phạm vi MVP

Phiên bản MVP gồm các module:

1. Authentication
2. Users
3. Departments
4. Projects
5. Project Members
6. Tasks
7. Comments
8. Activity Logs
9. Dashboard cơ bản

---

## 6. Chức năng MVP

### 6.1. Authentication

- Đăng nhập bằng email và mật khẩu.
- Đăng xuất.
- Quản lý phiên đăng nhập.
- Chặn truy cập dashboard khi chưa đăng nhập.
- Chặn tài khoản bị khóa hoặc ngừng hoạt động.

### 6.2. Người dùng

- Xem danh sách người dùng.
- Tìm kiếm người dùng.
- Tạo tài khoản.
- Gán phòng ban.
- Gán vai trò.
- Khóa hoặc mở tài khoản.

### 6.3. Phòng ban

- Xem danh sách phòng ban.
- Tạo phòng ban.
- Chỉnh sửa thông tin phòng ban.
- Không cho xóa phòng ban đang có người dùng hoặc dự án.

### 6.4. Dự án

- Xem danh sách dự án.
- Tạo dự án.
- Chỉnh sửa dự án.
- Xem chi tiết dự án.
- Gán người quản lý.
- Gán phòng ban phụ trách.
- Thêm hoặc xóa thành viên.
- Thay đổi trạng thái dự án.

### 6.5. Nhiệm vụ

- Xem danh sách nhiệm vụ.
- Tạo nhiệm vụ.
- Giao nhiệm vụ cho thành viên.
- Cập nhật trạng thái.
- Cập nhật phần trăm tiến độ.
- Cập nhật kết quả công việc.
- Lọc theo dự án, trạng thái, mức độ ưu tiên và người phụ trách.
- Xác định nhiệm vụ quá hạn.

### 6.6. Bình luận

- Viết bình luận trong nhiệm vụ.
- Chỉnh sửa bình luận của chính mình.
- Xóa bình luận của chính mình theo chính sách hệ thống.
- Hiển thị lịch sử bình luận theo thời gian.

### 6.7. Lịch sử hoạt động

- Ghi lại người tạo nhiệm vụ.
- Ghi lại thay đổi trạng thái.
- Ghi lại thay đổi deadline.
- Ghi lại thay đổi người phụ trách.
- Ghi lại thay đổi tiến độ.
- Không cho người dùng sửa Activity Log.

### 6.8. Dashboard

- Tổng số dự án đang hoạt động.
- Tổng số nhiệm vụ.
- Số nhiệm vụ đang thực hiện.
- Số nhiệm vụ chờ duyệt.
- Số nhiệm vụ hoàn thành.
- Số nhiệm vụ quá hạn.
- Danh sách nhiệm vụ sắp đến hạn.

---

## 7. Ngoài phạm vi MVP

Các chức năng sau chưa được triển khai trong phiên bản đầu:

- Đăng nhập bằng Google.
- Đăng ký tài khoản công khai.
- Quên mật khẩu.
- Xác thực hai bước.
- Thông báo email.
- Thông báo thời gian thực.
- WebSocket.
- Chat nội bộ.
- Kanban kéo thả.
- Upload file trực tiếp.
- Đồng bộ Google Drive.
- Đồng bộ Google Calendar.
- Chấm công.
- Tính lương.
- Đánh giá hiệu suất nhân sự.
- Ứng dụng mobile.
- AI phân tích tiến độ.
- Xuất báo cáo Excel.
- Microservices.

---

## 8. Quy trình nghiệp vụ chính

### 8.1. Tạo dự án

1. ADMIN hoặc MANAGER đăng nhập.
2. Người dùng mở chức năng tạo dự án.
3. Nhập thông tin dự án.
4. Chọn phòng ban phụ trách.
5. Chọn người quản lý dự án.
6. Hệ thống kiểm tra dữ liệu.
7. Hệ thống tạo dự án.
8. Hệ thống ghi Activity Log.

### 8.2. Giao nhiệm vụ

1. ADMIN hoặc MANAGER mở dự án.
2. Chọn chức năng tạo nhiệm vụ.
3. Nhập tiêu đề, mô tả và deadline.
4. Chọn người phụ trách.
5. Chọn mức độ ưu tiên.
6. Hệ thống kiểm tra quyền và dữ liệu.
7. Hệ thống tạo nhiệm vụ với trạng thái TODO.
8. Hệ thống ghi Activity Log.

### 8.3. Thực hiện nhiệm vụ

1. MEMBER xem nhiệm vụ được giao.
2. MEMBER chuyển trạng thái từ TODO sang IN_PROGRESS.
3. MEMBER cập nhật tiến độ.
4. MEMBER gửi kết quả công việc.
5. MEMBER chuyển nhiệm vụ sang REVIEW.
6. MANAGER kiểm tra kết quả.
7. MANAGER chuyển nhiệm vụ sang COMPLETED hoặc trả lại IN_PROGRESS.

---

## 9. Tiêu chí thành công của MVP

MVP được xem là đạt yêu cầu khi:

- Người dùng đăng nhập được.
- Người chưa đăng nhập không vào được dashboard.
- ADMIN quản lý được người dùng và phòng ban.
- MANAGER tạo được dự án và nhiệm vụ.
- MEMBER xem và cập nhật được nhiệm vụ được giao.
- Phân quyền hoạt động đúng.
- Dữ liệu được lưu trong PostgreSQL.
- Activity Log được tạo khi có thay đổi quan trọng.
- Hệ thống xác định được nhiệm vụ quá hạn.
- Build và test thành công.
