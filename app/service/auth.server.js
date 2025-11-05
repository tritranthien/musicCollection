import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/db.server.js";
import { createCookie } from "react-router";

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

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Sai email hoặc mật khẩu");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Sai email hoặc mật khẩu");

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

// 🚪 Đăng xuất
export const logout = async () => {
  const cookieHeader = await authCookie.serialize("", { maxAge: 0 });
  return new Response("Đã đăng xuất", {
    headers: { "Set-Cookie": cookieHeader },
  });
};
