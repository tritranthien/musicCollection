import { Form, useActionData, useNavigation } from "react-router";
import { Mail, ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "../service/password.server.js";
import styles from "../globals/styles/auth.module.css";

export async function action({ request }) {
    const formData = await request.formData();
    const email = formData.get("email");

    try {
        const result = await requestPasswordReset(email);
        return {
            success: true,
            message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
            resetToken: result.resetToken, // For dev/testing
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        };
    }
}

export default function ForgotPassword() {
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                {/* Header */}
                <div className={styles.authHeader}>
                    <div className={styles.authIcon}>
                        <Mail size={48} />
                    </div>
                    <h1 className={styles.authTitle}>Quên mật khẩu?</h1>
                    <p className={styles.authSubtitle}>
                        Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
                    </p>
                </div>

                {/* Success Message */}
                {actionData?.success && (
                    <div className={styles.successMessage}>
                        <p>{actionData.message}</p>
                        {actionData.resetToken && process.env.NODE_ENV === "development" && (
                            <div className={styles.devInfo}>
                                <p><strong>Dev Mode:</strong> Reset Token:</p>
                                <code>{actionData.resetToken}</code>
                                <p>
                                    <a href={`/reset-password?token=${actionData.resetToken}`}>
                                        Click để reset password
                                    </a>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {actionData?.error && (
                    <div className={styles.errorMessage}>
                        <p>{actionData.error}</p>
                    </div>
                )}

                {/* Form */}
                {!actionData?.success && (
                    <Form method="post" className={styles.authForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={styles.formInput}
                                placeholder="your.email@example.com"
                                required
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Đang gửi..." : "Gửi hướng dẫn"}
                        </button>
                    </Form>
                )}

                {/* Back to Login */}
                <div className={styles.authFooter}>
                    <a href="/dang-nhap" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        <span>Quay lại đăng nhập</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
