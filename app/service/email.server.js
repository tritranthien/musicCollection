// app/service/email.server.js
import nodemailer from "nodemailer";

// Cấu hình SMTP transporter
const createTransporter = () => {
  // Kiểm tra xem có cấu hình SMTP không
  if (!process.env.SMTP_HOST) {
    console.warn("⚠️  SMTP not configured. Emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Gửi email xác thực tài khoản
 */
export const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [DEV] Verification email would be sent to: ${email}`);
    console.log(`🔗 Token: ${token}`);
    return { success: false, message: "SMTP not configured" };
  }

  const verificationUrl = `${process.env.APP_URL || "http://localhost:5173"}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Music Collection"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: "Xác thực tài khoản - Music Collection",
    html: getVerificationEmailTemplate(name, verificationUrl),
    text: `
Xin chào ${name},

Cảm ơn bạn đã đăng ký tài khoản tại Music Collection!

Vui lòng click vào link sau để xác thực email của bạn:
${verificationUrl}

Link này sẽ hết hạn sau 24 giờ.

Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.

Trân trọng,
Music Collection Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new Error("Không thể gửi email xác thực. Vui lòng thử lại sau.");
  }
};

/**
 * Gửi email thông báo tài khoản giáo viên đang chờ phê duyệt
 */
export const sendTeacherPendingEmail = async (email, name) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [DEV] Teacher pending email would be sent to: ${email}`);
    return { success: false, message: "SMTP not configured" };
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Music Collection"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: "Tài khoản đang chờ phê duyệt - Music Collection",
    html: getTeacherPendingTemplate(name),
    text: `
Xin chào ${name},

Cảm ơn bạn đã đăng ký tài khoản giáo viên tại Music Collection!

Tài khoản của bạn đang được quản trị viên xem xét và phê duyệt.
Bạn sẽ nhận được email thông báo khi tài khoản được kích hoạt.

Quá trình này thường mất từ 1-2 ngày làm việc.

Trân trọng,
Music Collection Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Teacher pending email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending teacher pending email:", error);
    // Không throw error vì đây không phải critical
    return { success: false, error: error.message };
  }
};

/**
 * Gửi email thông báo tài khoản giáo viên đã được phê duyệt
 */
export const sendTeacherApprovedEmail = async (email, name) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [DEV] Teacher approved email would be sent to: ${email}`);
    return { success: false, message: "SMTP not configured" };
  }

  const loginUrl = `${process.env.APP_URL || "http://localhost:5173"}/dang-nhap`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Music Collection"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: "✅ Tài khoản đã được phê duyệt - Music Collection",
    html: getTeacherApprovedTemplate(name, loginUrl),
    text: `
Xin chào ${name},

Chúc mừng! Tài khoản giáo viên của bạn đã được phê duyệt.

Bạn có thể đăng nhập ngay tại: ${loginUrl}

Trân trọng,
Music Collection Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Teacher approved email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending teacher approved email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi email thông báo tài khoản giáo viên bị từ chối
 */
export const sendTeacherRejectedEmail = async (email, name, reason = "") => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [DEV] Teacher rejected email would be sent to: ${email}`);
    return { success: false, message: "SMTP not configured" };
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Music Collection"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: "Thông báo về tài khoản - Music Collection",
    html: getTeacherRejectedTemplate(name, reason),
    text: `
Xin chào ${name},

Rất tiếc, tài khoản giáo viên của bạn chưa được phê duyệt.

${reason ? `Lý do: ${reason}` : ""}

Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi.

Trân trọng,
Music Collection Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Teacher rejected email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending teacher rejected email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi email thông báo cho admin khi có giảng viên đăng ký mới
 */
export const sendAdminNotificationEmail = async (teacherEmail, teacherName) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [DEV] Admin notification email would be sent for teacher: ${teacherEmail}`);
    return { success: false, message: "SMTP not configured" };
  }

  // Lấy email admin từ biến môi trường, mặc định là SMTP_USER nếu không có
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  if (!adminEmail) {
    console.warn("⚠️  No admin email configured. Skipping admin notification.");
    return { success: false, message: "Admin email not configured" };
  }

  const approvalUrl = `${process.env.APP_URL || "http://localhost:5173"}/bang-dieu-khien/quan-ly-nguoi-dung`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Music Collection"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: "🔔 Có giảng viên mới đăng ký - Music Collection",
    html: getAdminNotificationTemplate(teacherName, teacherEmail, approvalUrl),
    text: `
Thông báo: Có giảng viên mới đăng ký

Thông tin giảng viên:
- Họ tên: ${teacherName}
- Email: ${teacherEmail}

Vui lòng vào hệ thống để phê duyệt tài khoản:
${approvalUrl}

Trân trọng,
Music Collection System
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Admin notification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending admin notification email:", error);
    return { success: false, error: error.message };
  }
};

// ==================== EMAIL TEMPLATES ====================

function getVerificationEmailTemplate(name, verificationUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác thực tài khoản</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎵 Music Collection</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0;">Xin chào ${name}!</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                Cảm ơn bạn đã đăng ký tài khoản tại <strong>Music Collection</strong>.
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0;">
                Vui lòng click vào nút bên dưới để xác thực địa chỉ email của bạn:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                      Xác thực tài khoản
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Hoặc copy link sau vào trình duyệt:<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                <strong>Lưu ý:</strong> Link này sẽ hết hạn sau 24 giờ.
              </p>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Music Collection. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getTeacherPendingTemplate(name) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tài khoản đang chờ phê duyệt</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏳ Đang chờ phê duyệt</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0;">Xin chào ${name}!</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                Cảm ơn bạn đã đăng ký tài khoản <strong>Giáo viên</strong> tại Music Collection.
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                Tài khoản của bạn đang được quản trị viên xem xét và phê duyệt.
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                Bạn sẽ nhận được email thông báo khi tài khoản được kích hoạt.
              </p>
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Quá trình này thường mất từ <strong>1-2 ngày làm việc</strong>.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Music Collection. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getTeacherApprovedTemplate(name, loginUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tài khoản đã được phê duyệt</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Chúc mừng!</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0;">Xin chào ${name}!</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                Tài khoản <strong>Giáo viên</strong> của bạn đã được phê duyệt thành công! 🎉
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0;">
                Bạn có thể đăng nhập và bắt đầu sử dụng hệ thống ngay bây giờ.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${loginUrl}" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                      Đăng nhập ngay
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Music Collection. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getTeacherRejectedTemplate(name, reason) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thông báo về tài khoản</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Thông báo về tài khoản</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0;">Xin chào ${name}!</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                Rất tiếc, tài khoản giáo viên của bạn chưa được phê duyệt.
              </p>
              ${reason ? `
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; line-height: 1.6;">
                  <strong>Lý do:</strong> ${reason}
                </p>
              </div>
              ` : ''}
              <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0;">
                Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi để được hỗ trợ.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Music Collection. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getAdminNotificationTemplate(teacherName, teacherEmail, approvalUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Giảng viên mới đăng ký</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔔 Giảng viên mới đăng ký</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0;">Thông báo từ hệ thống</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                Có một giảng viên mới vừa đăng ký tài khoản và đang chờ phê duyệt.
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #333333; margin: 0 0 10px 0; font-size: 14px;">
                  <strong style="color: #667eea;">👤 Họ tên:</strong> ${teacherName}
                </p>
                <p style="color: #333333; margin: 0; font-size: 14px;">
                  <strong style="color: #667eea;">📧 Email:</strong> ${teacherEmail}
                </p>
              </div>
              
              <p style="color: #666666; line-height: 1.6; margin: 20px 0 30px 0;">
                Vui lòng vào hệ thống để xem xét và phê duyệt tài khoản này.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${approvalUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                      Vào trang quản lý
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Hoặc copy link sau vào trình duyệt:<br>
                <a href="${approvalUrl}" style="color: #667eea; word-break: break-all;">${approvalUrl}</a>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Music Collection. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Gửi email reset password
 */
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [DEV] Password reset email would be sent to: ${email}`);
    console.log(`🔗 Reset Token: ${resetToken}`);
    return { success: false, message: "SMTP not configured", resetToken };
  }

  const resetUrl = `${process.env.APP_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Music Collection"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: "🔑 Đặt lại mật khẩu - Music Collection",
    html: getPasswordResetTemplate(name, resetUrl),
    text: `
Xin chào ${name},

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

Vui lòng click vào link sau để đặt lại mật khẩu:
${resetUrl}

Link này sẽ hết hạn sau 1 giờ.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Music Collection Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
  }
};

function getPasswordResetTemplate(name, resetUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt lại mật khẩu</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔑 Đặt lại mật khẩu</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0;">Xin chào ${name}!</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0;">
                Vui lòng click vào nút bên dưới để tạo mật khẩu mới:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                      Đặt lại mật khẩu
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Hoặc copy link sau vào trình duyệt:<br>
                <a href="${resetUrl}" style="color: #f5576c; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #856404; margin: 0; line-height: 1.6; font-size: 14px;">
                  <strong>⚠️ Lưu ý:</strong> Link này sẽ hết hạn sau <strong>1 giờ</strong>.
                </p>
              </div>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Music Collection. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
