import { useNavigate } from "react-router";
import { BookOpen, FileText, FolderOpen, Users, Plus, Upload, Search, Edit, TrendingUp } from "lucide-react";
import { usePermissions, useUser } from "../hooks/usePermissions";
import styles from "../globals/styles/indexDashboard.module.css";
import { DocumentModel } from "../.server/document.repo";
import { FileModel } from "../.server/fileUpload.repo";
import { LessonModel } from "../.server/lesson.repo";
import { UserModel } from "../.server/user.repo";

export async function loader({ request }) {
    const documentModel = new DocumentModel();
    const fileModel = new FileModel();
    const lessonModel = new LessonModel();
    const userModel = new UserModel();

    // Get statistics
    const [documents, files, lessons, users] = await Promise.all([
        documentModel.findAll(),
        fileModel.findAll(),
        lessonModel.findAll(),
        userModel.findAll(),
    ]);

    // Get recent activities (last 10 items)
    const recentDocuments = documents
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const recentFiles = files
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const recentLessons = lessons
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return {
        stats: {
            documents: documents.length,
            files: files.length,
            lessons: lessons.length,
            users: users.length,
        },
        recentDocuments,
        recentFiles,
        recentLessons,
    };
}

export default function IndexDashboard({ loaderData }) {
    const navigate = useNavigate();
    const permissions = usePermissions();
    const user = useUser();
    const { stats, recentDocuments, recentFiles, recentLessons } = loaderData;

    const formatTimeAgo = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString("vi-VN");
    };

    const getRoleBadge = () => {
        if (permissions.isAdmin) return { text: "Quản trị viên", color: "#dc3545" };
        if (permissions.isManager) return { text: "Quản lý", color: "#fd7e14" };
        if (permissions.isTeacher) return { text: "Giáo viên", color: "#0d6efd" };
        return { text: "Học sinh", color: "#6c757d" };
    };

    const roleBadge = getRoleBadge();

    // Count user's own content
    const myDocuments = recentDocuments.filter(d => d.ownerId === user?.id);
    const myFiles = recentFiles.filter(f => f.ownerId === user?.id);
    const myLessons = recentLessons.filter(l => l.ownerId === user?.id);

    return (
        <div className={styles.dashboard}>
            {/* Welcome Section */}
            <div className={styles.welcomeSection}>
                <div className={styles.welcomeContent}>
                    <h1 className={styles.welcomeTitle}>👋 Xin chào, {user?.name || "Người dùng"}!</h1>
                    <p className={styles.welcomeSubtitle}>Chào mừng bạn đến với Hệ thống Quản lý Tài liệu Văn học</p>
                </div>
                <div className={styles.roleBadge} style={{ backgroundColor: roleBadge.color }}>
                    {roleBadge.text}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.statBlue}`}>
                    <div className={styles.statIcon}>
                        <BookOpen size={32} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.documents}</div>
                        <div className={styles.statLabel}>Tài liệu</div>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.statPurple}`}>
                    <div className={styles.statIcon}>
                        <FolderOpen size={32} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.files}</div>
                        <div className={styles.statLabel}>Files</div>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.statGreen}`}>
                    <div className={styles.statIcon}>
                        <FileText size={32} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{stats.lessons}</div>
                        <div className={styles.statLabel}>Bài giảng</div>
                    </div>
                </div>

                {(permissions.isAdmin || permissions.isManager) && (
                    <div className={`${styles.statCard} ${styles.statOrange}`}>
                        <div className={styles.statIcon}>
                            <Users size={32} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{stats.users}</div>
                            <div className={styles.statLabel}>Người dùng</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            {permissions.canCreate && (
                <div className={styles.quickActionsSection}>
                    <h2 className={styles.sectionTitle}>⚡ Hành động nhanh</h2>
                    <div className={styles.quickActionsGrid}>
                        <button
                            className={styles.quickActionCard}
                            onClick={() => navigate("/bang-dieu-khien/thong-tin-suu-tam/tao-moi")}
                        >
                            <Plus size={24} />
                            <span>Tạo tài liệu mới</span>
                        </button>

                        <button
                            className={styles.quickActionCard}
                            onClick={() => navigate("/bang-dieu-khien/suu-tap/video")}
                        >
                            <Upload size={24} />
                            <span>Upload file</span>
                        </button>

                        <button
                            className={styles.quickActionCard}
                            onClick={() => navigate("/bang-dieu-khien/chuong-trinh-hoc/bai-giang/create")}
                        >
                            <Edit size={24} />
                            <span>Tạo bài giảng</span>
                        </button>

                        <button
                            className={styles.quickActionCard}
                            onClick={() => navigate("/bang-dieu-khien/tim-kiem")}
                        >
                            <Search size={24} />
                            <span>Tìm kiếm</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className={styles.contentGrid}>
                {/* Recent Activities */}
                <div className={styles.activitySection}>
                    <h2 className={styles.sectionTitle}>📝 Hoạt động gần đây</h2>

                    {/* Recent Documents */}
                    <div className={styles.activityGroup}>
                        <h3 className={styles.activityGroupTitle}>📚 Tài liệu mới nhất</h3>
                        {recentDocuments.length > 0 ? (
                            <div className={styles.activityList}>
                                {recentDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className={styles.activityItem}
                                        onClick={() => navigate(`/bang-dieu-khien/thong-tin-suu-tam/xem/${doc.id}`)}
                                    >
                                        <div className={styles.activityIcon}>📄</div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>{doc.title}</div>
                                            <div className={styles.activityMeta}>
                                                {doc.ownerName} • {formatTimeAgo(doc.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyState}>Chưa có tài liệu nào</p>
                        )}
                    </div>

                    {/* Recent Files */}
                    <div className={styles.activityGroup}>
                        <h3 className={styles.activityGroupTitle}>📂 Files mới nhất</h3>
                        {recentFiles.length > 0 ? (
                            <div className={styles.activityList}>
                                {recentFiles.map((file) => (
                                    <div key={file.id} className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            {file.type === "video" ? "🎥" : file.type === "audio" ? "🎵" : file.type === "image" ? "🖼️" : "📄"}
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>{file.name || file.filename}</div>
                                            <div className={styles.activityMeta}>
                                                {file.ownerName} • {formatTimeAgo(file.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyState}>Chưa có file nào</p>
                        )}
                    </div>

                    {/* Recent Lessons */}
                    <div className={styles.activityGroup}>
                        <h3 className={styles.activityGroupTitle}>📖 Bài giảng mới nhất</h3>
                        {recentLessons.length > 0 ? (
                            <div className={styles.activityList}>
                                {recentLessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className={styles.activityItem}
                                        onClick={() => navigate(`/bang-dieu-khien/chuong-trinh-hoc/bai-giang/${lesson.classId}`)}
                                    >
                                        <div className={styles.activityIcon}>📖</div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>{lesson.title}</div>
                                            <div className={styles.activityMeta}>
                                                Lớp {lesson.classId} • {formatTimeAgo(lesson.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyState}>Chưa có bài giảng nào</p>
                        )}
                    </div>
                </div>

                {/* My Content Sidebar */}
                {permissions.isTeacher && (
                    <div className={styles.myContentSection}>
                        <h2 className={styles.sectionTitle}>👤 Nội dung của tôi</h2>
                        <div className={styles.myContentCard}>
                            <div className={styles.myContentItem}>
                                <div className={styles.myContentIcon}>📚</div>
                                <div className={styles.myContentInfo}>
                                    <div className={styles.myContentValue}>{myDocuments.length}</div>
                                    <div className={styles.myContentLabel}>Tài liệu</div>
                                </div>
                            </div>

                            <div className={styles.myContentItem}>
                                <div className={styles.myContentIcon}>📂</div>
                                <div className={styles.myContentInfo}>
                                    <div className={styles.myContentValue}>{myFiles.length}</div>
                                    <div className={styles.myContentLabel}>Files</div>
                                </div>
                            </div>

                            <div className={styles.myContentItem}>
                                <div className={styles.myContentIcon}>📖</div>
                                <div className={styles.myContentInfo}>
                                    <div className={styles.myContentValue}>{myLessons.length}</div>
                                    <div className={styles.myContentLabel}>Bài giảng</div>
                                </div>
                            </div>

                            <button className={styles.viewAllButton} onClick={() => navigate("/bang-dieu-khien/tim-kiem")}>
                                Xem tất cả →
                            </button>
                        </div>

                        {/* System Status for Admin */}
                        {permissions.isAdmin && (
                            <div className={styles.systemStatusCard}>
                                <h3 className={styles.systemStatusTitle}>🔧 Trạng thái hệ thống</h3>
                                <div className={styles.systemStatusItem}>
                                    <span>Tổng người dùng:</span>
                                    <strong>{stats.users}</strong>
                                </div>
                                <div className={styles.systemStatusItem}>
                                    <span>Tổng tài liệu:</span>
                                    <strong>{stats.documents}</strong>
                                </div>
                                <div className={styles.systemStatusItem}>
                                    <span>Tổng files:</span>
                                    <strong>{stats.files}</strong>
                                </div>
                                <button
                                    className={styles.manageButton}
                                    onClick={() => navigate("/bang-dieu-khien/admin")}
                                >
                                    Quản lý người dùng →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
