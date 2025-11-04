import { redirect } from "react-router";
import { useForm } from "react-hook-form";
import styles from "../LoginForm.module.css";
import Logo from "../../logo/Logo";

export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (email !== "test@example.com" || password !== "123456") {
    return json({ error: "Email hoặc mật khẩu không đúng" }, { status: 400 });
  }

  return redirect("/dashboard");
}

export default function LoginPage({ actionData }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = (data) => {
    const form = document.getElementById("remix-form");
    for (const key in data) {
      form.elements[key].value = data[key];
    }
    form.requestSubmit();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Logo />
        <form id="remix-form" method="post" className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <h2 className={styles.title}>Đăng nhập</h2>

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              {...register("email", { required: "Vui lòng nhập email" })}
              placeholder="Nhập email..."
            />
            {errors.email && <p className={styles.error}>{errors.email.message}</p>}
          </div>

          <div className={styles.field}>
            <label>Mật khẩu</label>
            <input
              type="password"
              {...register("password", { required: "Vui lòng nhập mật khẩu" })}
              placeholder="Nhập mật khẩu..."
            />
            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
          </div>

          {actionData?.error && <p className={styles.error}>{actionData.error}</p>}

          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <p style={{ marginTop: "1rem", textAlign: "center" }}>
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              style={{ color: "#4f46e5", fontWeight: "500", textDecoration: "none" }}
            >
              Đăng ký ngay
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
