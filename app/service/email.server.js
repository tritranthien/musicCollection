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
