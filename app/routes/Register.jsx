import RegisterForm from "../components/forms/register/RegisterForm";
import { getUser, register } from "../service/auth.server.js";
import { redirect } from "react-router";

export async function loader({ request }) {
  let user = await getUser(request);
  if (user) throw redirect("/bang-dieu-khien");
  return null;
}

export async function action({ request }) {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const name = form.get("name");
  const role = form.get("role") || "STUDENT";

  try {
    const { user, verificationToken } = await register(email, password, name, role);

    // Trả về thông báo tùy theo role
    if (role === "STUDENT") {
      return Response.json({
        success: true,
        message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
        verificationToken, // Để test, production sẽ gửi qua email
      });
    } else if (role === "TEACHER") {
      return Response.json({
        success: true,
        message: "Đăng ký thành công! Tài khoản của bạn đang chờ quản trị viên phê duyệt.",
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({
      error: err.message || "Đăng ký thất bại",
    }, { status: 400 });
  }
}

export function meta() {
  return [
    { title: "Đăng ký" },
    { name: "description", content: "Đăng ký tài khoản mới" },
  ];
}

export default function Register() {
  return <RegisterForm />;
}

