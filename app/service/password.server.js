// app/service/password.server.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/db.server.js";
import { sendPasswordResetEmail } from "./email.server.js";

/**
 * Yêu cầu reset password
 */
export const requestPasswordReset = async (email) => {
  // Tìm user theo email
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Không tiết lộ email có tồn tại hay không (security)
    // Trả về success message nhưng không gửi email
    console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
    return {
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
      resetToken: null, // Không có token vì user không tồn tại
    };
  }

  // Tạo reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 giờ

  // Lưu token vào database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpiry: resetTokenExpiry,
    },
  });

  // Gửi email
  try {
    await sendPasswordResetEmail(user.email, user.name, resetToken);
  } catch (emailError) {
    console.error("❌ Email sending error:", emailError);
    // Vẫn throw error vì đây là critical
    throw emailError;
  }

  console.log(`✅ Password reset email sent to: ${user.email}`);
  return {
    message: "Email hướng dẫn đặt lại mật khẩu đã được gửi.",
    resetToken, // Trả về để test khi SMTP chưa config
  };
};

/**
 * Verify reset token
 */
export const verifyResetToken = async (token) => {
  console.log(`🔍 Verifying token: ${token}`);
  console.log(`🕒 Server time: ${new Date().toISOString()}`);

  // 1. Check if token exists first (ignoring expiry)
  const userWithToken = await prisma.user.findFirst({
    where: { resetPasswordToken: token }
  });

  if (!userWithToken) {
    console.log("❌ Token not found in database");
    throw new Error("Link đặt lại mật khẩu không hợp lệ.");
  }

  console.log(`✅ Token found for user: ${userWithToken.email}`);
  console.log(`⏰ Token expiry in DB: ${userWithToken.resetPasswordExpiry?.toISOString()}`);

  // 2. Check expiry manually to be sure
  const now = new Date();
  const expiry = new Date(userWithToken.resetPasswordExpiry);

  if (now > expiry) {
    console.log("❌ Token expired!");
    console.log(`   Now: ${now.toISOString()}`);
    console.log(`   Exp: ${expiry.toISOString()}`);
    throw new Error("Link đặt lại mật khẩu đã hết hạn.");
  }

  console.log("✅ Token is valid and active!");
  return userWithToken;
};

/**
 * Reset password với token
 */
export const resetPassword = async (token, newPassword) => {
  // Verify token
  const user = await verifyResetToken(token);

  // Hash password mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Cập nhật password và xóa reset token
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    },
  });

  return updatedUser;
};

/**
 * Đổi mật khẩu (khi đã đăng nhập)
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  // Lấy user
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password);

  if (!isValid) {
    throw new Error("Mật khẩu hiện tại không đúng.");
  }

  // Hash password mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Cập nhật password
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return updatedUser;
};
