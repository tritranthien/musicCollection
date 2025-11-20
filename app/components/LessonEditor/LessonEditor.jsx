import { useEffect, useState } from "react";
import styles from "../../globals/styles/createLesson.module.css";
import { getFilePreview } from "../../helper/uiHelper";
import { useFetcherWithReset } from "../../hooks/useFetcherWithReset";
import DocumentPicker from "../DocumentPicker/DocumentPicker";
import FilePicker from "../filePicker/FilePicker";
import { useDocumentExport } from "../../hooks/useDownloadDoc";

export default function LessonEditor({
    classId = null,
    lesson = null,
    lessonId = null,
}) {
    const [title, setTitle] = useState(lesson?.title || "");
    const [description, setDescription] = useState(lesson?.description || "");
    const [selectedFiles, setSelectedFiles] = useState(lesson?.files || []);
    const [selectedFileDetail, setSelectedFileDetail] = useState(null);
    const [selectedDocuments, setSelectedDocuments] = useState(lesson?.documents || []);
    const [selectedDocumentDetail, setSelectedDocumentDetail] = useState(null);
    const { downloadPDF, downloadWord, downloadingPdf, downloadingWord } = useDocumentExport();
    const [error, setError] = useState(null);

    const fetcher = useFetcherWithReset();
    const isSubmitting = fetcher.state === "submitting";

    const handleItemClick = (file, index) => {
        setSelectedFileDetail({ file, index });
    };

    const handleDocumentClick = (document, index) => {
        setSelectedDocumentDetail({ document, index });
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

    const handleRemoveDocument = (indexToRemove) => {
        setSelectedDocuments(prev => prev.filter((_, index) => index !== indexToRemove));
        if (selectedDocumentDetail?.index === indexToRemove) {
            setSelectedDocumentDetail(null);
        } else if (selectedDocumentDetail?.index > indexToRemove) {
            setSelectedDocumentDetail(prev => ({
                ...prev,
                index: prev.index - 1
            }));
        }
    };

    const getDocumentIcon = (type) => {
        const icons = {
            'author': '✍️',
            'work': '📖',
            'genre': '🎭',
            'period': '📅',
            'movement': '🌊',
            'theory': '💡'
        };
        return icons[type] || '📄';
    };

    const getDocumentTypeLabel = (type) => {
        const labels = {
            'author': 'Tác giả',
            'work': 'Tác phẩm',
            'genre': 'Thể loại',
            'period': 'Thời kỳ',
            'movement': 'Trào lưu',
            'theory': 'Lý thuyết'
        };
        return labels[type] || 'Tài liệu';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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

        const fileIds = selectedFiles.map(f => f.id);
        formData.append("files", JSON.stringify(fileIds));

        const documentIds = selectedDocuments.map(d => d.id);
        formData.append("documents", JSON.stringify(documentIds));

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

                <DocumentPicker
                    selectedDocuments={selectedDocuments}
                    onSelectDocuments={setSelectedDocuments}
                    multiple={true}
                />

                {/* Hiển thị danh sách document đã chọn */}
                {selectedDocuments.length > 0 && (
                    <div className={styles.fileListContainer}>
                        <h3 className={styles.fileListTitle}>
                            Danh sách tài liệu đã chọn ({selectedDocuments.length})
                        </h3>
                        <div className={styles.fileContentWrapper}>
                            {/* Phần danh sách document bên trái */}
                            <div className={styles.fileList}>
                                {selectedDocuments.map((document, index) => (
                                    <div
                                        key={`doc-${index}-${document.id}`}
                                        className={`${styles.fileItem} ${selectedDocumentDetail?.index === index ? styles.fileItemActive : ''}`}
                                        onClick={() => handleDocumentClick(document, index)}
                                    >
                                        <div className={styles.filePreview}>
                                            <span style={{ fontSize: '32px' }}>
                                                {getDocumentIcon(document.type)}
                                            </span>
                                        </div>
                                        <div className={styles.fileInfo}>
                                            <p className={styles.fileName}>{document.title}</p>
                                            <div className={styles.fileMetadata}>
                                                <span className={styles.metadataItem}>
                                                    <span className={styles.metadataIcon}>📚</span>
                                                    {getDocumentTypeLabel(document.type)}
                                                </span>
                                                {document.ownerName && (
                                                    <span className={styles.metadataItem}>
                                                        <span className={styles.metadataIcon}>👤</span>
                                                        {document.ownerName}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={styles.fileSize}>
                                                {formatDate(document.createdAt)}
                                            </p>
                                        </div>
                                        <button
                                            className={styles.removeButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveDocument(index);
                                            }}
                                            aria-label="Xóa tài liệu"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Phần chi tiết document bên phải */}
                            <div className={styles.fileDetailPanel}>
                                {selectedDocumentDetail ? (
                                    <>
                                        <div className={styles.detailHeader}>
                                            <h4>Chi tiết tài liệu</h4>
                                            <button
                                                className={styles.closeDetailButton}
                                                onClick={() => setSelectedDocumentDetail(null)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className={styles.detailPreview}>
                                            <span style={{ fontSize: '64px' }}>
                                                {getDocumentIcon(selectedDocumentDetail.document.type)}
                                            </span>
                                        </div>
                                        <div className={styles.detailInfo}>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Tiêu đề:</span>
                                                <span className={styles.detailValue}>{selectedDocumentDetail.document.title}</span>
                                            </div>
                                            {selectedDocumentDetail.document.description && (
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>Mô tả:</span>
                                                    <span className={styles.detailValue}>
                                                        {selectedDocumentDetail.document.description}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Loại tài liệu:</span>
                                                <span className={styles.detailValue}>
                                                    {getDocumentIcon(selectedDocumentDetail.document.type)} {getDocumentTypeLabel(selectedDocumentDetail.document.type)}
                                                </span>
                                            </div>
                                            {selectedDocumentDetail.document.ownerName && (
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>👤 Người tạo:</span>
                                                    <span className={styles.detailValue}>
                                                        {selectedDocumentDetail.document.ownerName}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>📅 Ngày tạo:</span>
                                                <span className={styles.detailValue}>
                                                    {formatDate(selectedDocumentDetail.document.createdAt)}
                                                </span>
                                            </div>
                                            {selectedDocumentDetail.document.updatedAt && (
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>🔄 Cập nhật:</span>
                                                    <span className={styles.detailValue}>
                                                        {formatDate(selectedDocumentDetail.document.updatedAt)}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedDocumentDetail.document.classes && selectedDocumentDetail.document.classes.length > 0 && (
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>🏫 Lớp áp dụng:</span>
                                                    <div className={styles.classesContainer}>
                                                        {selectedDocumentDetail.document.classes.map((cls, idx) => (
                                                            <span key={idx} className={styles.classTag}>Lớp {cls}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedDocumentDetail.document.tags && selectedDocumentDetail.document.tags.length > 0 && (
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>🏷️ Tags:</span>
                                                    <div className={styles.classesContainer}>
                                                        {selectedDocumentDetail.document.tags.map((tag, idx) => (
                                                            <span key={idx} className={styles.classTag}>{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedDocumentDetail.document.content && (
                                                <div className={styles.detailRow} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                                    <span className={styles.detailLabel}>📄 Nội dung xem trước:</span>
                                                    <div
                                                        className={styles.detailValue}
                                                        style={{
                                                            maxHeight: '150px',
                                                            overflow: 'auto',
                                                            padding: '8px',
                                                            background: '#f8f9fa',
                                                            borderRadius: '4px',
                                                            width: '100%',
                                                            fontSize: '13px',
                                                            lineHeight: '1.5'
                                                        }}
                                                        dangerouslySetInnerHTML={{
                                                            __html: selectedDocumentDetail.document.content.substring(0, 300) + '...'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.actionBtnContainer}>
                                            <button
                                                className={`${styles.detailActionBtn} ${styles.editDetailButton}`}
                                                onClick={() => downloadPDF(selectedDocumentDetail.document.id)}
                                                disabled={downloadingPdf === selectedDocumentDetail.document.id}
                                            >
                                                {downloadingPdf === selectedDocumentDetail.document.id ? ' 🔄 Đang tải...' : ' 📕 Tải về PDF'}
                                            </button>
                                            <button
                                                className={`${styles.detailActionBtn} ${styles.editDetailButton}`}
                                                onClick={() => downloadWord(selectedDocumentDetail.document.id)}
                                                disabled={downloadingWord === selectedDocumentDetail.document.id}
                                            >
                                                {downloadingWord === selectedDocumentDetail.document.id ? ' 🔄 Đang tải...' : ' 📄 Tải về Word'}
                                            </button>
                                            <button
                                                className={`${styles.detailActionBtn} ${styles.editDetailButton}`}
                                                onClick={() => {
                                                    window.open(
                                                        `/bang-dieu-khien/thong-tin-suu-tam/xem/${selectedDocumentDetail.document.id}`,
                                                        "_blank"
                                                    );
                                                }}
                                            >
                                                👁️ Xem toàn bộ nội dung
                                            </button>
                                            <button
                                                className={styles.removeDetailButton}
                                                onClick={() => {
                                                    handleRemoveDocument(selectedDocumentDetail.index);
                                                }}
                                            >
                                                🗑️ Xóa tài liệu này
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.emptyDetail}>
                                        <p>Chọn một tài liệu để xem chi tiết</p>
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