import RegisterForm from "../components/forms/register/RegisterForm";

export function meta() {
  return [
    { title: "Đăng ký" },
    { name: "description", content: "Đăng ký" },
  ];
}

export default function Register() {
  return <RegisterForm />;
}
