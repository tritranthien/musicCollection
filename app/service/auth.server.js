import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/db.server.js";
import { createCookie } from "react-router";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendTeacherPendingEmail
} from "./email.server.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const JWT_EXPIRES_IN = "7d";

// cookie để lưu token
export const authCookie = createCookie("token", {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 ngày
});

// 📝 Đăng ký tài khoản mới
export const register = async (email, password, name, role = "STUDENT") => {
  // Kiểm tra email đã tồn tại
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Xác định status dựa trên role
  let status = "PENDING";
  if (role === "STUDENT") {
    status = "PENDING"; // Chờ verify email
  } else if (role === "TEACHER") {
    status = "PENDING"; // Chờ admin phê duyệt
  }

  // Tạo user mới
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      status,
      verificationToken,
      emailVerified: false,
    },
  });

  // Gửi email tương ứng với role
  try {
    if (role === "STUDENT") {
      // Gửi email xác thực cho học sinh
      await sendVerificationEmail(email, name, verificationToken);
    } else if (role === "TEACHER") {
      // Gửi email thông báo chờ duyệt cho giáo viên
      await sendTeacherPendingEmail(email, name);
    }
  } catch (emailError) {
    console.error("Email sending error:", emailError);
    // Không throw error vì user đã được tạo thành công
    // Chỉ log lỗi để admin biết
  }

  return {
    user,
    verificationToken, // Trả về để test khi SMTP chưa config
  };
};

// ✅ Xác thực email
export const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }

  // Cập nhật trạng thái
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      // STUDENT sau khi verify email -> ACTIVE
      // TEACHER vẫn giữ PENDING chờ admin duyệt
      status: user.role === "STUDENT" ? "ACTIVE" : user.status,
    },
  });

  return updatedUser;
};

// 🔐 Đăng nhập
export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Sai email hoặc mật khẩu");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Sai email hoặc mật khẩu");

  // Kiểm tra trạng thái tài khoản
  if (user.role === "STUDENT" && user.status !== "ACTIVE") {
    if (!user.emailVerified) {
      throw new Error("Vui lòng xác thực email trước khi đăng nhập");
    }
    throw new Error("Tài khoản chưa được kích hoạt");
  }

  if (user.role === "TEACHER" && user.status !== "APPROVED" && user.status !== "ACTIVE") {
    if (user.status === "PENDING") {
      throw new Error("Tài khoản đang chờ quản trị viên phê duyệt");
    }
    if (user.status === "REJECTED") {
      throw new Error("Tài khoản đã bị từ chối");
    }
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Lưu token vào cookie
  const cookieHeader = await authCookie.serialize(token);

  return {
    headers: { "Set-Cookie": cookieHeader },
    user,
  };
};

export const authenticate = async (request) => {
  const cookieHeader = request.headers.get("Cookie");
  const token = await authCookie.parse(cookieHeader);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    return user;
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return null;
  }
};

export const getUser = async (request) => {
  return await authenticate(request);
};

// ✅ Yêu cầu đăng nhập
export const requireAuth = async (request) => {
  const user = await authenticate(request);
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
};

// 🔒 Yêu cầu role cụ thể
export const requireRole = async (request, allowedRoles = []) => {
  const user = await requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw new Response("Forbidden - Bạn không có quyền truy cập", { status: 403 });
  }
  return user;
};

// 🚪 Đăng xuất
export const logout = async () => {
  const cookieHeader = await authCookie.serialize("", { maxAge: 0 });
  return new Response("Đã đăng xuất", {
    headers: { "Set-Cookie": cookieHeader },
  });
};

