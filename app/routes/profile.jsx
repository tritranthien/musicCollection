import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { User, Lock, Mail, Shield, Calendar, CheckCircle } from "lucide-react";
import { requireAuth } from "../service/auth.server.js";
import { updateUserProfile } from "../service/user.server.js";
import { changePassword } from "../service/password.server.js";
import styles from "../globals/styles/profile.module.css";

export async function loader({ request }) {
    const user = await requireAuth(request);
    return { user };
}

export async function action({ request }) {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const intent = formData.get("intent");

    try {
        if (intent === "updateProfile") {
            const name = formData.get("name");

            await updateUserProfile(user.id, { name });

            return {
                success: true,
                message: "Cập nhật thông tin thành công!",
                type: "profile",
            };
        }

        if (intent === "changePassword") {
            const currentPassword = formData.get("currentPassword");
            const newPassword = formData.get("newPassword");
            const confirmPassword = formData.get("confirmPassword");

            if (newPassword !== confirmPassword) {
                return {
                    success: false,
                    error: "Mật khẩu xác nhận không khớp.",
                    type: "password",
                };
            }

            if (newPassword.length < 6) {
                return {
                    success: false,
                    error: "Mật khẩu phải có ít nhất 6 ký tự.",
                    type: "password",
                };
            }

            await changePassword(user.id, currentPassword, newPassword);

            return {
                success: true,
                message: "Đổi mật khẩu thành công!",
                type: "password",
            };
        }

        return {
            success: false,
            error: "Hành động không hợp lệ.",
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
            type: intent === "updateProfile" ? "profile" : "password",
        };
    }
}

export default function Profile() {
    const { user } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getRoleLabel = (role) => {
        const labels = {
            ADMIN: "Quản trị viên",
            MANAGER: "Quản lý",
            TEACHER: "Giáo viên",
            STUDENT: "Học sinh",
        };
        return labels[role] || role;
    };

    const getStatusLabel = (status) => {
        const labels = {
            PENDING: "Chờ phê duyệt",
            APPROVED: "Đã phê duyệt",
            ACTIVE: "Hoạt động",
            REJECTED: "Bị từ chối",
        };
        return labels[status] || status;
    };

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <div className={styles.headerIcon}>
                    <User size={32} />
                </div>
                <h1 className={styles.headerTitle}>Thông tin tài khoản</h1>
                <p className={styles.headerSubtitle}>
                    Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
                </p>
            </div>

            {/* Account Information Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <User size={20} />
                    <h2 className={styles.sectionTitle}>Thông tin cá nhân</h2>
                </div>

                {actionData?.success && actionData?.type === "profile" && (
                    <div className={styles.successMessage}>
                        <CheckCircle size={20} />
                        <span>{actionData.message}</span>
                    </div>
                )}

                {actionData?.error && actionData?.type === "profile" && (
                    <div className={styles.errorMessage}>
                        <span>{actionData.error}</span>
                    </div>
                )}

                <Form method="post" className={styles.form}>
                    <input type="hidden" name="intent" value="updateProfile" />

                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            defaultValue={user.name}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            <Mail size={16} />
                            Email (Không thể thay đổi)
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={user.email}
                            className={styles.inputReadonly}
                            readOnly
                        />
                        <small className={styles.hint}>
                            Email là định danh đăng nhập và không thể thay đổi
                        </small>
                        {!user.emailVerified && (
                            <small className={styles.hint} style={{ color: '#f59e0b' }}>
                                ⚠️ Email chưa được xác thực
                            </small>
                        )}
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <Shield size={16} />
                                Vai trò
                            </label>
                            <input
                                type="text"
                                value={getRoleLabel(user.role)}
                                className={styles.inputReadonly}
                                readOnly
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <CheckCircle size={16} />
                                Trạng thái
                            </label>
                            <input
                                type="text"
                                value={getStatusLabel(user.status)}
                                className={styles.inputReadonly}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Calendar size={16} />
                            Ngày tạo tài khoản
                        </label>
                        <input
                            type="text"
                            value={formatDate(user.createdAt)}
                            className={styles.inputReadonly}
                            readOnly
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang cập nhật..." : "Cập nhật thông tin"}
                    </button>
                </Form>
            </div>

            {/* Change Password Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Lock size={20} />
                    <h2 className={styles.sectionTitle}>Đổi mật khẩu</h2>
                </div>

                {actionData?.success && actionData?.type === "password" && (
                    <div className={styles.successMessage}>
                        <CheckCircle size={20} />
                        <span>{actionData.message}</span>
                    </div>
                )}

                {actionData?.error && actionData?.type === "password" && (
                    <div className={styles.errorMessage}>
                        <span>{actionData.error}</span>
                    </div>
                )}

                <Form method="post" className={styles.form}>
                    <input type="hidden" name="intent" value="changePassword" />

                    <div className={styles.formGroup}>
                        <label htmlFor="currentPassword" className={styles.label}>
                            Mật khẩu hiện tại
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            className={styles.input}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="newPassword" className={styles.label}>
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            className={styles.input}
                            required
                            minLength={6}
                        />
                        <small className={styles.hint}>Tối thiểu 6 ký tự</small>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            Xác nhận mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className={styles.input}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                </Form>
            </div>
        </div>
    );
}
