# Hệ thống phân quyền người dùng

## Tổng quan

Hệ thống hỗ trợ 4 loại người dùng với quyền hạn khác nhau:

### 1. **ADMIN** (Quản trị viên)
- Quyền cao nhất trong hệ thống
- Được tạo tự động khi deploy dự án lần đầu
- Có thể:
  - Phê duyệt/từ chối tài khoản TEACHER
  - Nâng cấp TEACHER → MANAGER
  - Hạ cấp MANAGER → TEACHER
  - Quản lý toàn bộ hệ thống

### 2. **MANAGER** (Quản lý)
- Được ADMIN nâng cấp từ TEACHER
- Có thể:
  - Phê duyệt/từ chối tài khoản TEACHER
  - Quản lý nội dung và người dùng
  - Không thể nâng/hạ cấp role (chỉ ADMIN mới được)

### 3. **TEACHER** (Giáo viên)
- Đăng ký tài khoản và chờ ADMIN/MANAGER phê duyệt
- Sau khi được phê duyệt mới có thể đăng nhập
- Có thể:
  - Tạo và quản lý bài giảng
  - Upload tài liệu
  - Quản lý nội dung của mình

### 4. **STUDENT** (Học sinh)
- Đăng ký tài khoản và xác thực email
- Sau khi xác thực email có thể đăng nhập ngay
- Có thể:
  - Xem bài giảng
  - Tải tài liệu
  - Truy cập nội dung học tập

## Quy trình đăng ký và kích hoạt

### Học sinh (STUDENT)
1. Đăng ký tài khoản tại `/register`
2. Nhận email xác thực (hiện tại trả về token trong response để test)
3. Click link xác thực hoặc truy cập `/verify-email?token=<TOKEN>`
4. Sau khi xác thực email → Trạng thái chuyển sang `ACTIVE`
5. Có thể đăng nhập ngay

### Giáo viên (TEACHER)
1. Đăng ký tài khoản tại `/register` và chọn role TEACHER
2. Tài khoản ở trạng thái `PENDING` (chờ phê duyệt)
3. ADMIN/MANAGER vào `/admin/users` để phê duyệt
4. Sau khi được phê duyệt → Trạng thái chuyển sang `APPROVED`
5. Có thể đăng nhập

## Trạng thái tài khoản (UserStatus)

- **PENDING**: Chờ xử lý
  - STUDENT: Chờ xác thực email
  - TEACHER: Chờ admin phê duyệt
  
- **ACTIVE**: Đang hoạt động
  - STUDENT: Đã xác thực email
  - ADMIN, MANAGER: Mặc định
  
- **APPROVED**: Đã được phê duyệt
  - TEACHER: Đã được admin phê duyệt
  
- **REJECTED**: Bị từ chối
  - TEACHER: Bị admin từ chối

## Cài đặt và triển khai

### 1. Cập nhật database schema

```bash
npx prisma generate
npx prisma db push
```

### 2. Tạo tài khoản ADMIN lần đầu

```bash
# Sử dụng mật khẩu mặc định
node prisma/seed.js

# Hoặc tùy chỉnh mật khẩu qua biến môi trường
ADMIN_PASSWORD=YourSecurePassword123 node prisma/seed.js
```

Tài khoản ADMIN mặc định:
- Email: `admin@musiccollection.com`
- Password: `Admin@123456` (hoặc giá trị từ `ADMIN_PASSWORD`)

⚠️ **Quan trọng**: Đổi mật khẩu ngay sau khi đăng nhập lần đầu!

### 3. Thêm vào package.json

```json
{
  "scripts": {
    "seed": "node prisma/seed.js"
  }
}
```

## API Routes

### Authentication
- `POST /register` - Đăng ký tài khoản mới
- `POST /login` - Đăng nhập
- `GET /verify-email?token=<TOKEN>` - Xác thực email
- `POST /logout` - Đăng xuất

### Admin Management
- `GET /admin/users` - Danh sách người dùng (ADMIN/MANAGER)
- `POST /admin/users` - Quản lý người dùng
  - `actionType=approve` - Phê duyệt TEACHER
  - `actionType=reject` - Từ chối TEACHER
  - `actionType=promote` - Nâng TEACHER → MANAGER (chỉ ADMIN)
  - `actionType=demote` - Hạ MANAGER → TEACHER (chỉ ADMIN)

## Kiểm tra quyền trong code

### Yêu cầu đăng nhập
```javascript
import { requireAuth } from "../service/auth.server.js";

export async function loader({ request }) {
  const user = await requireAuth(request);
  // user đã đăng nhập
}
```

### Yêu cầu role cụ thể
```javascript
import { requireRole } from "../service/auth.server.js";

export async function loader({ request }) {
  // Chỉ ADMIN và MANAGER
  const user = await requireRole(request, ["ADMIN", "MANAGER"]);
  
  // Chỉ ADMIN
  const admin = await requireRole(request, ["ADMIN"]);
}
```

## Testing

### Test đăng ký STUDENT
```bash
curl -X POST http://localhost:5173/register \
  -d "email=student@test.com" \
  -d "password=123456" \
  -d "name=Test Student" \
  -d "role=STUDENT"
```

### Test đăng ký TEACHER
```bash
curl -X POST http://localhost:5173/register \
  -d "email=teacher@test.com" \
  -d "password=123456" \
  -d "name=Test Teacher" \
  -d "role=TEACHER"
```

### Test verify email
```bash
curl http://localhost:5173/verify-email?token=<TOKEN_FROM_REGISTER>
```

### Test login
```bash
curl -X POST http://localhost:5173/dang-nhap \
  -d "email=student@test.com" \
  -d "password=123456"
```

## Lưu ý bảo mật

1. **Mật khẩu**: Luôn hash bằng bcrypt trước khi lưu
2. **JWT Secret**: Đổi `JWT_SECRET` trong production
3. **Email verification**: Tích hợp service gửi email thực tế (hiện tại chỉ trả về token)
4. **HTTPS**: Bắt buộc trong production
5. **Rate limiting**: Thêm rate limit cho các endpoint nhạy cảm

## Roadmap

- [ ] Tích hợp gửi email xác thực (Nodemailer, SendGrid, etc.)
- [ ] Thêm forgot password
- [ ] Thêm 2FA
- [ ] Audit log cho các hành động admin
- [ ] Thêm bulk actions trong admin dashboard
- [ ] Export danh sách users
