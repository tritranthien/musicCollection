import { useForm } from "react-hook-form";
import { Form, redirect } from "react-router";
import { useFetcherWithReset } from "../../../hooks/useFetcherWithReset";
import Logo from "../../logo/Logo";
import styles from "../LoginForm.module.css";
import { useEffect, useState } from "react";

export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (email !== "test@example.com" || password !== "123456") {
    return { error: "Email hoặc mật khẩu không đúng", status: 400 };
  }

  return redirect("/bang-dieu-khien");
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const fetcher = useFetcherWithReset();
  const [fetchError, setFetchError] = useState(null);
  const onSubmit = (data) => {
    const form = new FormData();
    form.append("email", data.email);
    form.append("password", data.password);
    fetcher.submit(form, { method: "post" });
  };
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error) {
        setFetchError(fetcher.data.error);
      } else {
        setFetchError(null);
      }
      fetcher.reset();
    }
  }, [fetcher.data]);
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Logo />
        <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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

          {fetchError && <p className={styles.error}>{fetchError}</p>}

          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <p style={{ marginTop: "1rem", textAlign: "center" }}>
            Chưa có tài khoản?{" "}
            <a
              href="/dang-ky"
              style={{ color: "#4f46e5", fontWeight: "500", textDecoration: "none" }}
            >
              Đăng ký ngay
            </a>
          </p>
        </Form>
      </div>
    </div>
  );
}
