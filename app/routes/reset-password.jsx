import { Form, useActionData, useNavigation, useSearchParams, redirect } from "react-router";
import { Key, CheckCircle } from "lucide-react";
import { resetPassword } from "../service/password.server.js";
import styles from "../globals/styles/auth.module.css";

export async function loader({ request }) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
        return redirect("/forgot-password");
    }

    // Verify token - import inside loader to avoid Vite warning
    try {
        const { verifyResetToken } = await import("../service/password.server.js");
        await verifyResetToken(token);
        return { tokenValid: true };
    } catch (error) {
        return { tokenValid: false, error: error.message };
    }
}

export async function action({ request }) {
    const formData = await request.formData();
    const token = formData.get("token");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    // Validate
    if (password !== confirmPassword) {
        return {
            success: false,
            error: "Mật khẩu xác nhận không khớp.",
        };
    }

    if (password.length < 6) {
        return {
            success: false,
            error: "Mật khẩu phải có ít nhất 6 ký tự.",
        };
    }

    try {
        await resetPassword(token, password);
        return {
            success: true,
            message: "Mật khẩu đã được đặt lại thành công!",
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        };
    }
}

export default function ResetPassword({ loaderData }) {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    // Token invalid
    if (loaderData && !loaderData.tokenValid) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <div className={styles.errorMessage}>
                        <h2>Link không hợp lệ</h2>
                        <p>{loaderData.error || "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}</p>
                        <a href="/forgot-password" className={styles.submitButton}>
                            Yêu cầu link mới
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Success
    if (actionData?.success) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <div className={styles.successMessage}>
                        <CheckCircle size={64} className={styles.successIcon} />
                        <h2>Thành công!</h2>
                        <p>{actionData.message}</p>
                        <a href="/dang-nhap" className={styles.submitButton}>
                            Đăng nhập ngay
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                {/* Header */}
                <div className={styles.authHeader}>
                    <div className={styles.authIcon}>
                        <Key size={48} />
                    </div>
                    <h1 className={styles.authTitle}>Đặt lại mật khẩu</h1>
                    <p className={styles.authSubtitle}>
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </p>
                </div>

                {/* Error Message */}
                {actionData?.error && (
                    <div className={styles.errorMessage}>
                        <p>{actionData.error}</p>
                    </div>
                )}

                {/* Form */}
                <Form method="post" className={styles.authForm}>
                    <input type="hidden" name="token" value={token} />

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.formLabel}>
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={styles.formInput}
                            placeholder="Nhập mật khẩu mới"
                            required
                            minLength={6}
                            autoFocus
                        />
                        <small className={styles.formHint}>Tối thiểu 6 ký tự</small>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.formLabel}>
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className={styles.formInput}
                            placeholder="Nhập lại mật khẩu mới"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                    </button>
                </Form>

                {/* Footer */}
                <div className={styles.authFooter}>
                    <a href="/dang-nhap" className={styles.backLink}>
                        Quay lại đăng nhập
                    </a>
                </div>
            </div>
        </div>
    );
}
