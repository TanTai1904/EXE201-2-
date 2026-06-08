# SAVE+ Backend API

Đây là hệ thống Backend và Database hoàn chỉnh cho dự án SAVE+ hỗ trợ giáo dục tài chính, quản lý vốn giả lập và nâng cấp gói VIP.

## 🛠️ Công nghệ sử dụng
- **Runtime**: Node.js (Express framework)
- **Database ORM**: Sequelize
- **Database Engine**:
  - **SQLite** (Mặc định khi chạy Local - lưu trữ dạng file nhẹ nhàng, không cần cài đặt SQL server).
  - **PostgreSQL** (Tự động kích hoạt khi có biến môi trường `DATABASE_URL` khi triển khai production).
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs` mật khẩu mã hóa.

---

## 🚀 Hướng dẫn chạy cục bộ (Local Development)

### Bước 1: Khởi động Backend
1. Di chuyển vào thư mục `backend/` trong terminal của bạn.
2. Cài đặt các thư viện cần thiết (nếu chưa chạy):
   ```bash
   npm install
   ```
3. Khởi động server backend ở chế độ phát triển (sẽ chạy ở cổng `5000`):
   ```bash
   npm run dev
   ```
   *Server sẽ tự tạo file dữ liệu `database.sqlite` cục bộ và seed sẵn dữ liệu mẫu các Khóa học và Tài khoản Demo.*

### Bước 2: Khởi động Frontend
1. Mở một terminal mới tại thư mục gốc của dự án.
2. Khởi chạy frontend (Vite):
   ```bash
   npm run dev
   ```
3. Truy cập đường dẫn `http://localhost:5173`.

---

## 🔑 Tài khoản thử nghiệm (Demo Accounts)

Hệ thống đã tự động seed sẵn các tài khoản demo sau đây vào Database:

| Vai trò (Role) | Email | Mật khẩu (Password) | Gói hội viên (Subscription) |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin1@gmail.com` | `admin123` | Mentor+ (Tất cả đặc quyền) |
| **Staff (Nhân viên)** | `staff1@gmail.com` | `staff123` | Mentor+ (Tất cả đặc quyền) |
| **User (Premium)** | `premium@saveplus.vn` | `premium123` | Premium |
| **User (Mentor+)** | `mentor@saveplus.vn` | `mentor123` | Mentor+ |
| **User (Thường)** | `quan.tran@gmail.com` | `password123` | Premium (Mẫu dashboard cũ) |
| **User (Thường)** | `mai.le@yahoo.com` | `password123` | Free (Mẫu dashboard cũ) |

---

## ☁️ Hướng dẫn triển khai lên Cloud (Deployment Guide)

Hệ thống được thiết kế để có thể deploy trực tiếp lên các nền tảng đám mây phổ biến như **Render** hoặc **Railway**.

### Cách 1: Triển khai lên Render.com (Khuyên dùng)
1. Đẩy mã nguồn dự án của bạn lên một kho lưu trữ Git cá nhân (GitHub / GitLab).
2. Đăng nhập vào [Render.com](https://render.com) và tạo một **Web Service** mới.
3. Liên kết kho lưu trữ Git chứa dự án của bạn.
4. Thiết lập thông số cấu hình trên Render:
   - **Root Directory**: `backend` (Nếu bạn chỉ muốn deploy riêng thư mục backend, hoặc để trống nếu deploy cả repo).
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Tạo một cơ sở dữ liệu **Render PostgreSQL** miễn phí trên Render.
6. Cấu hình biến môi trường (**Environment Variables**) trong tab Environment của Web Service:
   - `PORT`: `5000` (hoặc Render sẽ tự cấp cổng ngẫu nhiên)
   - `JWT_SECRET`: `nhập_mã_bí_mật_tự_chọn_của_bạn`
   - `DATABASE_URL`: `dán_đường_dẫn_kết_nối_PostgreSQL_vừa_tạo` (Render tự liên kết nếu tạo chung)
   - `NODE_ENV`: `production`
7. Click **Deploy Web Service**. Render sẽ tự động build, tạo cơ sở dữ liệu, chạy các bảng và seed dữ liệu ban đầu lên PostgreSQL.

---

## 📋 Danh sách APIs chính (API Documentation)

### 1. Xác thực (Authentication)
- `POST /api/auth/register` : Đăng ký người dùng mới (Nhận name, email, password, idNumber).
- `POST /api/auth/login` : Đăng nhập nhận JWT Token.
- `GET /api/auth/me` : Lấy thông tin hồ sơ và đồng bộ toàn bộ tài sản, mục tiêu, thông báo của người dùng hiện tại (yêu cầu header `Authorization: Bearer <token>`).

### 2. Quản lý tài chính & Mục tiêu (Financials & Goals)
- `PUT /api/financials/balance` : Cập nhật số dư tài khoản ảo.
- `POST /api/financials/watchlist` : Thêm/Xóa mã cổ phiếu theo dõi.
- `PUT /api/financials/portfolio` : Lưu trữ danh mục cổ phiếu giả lập hiện tại.
- `GET /api/goals` : Lấy danh sách mục tiêu tài chính cá nhân.
- `POST /api/goals` : Tạo mục tiêu mới.
- `POST /api/goals/:id/contribute` : Đóng góp tiền tiết kiệm vào mục tiêu (tự động trừ số dư tài khoản).

### 3. Tiến trình học tập (Courses & Progress)
- `GET /api/courses` : Lấy danh sách toàn bộ khóa học (gồm bài học và câu hỏi).
- `GET /api/courses/progress` : Xem tiến độ học tập (các bài đã đọc, quiz hoàn thành).
- `POST /api/courses/:id/lessons/:lessonId` : Đánh dấu đã đọc bài học cụ thể.
- `POST /api/courses/:id/quiz` : Ghi nhận hoàn thành trắc nghiệm cuối khóa học.

### 4. Duyệt nâng cấp gói VIP (Subscription Payments)
- `POST /api/payments/requests` : Người dùng gửi yêu cầu nâng cấp gói lên Premium/Mentor+ kèm mã chuyển khoản.
- `GET /api/payments/requests` : Lấy danh sách yêu cầu (User chỉ thấy của mình, Admin/Staff thấy toàn bộ).
- `PUT /api/payments/requests/:id/approve` : Admin/Staff phê duyệt yêu cầu (Tự động nâng cấp VIP cho user và gửi thông báo chúc mừng).
- `PUT /api/payments/requests/:id/reject` : Admin/Staff từ chối yêu cầu kèm lý do.

### 5. Quản trị viên (Admin & Staff)
- `GET /api/admin/users` : Danh sách toàn bộ người dùng và tiến độ học tập trung bình để hiển thị bảng điều khiển.
- `PUT /api/admin/users/:id/block` : Khóa/Mở khóa tài khoản người dùng.
- `PUT /api/admin/users/:id/kyc` : Duyệt hoặc từ chối trạng thái xác minh danh tính KYC của user.
- `DELETE /api/admin/users/:id` : Xóa tài khoản người dùng khỏi hệ thống.
