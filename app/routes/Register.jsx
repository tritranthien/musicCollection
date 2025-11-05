import RegisterForm from "../components/forms/register/RegisterForm";
import { getUser } from "../service/auth.server.js";
import { redirect } from "react-router";

export async function loader({ request }) {
  let user = await getUser(request);
  if (user) throw redirect("/dashboard");
  return null;
}

export function meta() {
  return [
    { title: "Đăng ký" },
    { name: "description", content: "Đăng ký" },
  ];
}

export default function Register() {
  return <RegisterForm />;
}
