# 📧 Email System - Quick Start Guide

Hệ thống email đã được tích hợp hoàn chỉnh với SMTP. Hướng dẫn nhanh để bắt đầu:

## 🚀 Setup nhanh (5 phút)

### Bước 1: Cấu hình SMTP trong .env

Chọn một trong các options sau:

#### Option A: Gmail (Dễ nhất - Dùng cho development)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App Password (xem hướng dẫn bên dưới)
SMTP_FROM_NAME=Music Collection
SMTP_FROM_EMAIL=your-email@gmail.com
APP_URL=http://localhost:5173
```

**Lấy Gmail App Password:**
1. Vào https://myaccount.google.com/security
2. Bật "2-Step Verification"
3. Vào https://myaccount.google.com/apppasswords
4. Tạo app password cho "Mail"
5. Copy password 16 ký tự vào SMTP_PASS

#### Option B: Mailtrap (Tốt nhất cho testing)

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
SMTP_FROM_NAME=Music Collection
SMTP_FROM_EMAIL=test@example.com
APP_URL=http://localhost:5173
```

**Setup Mailtrap:**
1. Đăng ký tại https://mailtrap.io (free)
2. Tạo inbox mới
3. Copy SMTP credentials
4. Email sẽ KHÔNG gửi thật, chỉ xuất hiện trong Mailtrap để xem preview

### Bước 2: Test SMTP

```bash
# Test với email của bạn
npm run test-email your-email@example.com "Your Name"

# Hoặc dùng email mặc định
npm run test-email
```

Nếu thành công, bạn sẽ thấy:
```
✅ Verification email sent
✅ Teacher pending email sent
✅ Teacher approved email sent
✅ Teacher rejected email sent
```

### Bước 3: Test flow đăng ký

```bash
# Đảm bảo server đang chạy
npm run dev
```

Sau đó:
1. Vào http://localhost:5173/dang-ky
2. Đăng ký với email thật của bạn
3. Kiểm tra inbox để nhận email xác thực

## 📧 Các loại email

| Email | Khi nào gửi | Người nhận |
|-------|-------------|------------|
| **Verification Email** | Khi STUDENT đăng ký | Học sinh |
| **Teacher Pending** | Khi TEACHER đăng ký | Giáo viên |
| **Teacher Approved** | Khi admin approve TEACHER | Giáo viên |
| **Teacher Rejected** | Khi admin reject TEACHER | Giáo viên |

## 🎨 Email Templates

Tất cả email đều có:
- ✅ HTML version (đẹp, responsive)
- ✅ Text version (fallback)
- ✅ Branding với gradient colors
- ✅ Call-to-action buttons
- ✅ Mobile-friendly

Preview templates tại: `app/service/email.server.js`

## 🔧 Troubleshooting

### Email không được gửi?

**1. Kiểm tra console logs:**
```
📧 [DEV] Verification email would be sent to: xxx@example.com
```
→ SMTP chưa được cấu hình. Thêm SMTP_* vào .env

**2. Lỗi "Invalid login":**
- Gmail: Đảm bảo dùng App Password, không phải password thật
- Kiểm tra SMTP_USER và SMTP_PASS

**3. Email vào spam:**
- Dùng Mailtrap để test
- Production: Verify domain với SMTP provider

### Cần gửi nhiều email?

Gmail free: 500 emails/ngày
→ Nâng cấp lên SendGrid hoặc Mailgun (xem docs/EMAIL_SETUP.md)

## 📚 Tài liệu chi tiết

- **Setup SMTP providers**: `docs/EMAIL_SETUP.md`
- **Customize templates**: `app/service/email.server.js`
- **User roles system**: `docs/USER_ROLES.md`

## 🎯 Production Checklist

Trước khi deploy:

- [ ] Đổi SMTP provider sang SendGrid/Mailgun
- [ ] Cập nhật APP_URL sang domain thật
- [ ] Verify sender domain
- [ ] Test tất cả email flows
- [ ] Setup monitoring/logging
- [ ] Không commit .env file

## 💡 Tips

**Development:**
- Dùng Mailtrap để xem email preview
- Hoặc Gmail nếu cần test email thật

**Production:**
- SendGrid: Reliable, analytics tốt, 100 emails/day free
- Mailgun: 5000 emails/month free (3 tháng đầu)

**Không nên:**
- Dùng Gmail cho production (limit thấp)
- Hardcode SMTP credentials trong code

## 🆘 Support

Gặp vấn đề? Kiểm tra:
1. Console logs khi đăng ký
2. SMTP credentials trong .env
3. Firewall/antivirus không chặn port 587
4. Docs: `docs/EMAIL_SETUP.md`

---

**Happy emailing! 📬**
