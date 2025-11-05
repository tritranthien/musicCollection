import LoginForm from "../components/forms/login/LoginForm";
import { getUser, login } from "../service/auth.server.js";
import { redirect } from "react-router";

export async function loader({ request }) {
  let user = await getUser(request);
  if (user) throw redirect("/dashboard");
  return null;
}

export async function action({ request }) {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");

  try {
    const { headers, user } = await login(email, password);

    return redirect("/dashboard", { headers });
  } catch (err) {
    return {
      error: err.message || "Email hoặc mật khẩu không đúng",
      status: 400,
    }
  }
}

export function meta() {
  return [
    { title: "Đăng nhập" },
    { name: "description", content: "Đăng nhập" },
  ];
}

export default function Login() {
  return <LoginForm />;
}
