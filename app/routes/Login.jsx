import LoginForm from "../components/forms/login/LoginForm";

export function meta() {
  return [
    { title: "Đăng nhập" },
    { name: "description", content: "Đăng nhập" },
  ];
}

export default function Login() {
  return <LoginForm />;
}
