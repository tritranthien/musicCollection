# Hướng dẫn cấu hình Email SMTP

Hệ thống sử dụng Nodemailer để gửi email thông qua SMTP. Bạn có thể sử dụng nhiều SMTP provider khác nhau.

## 📧 Các loại email được gửi

1. **Email xác thực tài khoản** (STUDENT)
   - Gửi khi học sinh đăng ký
   - Chứa link xác thực email
   - Link hết hạn sau 24 giờ

2. **Email thông báo chờ phê duyệt** (TEACHER)
   - Gửi khi giáo viên đăng ký
   - Thông báo tài khoản đang chờ admin duyệt

3. **Email phê duyệt thành công** (TEACHER)
   - Gửi khi admin approve tài khoản giáo viên
   - Chứa link đăng nhập

4. **Email từ chối tài khoản** (TEACHER)
   - Gửi khi admin reject tài khoản giáo viên
   - Có thể bao gồm lý do từ chối

## 🚀 Cấu hình SMTP

### Option 1: Gmail (Khuyên dùng cho development)

**Bước 1:** Bật 2-Step Verification
1. Truy cập https://myaccount.google.com/security
2. Bật "2-Step Verification"

**Bước 2:** Tạo App Password
1. Truy cập https://myaccount.google.com/apppasswords
2. Chọn "Mail" và "Other (Custom name)"
3. Nhập tên: "Music Collection"
4. Click "Generate"
5. Copy password 16 ký tự

**Bước 3:** Cấu hình .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App Password vừa tạo
SMTP_FROM_NAME=Music Collection
SMTP_FROM_EMAIL=your-email@gmail.com
APP_URL=http://localhost:5173
```

**Lưu ý:**
- Không dùng password Gmail thật
- Phải dùng App Password
- Gmail giới hạn 500 emails/ngày cho free account

---

### Option 2: SendGrid (Khuyên dùng cho production)

**Ưu điểm:**
- Free tier: 100 emails/ngày
- Reliable và nhanh
- Analytics tốt

**Setup:**
1. Đăng ký tại https://sendgrid.com
2. Verify email sender
3. Tạo API Key tại Settings > API Keys
4. Cấu hình .env:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxx  # API Key
SMTP_FROM_NAME=Music Collection
SMTP_FROM_EMAIL=verified-email@yourdomain.com
APP_URL=https://yourdomain.com
```

---

### Option 3: Mailgun

**Ưu điểm:**
- Free tier: 5,000 emails/tháng (3 tháng đầu)
- Sau đó: 1,000 emails/tháng free
- Tốt cho production

**Setup:**
1. Đăng ký tại https://mailgun.com
2. Verify domain hoặc dùng sandbox domain
3. Lấy SMTP credentials tại Sending > Domain Settings > SMTP
4. Cấu hình .env:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-smtp-password
SMTP_FROM_NAME=Music Collection
SMTP_FROM_EMAIL=noreply@your-domain.com
APP_URL=https://yourdomain.com
```

---

### Option 4: Mailtrap (Chỉ dùng để test)

**Ưu điểm:**
- Không gửi email thật
- Bắt tất cả email để xem preview
- Tuyệt vời cho development/testing

**Setup:**
1. Đăng ký tại https://mailtrap.io
2. Tạo inbox mới
3. Copy SMTP credentials
4. Cấu hình .env:

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

**Lưu ý:** Email sẽ KHÔNG được gửi đến người dùng thật, chỉ xuất hiện trong Mailtrap inbox.

---

## 🧪 Testing Email

### 1. Test đăng ký STUDENT
```bash
# Đăng ký tài khoản học sinh
curl -X POST http://localhost:5173/dang-ky \
  -d "name=Test Student" \
  -d "email=student@test.com" \
  -d "role=STUDENT" \
  -d "password=123456" \
  -d "confirmPassword=123456"

# Kiểm tra email inbox để lấy link verify
```

### 2. Test đăng ký TEACHER
```bash
# Đăng ký tài khoản giáo viên
curl -X POST http://localhost:5173/dang-ky \
  -d "name=Test Teacher" \
  -d "email=teacher@test.com" \
  -d "role=TEACHER" \
  -d "password=123456" \
  -d "confirmPassword=123456"

# Kiểm tra email inbox để xem thông báo chờ duyệt
```

### 3. Test approve/reject
1. Đăng nhập admin tại `/dang-nhap`
2. Vào `/admin/users`
3. Approve hoặc reject teacher
4. Kiểm tra email inbox

---

## 🔍 Troubleshooting

### Email không được gửi

**1. Kiểm tra logs:**
```bash
# Xem console logs khi đăng ký
# Sẽ có thông báo:
# ✅ Verification email sent: <messageId>
# hoặc
# ❌ Error sending verification email: <error>
```

**2. Kiểm tra SMTP config:**
```javascript
// Test SMTP connection
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.verify();
console.log('✅ SMTP connection successful');
```

**3. Lỗi thường gặp:**

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|-----------|
| `Invalid login` | Sai username/password | Kiểm tra lại SMTP_USER và SMTP_PASS |
| `Connection timeout` | Firewall chặn port | Thử port 465 hoặc 2525 |
| `Self signed certificate` | SSL issue | Set `SMTP_SECURE=false` |
| `Daily sending quota exceeded` | Gmail limit | Dùng SendGrid/Mailgun |

### Email vào spam

**Giải pháp:**
1. Verify domain với SMTP provider
2. Setup SPF, DKIM, DMARC records
3. Dùng domain email thay vì Gmail
4. Tránh spam words trong subject/content

---

## 📊 Monitoring

### Development
- Check console logs
- Sử dụng Mailtrap để xem email preview

### Production
- SendGrid: Dashboard > Activity
- Mailgun: Logs > Sending Logs
- Setup webhook để track delivery/opens/clicks

---

## 🔒 Security Best Practices

1. **Không commit .env file**
   ```bash
   # .gitignore
   .env
   .env.local
   ```

2. **Sử dụng environment variables**
   - Development: `.env`
   - Production: Platform environment variables (Vercel, Railway, etc.)

3. **Rotate credentials định kỳ**
   - Đổi SMTP password mỗi 3-6 tháng
   - Revoke unused API keys

4. **Rate limiting**
   - Giới hạn số email gửi/user/ngày
   - Implement cooldown giữa các lần gửi

---

## 📝 Customization

### Thay đổi email templates

Edit file `app/service/email.server.js`:

```javascript
function getVerificationEmailTemplate(name, verificationUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <!-- Your custom HTML here -->
    </html>
  `;
}
```

### Thêm loại email mới

```javascript
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: "Reset mật khẩu",
    html: getPasswordResetTemplate(name, resetUrl),
  };
  
  return await transporter.sendMail(mailOptions);
};
```

---

## 🎯 Recommendations

**Development:**
- Mailtrap (để test email templates)
- Gmail (nếu cần gửi email thật)

**Production:**
- SendGrid (reliable, analytics tốt)
- Mailgun (cost-effective)
- Amazon SES (nếu dùng AWS)

**Không nên dùng:**
- Gmail cho production (limit thấp)
- SMTP không verify domain (vào spam)
