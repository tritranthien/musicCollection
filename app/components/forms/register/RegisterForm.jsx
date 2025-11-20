import { useForm } from "react-hook-form";
import Logo from "../../logo/Logo";
import styles from "../LoginForm.module.css";
import { useFetcherWithReset } from "../../../hooks/useFetcherWithReset";
import { useEffect } from "react";

export default function RegisterPage() {
  const fetcher = useFetcherWithReset();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("role", data.role);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    fetcher.submit(formData, { method: "post" });
  };

  const password = watch("password");

  // Debug: Log fetcher state
  useEffect(() => {
    console.log("Fetcher state:", {
      state: fetcher.state,
      data: fetcher.data,
    });
  }, [fetcher.state, fetcher.data]);

  // Hiển thị loading
  if (fetcher.state === "submitting" || fetcher.state === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <Logo />
          <div className={styles.form}>
            <h2 className={styles.title}>⏳ Đang xử lý...</h2>
            <p style={{ textAlign: "center" }}>
              Vui lòng đợi trong giây lát
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Nếu đăng ký thành công, hiển thị thông báo
  if (fetcher.data?.success) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <Logo />
          <div className={styles.form}>
            <h2 className={styles.title}>✅ Đăng ký thành công!</h2>
            <p style={{ textAlign: "center", marginBottom: "1rem" }}>
              {fetcher.data?.message}
            </p>
            {fetcher.data?.verificationToken && (
              <div style={{
                background: "#f3f4f6",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.875rem"
              }}>
                <p><strong>Token xác thực (để test):</strong></p>
                <code style={{ wordBreak: "break-all" }}>
                  {fetcher.data?.verificationToken}
                </code>
                <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#6b7280" }}>
                  Link: <a href={`/verify-email?token=${fetcher.data?.verificationToken}`}>
                    Xác thực ngay
                  </a>
                </p>
              </div>
            )}
            <a
              href="/dang-nhap"
              className={styles.button}
              style={{ textAlign: "center", display: "block", textDecoration: "none" }}
            >
              Đến trang đăng nhập
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Logo />
        <form
          id="remix-form"
          method="post"
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className={styles.title}>Đăng ký</h2>

          <div className={styles.field}>
            <label>Họ và tên</label>
            <input
              type="text"
              {...register("name", { required: "Vui lòng nhập họ tên" })}
            />
            {errors.name && <p className={styles.error}>{errors.name.message}</p>}
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              {...register("email", { required: "Vui lòng nhập email" })}
            />
            {errors.email && <p className={styles.error}>{errors.email.message}</p>}
          </div>

          <div className={styles.field}>
            <label>Bạn là</label>
            <select
              {...register("role", { required: "Vui lòng chọn vai trò" })}
              defaultValue=""
            >
              <option value="" disabled>Chọn vai trò...</option>
              <option value="TEACHER">👨‍🏫 Giảng viên</option>
              <option value="STUDENT">🎓 Học sinh</option>
            </select>
            {errors.role && <p className={styles.error}>{errors.role.message}</p>}
          </div>

          <div className={styles.field}>
            <label>Mật khẩu</label>
            <input
              type="password"
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự"
                }
              })}
            />
            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
          </div>

          <div className={styles.field}>
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Vui lòng xác nhận mật khẩu",
                validate: (value) =>
                  value === password || "Mật khẩu xác nhận không khớp",
              })}
            />
            {errors.confirmPassword && (
              <p className={styles.error}>{errors.confirmPassword.message}</p>
            )}
          </div>

          {fetcher?.data?.error && (
            <p className={styles.error}>{fetcher?.data?.error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.button}
          >
            {isSubmitting ? "Đang gửi..." : "Đăng ký"}
          </button>

          <p style={{ marginTop: "1rem", textAlign: "center" }}>
            Đã có tài khoản?{" "}
            <a href="/dang-nhap" style={{ color: "#4f46e5", fontWeight: "500" }}>
              Đăng nhập
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

