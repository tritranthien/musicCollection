# Implementation Plan: Forgot Password & Update Profile

## ✅ Đã hoàn thành:

### 1. Backend Services
- ✅ `app/service/password.server.js` - Password reset service
  - `requestPasswordReset()` - Gửi email reset password
  - `verifyResetToken()` - Verify reset token
  - `resetPassword()` - Reset password với token
  - `changePassword()` - Đổi password khi đã đăng nhập
  - Email template cho reset password

### 2. Database Schema
- ✅ Updated `prisma/schema.prisma`
  - Added `resetPasswordToken` field
  - Added `resetPasswordExpiry` field

## 🔄 Cần làm tiếp:

### 3. Routes - Forgot Password
- [ ] `app/routes/forgot-password.jsx` - Form yêu cầu reset
- [ ] `app/routes/reset-password.jsx` - Form đặt mật khẩu mới
- [ ] `app/routes/actions/forgot-password.jsx` - Action xử lý request
- [ ] `app/routes/actions/reset-password.jsx` - Action xử lý reset

### 4. Routes - Update Profile
- [ ] `app/routes/profile.jsx` - Trang profile
- [ ] `app/routes/actions/updateProfile.jsx` - Action cập nhật thông tin
- [ ] `app/routes/actions/changePassword.jsx` - Action đổi mật khẩu

### 5. UI Components
- [ ] Form quên mật khẩu
- [ ] Form đặt mật khẩu mới
- [ ] Form cập nhật profile
- [ ] Form đổi mật khẩu

### 6. Navigation
- [ ] Thêm link "Quên mật khẩu?" vào trang đăng nhập
- [ ] Thêm link "Hồ sơ" vào menu người dùng
- [ ] Update routes.ts

### 7. Testing & Documentation
- [ ] Test forgot password flow
- [ ] Test update profile
- [ ] Update USER_GUIDE.md
- [ ] Generate Prisma client

## 📝 Notes:

- Reset token hết hạn sau 1 giờ
- Email được gửi qua SMTP (hoặc log ra console nếu chưa config)
- Cần chạy `npx prisma generate` sau khi update schema
- Cần chạy `npx prisma db push` để update database

## 🎯 Next Steps:

1. Generate Prisma client
2. Tạo routes cho forgot password
3. Tạo routes cho update profile
4. Update navigation
5. Test toàn bộ flow
