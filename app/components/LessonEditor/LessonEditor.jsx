import { useEffect, useState } from "react";
import FilePicker from "../filePicker/FilePicker";
import styles from "../../globals/styles/createLesson.module.css";
import { getFilePreview } from "../../helper/uiHelper";
import { useFetcherWithReset } from "../../hooks/useFetcherWithReset";

export default function LessonEditor({
    classId = null,
    lesson = null,
    lessonId = null,
}) {
    const [title, setTitle] = useState(lesson?.title || "");
    const [description, setDescription] = useState(lesson?.description || "");
    const [selectedFiles, setSelectedFiles] = useState(lesson?.files || []);
    const [selectedFileDetail, setSelectedFileDetail] = useState(null);
    const [error, setError] = useState(null);

    const fetcher = useFetcherWithReset();
    const isSubmitting = fetcher.state === "submitting";

    const handleItemClick = (file, index) => {
        setSelectedFileDetail({ file, index });
    };

    const handleRemoveFile = (indexToRemove) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        if (selectedFileDetail?.index === indexToRemove) {
            setSelectedFileDetail(null);
        } else if (selectedFileDetail?.index > indexToRemove) {
            setSelectedFileDetail(prev => ({
                ...prev,
                index: prev.index - 1
            }));
        }
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert("Vui lòng nhập tên bài giảng");
            return;
        }
        setError(null);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        let existClassId = classId;
        if (lesson?.classId) {
            existClassId = lesson.classId;
        }
        if (existClassId) formData.append("classId", existClassId);

        if (lessonId) {
            formData.append("intent", "update");
            formData.append("lessonId", lessonId);
        } else {
            formData.append("intent", "create");
        }

        if (selectedFiles.length > 0) {
            const fileIds = selectedFiles.map(f => f.id);
            formData.append("files", JSON.stringify(fileIds));
        }
        let redirectUrl;
        if (classId || lesson?.classId) {
            redirectUrl = `/bang-dieu-khien/chuong-trinh-hoc/bai-giang/${classId || lesson?.classId}`;
        } else {
            redirectUrl = null;
        }
        if (redirectUrl) {
            formData.append("redirectUrl", redirectUrl);
        }
        fetcher.submit(formData, {
            method: "post",
            action: "/api/lesson",
        });
    };

    useEffect(() => {
        if (fetcher.data?.success) {
            // toast.success(fetcher.data.message);
            // navigate("/dashboard/lessons");
        }

        if (fetcher.data?.error) {
            setError(fetcher.data.error);
        }
        fetcher.reset();
    }, [fetcher.data]);

    return (
        <div className={styles.pageWrapper}>
            {/* HEADER FIXED */}
            <div className={styles.fixedHeader}>
                <h1 className={styles.title}>
                    {lessonId ? "Chỉnh sửa bài giảng" : "Tạo bài giảng mới"}
                </h1>
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Đang lưu..." : "💾 Lưu bài giảng"}
                </button>
            </div>

            {/* CONTENT */}
            <div className={styles.contentWrapper}>
                {/* Hiển thị thông báo */}
                {fetcher.data?.success && (
                    <div className={styles.successMessage}>
                        ✅ {fetcher.data.message}
                    </div>
                )}
                {error && (
                    <div className={styles.errorMessage}>
                        ❌ {error}
                    </div>
                )}

                <label className={styles.label}>Tên bài giảng</label>
                <input
                    type="text"
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tên bài giảng"
                />

                <label className={styles.label}>Mô tả</label>
                <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả cho bài giảng..."
                    rows={5}
                />

                <FilePicker
                    selectedFiles={selectedFiles}
                    onSelectFiles={setSelectedFiles}
                    multiple={true}
                />

                {/* Hiển thị danh sách file đã chọn */}
                {selectedFiles.length > 0 && (
                    <div className={styles.fileListContainer}>
                        <h3 className={styles.fileListTitle}>
                            Danh sách file đã chọn ({selectedFiles.length})
                        </h3>
                        <div className={styles.fileContentWrapper}>
                            {/* Phần danh sách file bên trái */}
                            <div className={styles.fileList}>
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={`file-${index}-${file.name}`}
                                        className={`${styles.fileItem} ${selectedFileDetail?.index === index ? styles.fileItemActive : ''}`}
                                        onClick={() => handleItemClick(file, index)}
                                    >
                                        <div className={styles.filePreview}>
                                            {getFilePreview(file)}
                                        </div>
                                        <div className={styles.fileInfo}>
                                            <p className={styles.fileName}>{file.name}</p>
                                            <div className={styles.fileMetadata}>
                                                {file.ownerName && (
                                                    <span className={styles.metadataItem}>
                                                        <span className={styles.metadataIcon}>👤</span>
                                                        {file.ownerName}
                                                    </span>
                                                )}
                                                {file.category && (
                                                    <span className={styles.metadataItem}>
                                                        <span className={styles.metadataIcon}>📁</span>
                                                        {file.category}
                                                    </span>
                                                )}
                                                {file.classes && file.classes.length > 0 && (
                                                    <span className={styles.metadataItem}>
                                                        <span className={styles.metadataIcon}>🏫</span>
                                                        {file.classes.join(", ")}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={styles.fileSize}>
                                                {(file.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                        <button
                                            className={styles.removeButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile(index);
                                            }}
                                            aria-label="Xóa file"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Phần chi tiết file bên phải */}
                            <div className={styles.fileDetailPanel}>
                                {selectedFileDetail ? (
                                    <>
                                        <div className={styles.detailHeader}>
                                            <h4>Chi tiết file</h4>
                                            <button
                                                className={styles.closeDetailButton}
                                                onClick={() => setSelectedFileDetail(null)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className={styles.detailPreview}>
                                            {getFilePreview(selectedFileDetail.file)}
                                        </div>
                                        <div className={styles.detailInfo}>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Tên file:</span>
                                                <span className={styles.detailValue}>{selectedFileDetail.file.name}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Kích thước:</span>
                                                <span className={styles.detailValue}>
                                                    {(selectedFileDetail.file.size / 1024).toFixed(2)} KB
                                                </span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Loại:</span>
                                                <span className={styles.detailValue}>
                                                    {selectedFileDetail.file.type || 'Unknown'}
                                                </span>
                                            </div>
                                            {selectedFileDetail.file.ownerName && (
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>👤 Người sở hữu:</span>
                                                    <span className={styles.detailValue}>
                                                        {selectedFileDetail.file.ownerName}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedFileDetail.file.category && (
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>📁 Danh mục:</span>
                                                    <span className={styles.detailValue}>
                                                        {selectedFileDetail.file.category}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedFileDetail.file.classes && selectedFileDetail.file.classes.length > 0 && (
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>🏫 Lớp:</span>
                                                    <div className={styles.classesContainer}>
                                                        {selectedFileDetail.file.classes.map((cls, idx) => (
                                                            <span key={idx} className={styles.classTag}>{cls}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className={styles.removeDetailButton}
                                            onClick={() => {
                                                handleRemoveFile(selectedFileDetail.index);
                                            }}
                                        >
                                            🗑️ Xóa file này
                                        </button>
                                    </>
                                ) : (
                                    <div className={styles.emptyDetail}>
                                        <p>Chọn một file để xem chi tiết</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
