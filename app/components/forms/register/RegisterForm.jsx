import { redirect } from "react-router";
import { useForm } from "react-hook-form";
import Logo from "../../logo/Logo";
import styles from "../LoginForm.module.css";

export async function action({ request }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    return json({ error: "Mật khẩu xác nhận không khớp" }, { status: 400 });
  }

  return redirect("/login");
}

export default function RegisterPage({ actionData }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = (data) => {
    const form = document.getElementById("remix-form");
    for (const key in data) form.elements[key].value = data[key];
    form.requestSubmit();
  };

  const password = watch("password");

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
              <option value="" disabled></option>
              <option value="Giảng viên">👨‍🏫 Giảng viên</option>
              <option value="Học sinh">🎓 Học sinh</option>
              <option value="Người đóng góp">🎶 Người đóng góp</option>
            </select>
            {errors.role && <p className={styles.error}>{errors.role.message}</p>}
          </div>
          {actionData?.error && (
            <p className={styles.error}>{actionData.error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.button}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>

          <p style={{ marginTop: "1rem", textAlign: "center" }}>
            Đã có tài khoản?{" "}
            <a href="/login" style={{ color: "#4f46e5", fontWeight: "500" }}>
              Đăng nhập
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
