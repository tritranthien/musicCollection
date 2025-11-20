import JSZip from "jszip";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { LessonModel } from "../../.server/lesson.repo";
import styles from "../../globals/styles/lessonList.module.css";
import { useDocumentExport } from "../../hooks/useDownloadDoc";
import { useFileDownload } from "../../hooks/useDownloadFile";
import { useFetcherWithReset } from "../../hooks/useFetcherWithReset";
import { usePermissions } from "../../hooks/usePermissions";

export async function loader({ params }) {
  const { classId } = params;
  const lessonModel = new LessonModel();
  const lessons = await lessonModel.findByClass(Number(classId));
  return { classId, lessons };
}

export default function LessonList({ loaderData }) {
  const { classId, lessons } = loaderData;
  const navigate = useNavigate();
  const fetcher = useFetcherWithReset();
  const { downloadFile, downloading } = useFileDownload();
  const [selectedItem, setSelectedItem] = useState(null); // can be lesson | file | document
  const [selectedType, setSelectedType] = useState(null); // 'lesson' | 'file' | 'document'
  const [expandedLessons, setExpandedLessons] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState({}); // Track expanded sections (documents/files)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [downloadingLesson, setDownloadingLesson] = useState(null);
  const permissions = usePermissions();
  const { downloadPDF, downloadWord, downloadingPdf, downloadingWord } = useDocumentExport();

  const handleLessonClick = (lesson) => {
    setSelectedItem(lesson);
    setSelectedType("lesson");
  };

  // unified click for either file or document (item has _type set when rendering)
  const handleItemClick = (e, item, lesson) => {
    e.stopPropagation();
    const _item = { ...item, parentLesson: lesson, classId };
    setSelectedItem(_item);
    setSelectedType(item._type || (item.content ? "document" : "file"));
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    setSelectedType(null);
  };

  const toggleExpand = (e, lessonId) => {
    e.stopPropagation();
    setExpandedLessons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) newSet.delete(lessonId);
      else newSet.add(lessonId);
      return newSet;
    });
  };

  const isExpanded = (lessonId) => expandedLessons.has(lessonId);

  const toggleSection = (e, lessonId, section) => {
    e.stopPropagation();
    setExpandedSections(prev => ({
      ...prev,
      [`${lessonId}-${section}`]: !prev[`${lessonId}-${section}`]
    }));
  };

  const isSectionExpanded = (lessonId, section) => {
    return expandedSections[`${lessonId}-${section}`] !== false; // default true
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileExtension = (filename) => {
    if (!filename) return "";
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
  };

  const isMediaFile = (type) => {
    return type === "video" || type === "audio" || type === "image";
  };

  const getFileTypeLabel = (type) => {
    const labels = {
      video: "Video",
      audio: "Audio",
      image: "Hình ảnh",
      raw: "Tài liệu",
    };
    return labels[type] || "Không xác định";
  };

  const getFileIcon = (type) => {
    const icons = {
      video: "🎥",
      audio: "🎵",
      image: "🖼️",
      raw: "📄",
    };
    return icons[type] || "📄";
  };

  // single file download via hook
  const handleDownloadFile = () => {
    if (selectedItem && (selectedItem.url || selectedItem.downloadUrl)) {
      downloadFile(selectedItem);
    } else {
      toast.error("Không có file để tải");
    }
  };

  const handleViewFile = () => {
    if (selectedItem && selectedItem.url) {
      window.open(selectedItem.url, "_blank");
    } else {
      toast.error("Không có file để xem");
    }
  };

  const handleEditLesson = (e, lessonId) => {
    e.stopPropagation();
    navigate(`/bang-dieu-khien/chuong-trinh-hoc/bai-giang/edit/${lessonId}`);
  };

  const handleDeleteClick = (e, lesson) => {
    e.stopPropagation();
    setLessonToDelete(lesson);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setLessonToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!lessonToDelete) return;
    const formData = new FormData();
    formData.append("lessonId", lessonToDelete.id);
    formData.append("intent", "delete");
    fetcher.submit(formData, {
      action: "/api/lesson",
      method: "post",
    });
  };

  // download all files of lesson as zip
  // Sửa lại hàm handleDownloadLessonFiles
  const handleDownloadLessonFiles = async (e, lesson) => {
    e.stopPropagation();

    const files = lesson.files || [];
    const documents = lesson.documents || [];

    // Kiểm tra xem có gì để tải không
    if (files.length === 0 && documents.length === 0) {
      toast.error("Bài giảng này không có file hoặc tài liệu nào để tải");
      return;
    }

    setDownloadingLesson(lesson.id);
    const toastId = toast.loading("Đang chuẩn bị tải xuống...");

    try {
      const zip = new JSZip();
      let successCount = 0;
      let failCount = 0;

      // 📂 PHẦN 1: Download tất cả FILES
      const filePromises = files.map(async (file, index) => {
        try {
          const url = file.downloadUrl || file.url;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${file.name || file.filename}`);
          const blob = await response.blob();

          let finalFilename = file.filename || file.name;
          if (!finalFilename) {
            const extension = blob.type ? blob.type.split("/")[1] : "bin";
            finalFilename = `file_${index + 1}.${extension}`;
          }

          // Tạo unique filename
          let uniqueFilename = finalFilename;
          let counter = 1;
          while (zip.file(uniqueFilename)) {
            const parts = finalFilename.split(".");
            if (parts.length > 1) {
              const ext = parts.pop();
              const nameWithoutExt = parts.join(".");
              uniqueFilename = `${nameWithoutExt}_${counter}.${ext}`;
            } else {
              uniqueFilename = `${finalFilename}_${counter}`;
            }
            counter++;
          }

          zip.file(uniqueFilename, blob);
          successCount++;
          return true;
        } catch (error) {
          console.error(`Error downloading file ${file.name || file.filename}:`, error);
          failCount++;
          return false;
        }
      });

      // 📄 PHẦN 2: Download tất cả DOCUMENTS (convert sang Word)
      const documentPromises = documents.map(async (doc, index) => {
        try {
          // Gọi API để export Word
          const response = await fetch(`/api/document/word/${doc.id}`);

          if (!response.ok) {
            throw new Error(`Failed to export document ${doc.title}`);
          }

          const blob = await response.blob();

          // Tạo filename từ title của document
          let filename = doc.title || `document_${index + 1}`;
          // Loại bỏ ký tự đặc biệt
          filename = filename.replace(/[^a-z0-9_\-\s]/gi, "_");
          filename = `${filename}.docx`;

          // Tạo unique filename
          let uniqueFilename = filename;
          let counter = 1;
          while (zip.file(uniqueFilename)) {
            const nameWithoutExt = filename.replace('.docx', '');
            uniqueFilename = `${nameWithoutExt}_${counter}.docx`;
            counter++;
          }

          zip.file(uniqueFilename, blob);
          successCount++;
          return true;
        } catch (error) {
          console.error(`Error exporting document ${doc.title}:`, error);
          failCount++;
          return false;
        }
      });

      // Chạy tất cả promises song song
      await Promise.all([...filePromises, ...documentPromises]);

      if (successCount === 0) {
        throw new Error("Không thể tải xuống bất kỳ file hoặc tài liệu nào");
      }

      toast.loading(`Đang nén ${successCount} files...`, { id: toastId });

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const blobUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = `${lesson.title.replace(/[^a-z0-9]/gi, "_")}_files.zip`;

      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      const totalItems = files.length + documents.length;
      const message = failCount > 0
        ? `Đã tải xuống ${successCount}/${totalItems} items (${files.length} files + ${documents.length} tài liệu)`
        : `Đã tải xuống ${successCount} items thành công`;

      toast.success(message, { id: toastId });

    } catch (error) {
      console.error("Error creating ZIP:", error);
      toast.error("Có lỗi xảy ra khi tải xuống", { id: toastId });
    } finally {
      setDownloadingLesson(null);
    }
  };

  useEffect(() => {
    if (fetcher.data) {
      setShowDeleteModal(false);
      setLessonToDelete(null);
      toast.success("Đã xoá bài giảng");
      fetcher.reset();
    }
  }, [fetcher.data]);

  // View full content for document
  const handleViewContent = () => {
    if (!selectedItem) return;
    if (selectedType === "document") {
      // open a simple modal or navigate to document page; we'll navigate to a viewer route
      navigate(`/bang-dieu-khien/thong-tin-suu-tam/xem/${selectedItem.id}`);
    } else {
      toast.error("Chỉ dành cho tài liệu");
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Panel bên trái - Danh sách */}
      <div className={styles.leftPanel}>
        <div className={styles.header}>
          <h1 className={styles.title}>📚 Danh sách bài giảng – Lớp {classId}</h1>
          {permissions.canCreate && (
            <button
              className={styles.addBtn}
              onClick={() => navigate(`/bang-dieu-khien/chuong-trinh-hoc/bai-giang/create/${classId}`)}
            >
              ➕ Thêm bài giảng
            </button>
          )}
        </div>

        {lessons && lessons.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên bài giảng</th>
                  <th>Người tạo</th>
                  <th className={styles.actionCell}></th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => {
                  // prepare counts safely
                  const files = Array.isArray(lesson.files) ? lesson.files : [];
                  const documents = Array.isArray(lesson.documents) ? lesson.documents : [];

                  return (
                    <React.Fragment key={lesson.id}>
                      {/* Lesson row */}
                      <tr
                        className={`${styles.lessonRow} ${selectedType === "lesson" && selectedItem?.id === lesson.id ? styles.selected : ""
                          }`}
                        onClick={(e) => {
                          // Don't expand if clicking on action buttons
                          if (e.target.closest(`.${styles.lessonActions}`)) return;
                          toggleExpand(e, lesson.id);
                          handleLessonClick(lesson);
                        }}
                      >
                        <td>
                          <div className={styles.lessonTitleCell}>
                            <span
                              className={`${styles.expandIcon} ${isExpanded(lesson.id) ? styles.expanded : ""}`}
                              onClick={(e) => toggleExpand(e, lesson.id)}
                            >
                              ▶
                            </span>
                            {lesson.title}
                          </div>
                        </td>
                        <td>{lesson.owner?.name || "—"}</td>
                        <td className={styles.actionCell}>
                          <div className={styles.lessonActions}>
                            <button
                              className={`${styles.actionIcon} ${styles.downloadIcon}`}
                              onClick={(e) => handleDownloadLessonFiles(e, lesson)}
                              title="Tải xuống tất cả files"
                              disabled={downloadingLesson === lesson.id || !files || files.length === 0}
                            >
                              {downloadingLesson === lesson.id ? "⏳" : "📦"}
                            </button>
                            {(permissions.isAdmin || permissions.isManager || (permissions.isTeacher && lesson.ownerId === permissions.userId)) && (
                              <>
                                <button
                                  className={`${styles.actionIcon} ${styles.editIcon}`}
                                  onClick={(e) => handleEditLesson(e, lesson.id)}
                                  title="Chỉnh sửa"
                                >
                                  ✏️
                                </button>
                                <button
                                  className={`${styles.actionIcon} ${styles.deleteIcon}`}
                                  onClick={(e) => handleDeleteClick(e, lesson)}
                                  title="Xóa"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded content: show Documents section then Files section */}
                      {isExpanded(lesson.id) && (
                        <>
                          {/* Documents section */}
                          <tr className={styles.sectionLabelRow}>
                            <td
                              colSpan="3"
                              className={styles.sectionLabel}
                              onClick={(e) => toggleSection(e, lesson.id, 'documents')}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              <span className={`${styles.expandIcon} ${isSectionExpanded(lesson.id, 'documents') ? styles.expanded : ""}`}>
                                ▶
                              </span>
                              📄 Tài liệu ({documents.length})
                            </td>
                          </tr>

                          {isSectionExpanded(lesson.id, 'documents') && (documents && documents.length > 0 ? (
                            documents.map((doc, idx) => (
                              <tr
                                key={`${lesson.id}-doc-${doc.id || idx}`}
                                className={`${styles.fileRow} ${selectedType === "document" && selectedItem?.id === doc.id ? styles.selected : ""
                                  }`}
                                onClick={(e) => handleItemClick(e, { ...doc, _type: "document" }, lesson)}
                              >
                                <td>📄 {doc.title}</td>
                                <td>{doc.ownerName || doc.owner?.name || "—"}</td>
                                <td></td>
                              </tr>
                            ))
                          ) : (
                            <tr className={styles.fileRow}>
                              <td colSpan="3" className={styles.noFiles}>
                                Không có tài liệu
                              </td>
                            </tr>
                          ))}

                          {/* Files section */}
                          <tr className={styles.sectionLabelRow}>
                            <td
                              colSpan="3"
                              className={styles.sectionLabel}
                              onClick={(e) => toggleSection(e, lesson.id, 'files')}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              <span className={`${styles.expandIcon} ${isSectionExpanded(lesson.id, 'files') ? styles.expanded : ""}`}>
                                ▶
                              </span>
                              📂 Files đính kèm ({files.length})
                            </td>
                          </tr>

                          {isSectionExpanded(lesson.id, 'files') && (files && files.length > 0 ? (
                            files.map((file, idx) => (
                              <tr
                                key={`${lesson.id}-file-${file.id || idx}`}
                                className={`${styles.fileRow} ${selectedType === "file" && selectedItem?.id === file.id ? styles.selected : ""
                                  }`}
                                onClick={(e) => handleItemClick(e, { ...file, _type: "file" }, lesson)}
                              >
                                <td>
                                  {getFileIcon(file.type)} {file.name || file.title || file.filename}
                                </td>
                                <td>{formatFileSize(file.size)}</td>
                                <td></td>
                              </tr>
                            ))
                          ) : (
                            <tr className={styles.fileRow}>
                              <td colSpan="3" className={styles.noFiles}>
                                Không có file nào
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Không có bài giảng nào</p>
        )}
      </div>

      {/* Panel bên phải - Chi tiết */}
      <div className={`${styles.rightPanel} ${!selectedItem ? styles.hidden : ""}`}>
        {selectedItem ? (
          <>
            {selectedType === "lesson" && (
              // Lesson detail
              <>
                <div className={styles.detailHeader}>
                  <div>
                    <span className={styles.detailType}>Bài giảng</span>
                    <h2 className={styles.detailTitle}>Chi tiết bài giảng</h2>
                  </div>
                  <button className={styles.closeBtn} onClick={handleCloseDetail}>
                    ×
                  </button>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Tên bài giảng</div>
                  <div className={styles.detailValue}>{selectedItem.title}</div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Người tạo</div>
                  <div className={styles.detailValue}>{selectedItem.owner?.name || "—"}</div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>ID</div>
                  <div className={styles.detailValue}>{selectedItem.id}</div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Files</div>
                  <div className={styles.detailValue}>
                    {Array.isArray(selectedItem.files) && selectedItem.files.length > 0 ? (
                      selectedItem.files.map((f, i) => (
                        <div key={f.id || i} style={{ marginBottom: 8 }}>
                          {getFileIcon(f.type)} {f.name || f.title || f.filename}
                        </div>
                      ))
                    ) : (
                      <div>—</div>
                    )}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Tài liệu</div>
                  <div className={styles.detailValue}>
                    {Array.isArray(selectedItem.documents) && selectedItem.documents.length > 0 ? (
                      selectedItem.documents.map((d, i) => (
                        <div key={d.id || i} style={{ marginBottom: 8 }}>
                          📄 {d.title}
                        </div>
                      ))
                    ) : (
                      <div>—</div>
                    )}
                  </div>
                </div>

                {selectedItem.description && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Mô tả</div>
                    <div className={styles.detailValue}>{selectedItem.description}</div>
                  </div>
                )}

                <div className={styles.detailActionsMenu}>
                  <button
                    className={`${styles.actionBtn} ${styles.downloadBtn}`}
                    onClick={(e) => handleDownloadLessonFiles(e, selectedItem)}
                    disabled={
                      downloadingLesson === selectedItem.id || !selectedItem.files || selectedItem.files.length === 0
                    }
                  >
                    {downloadingLesson === selectedItem.id ? "⏳ Đang tải..." : "📦 Tải xuống tất cả files (ZIP)"}
                  </button>
                  {(permissions.isAdmin || permissions.isManager || (permissions.isTeacher && selectedItem.ownerId === permissions.userId)) && (
                    <>
                      <button
                        className={`${styles.actionBtn} ${styles.editDetailButton}`}
                        onClick={() => navigate(`/bang-dieu-khien/chuong-trinh-hoc/bai-giang/edit/${selectedItem.id}`)}
                      >
                        ✏️ Chỉnh sửa bài giảng
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteDetailButton}`}
                        onClick={(e) => handleDeleteClick(e, selectedItem)}
                      >
                        🗑️ Xóa bài giảng
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {selectedType === "file" && (
              // File detail
              <>
                <div className={styles.detailHeader}>
                  <div>
                    <span className={`${styles.detailType} ${styles.fileType}`}>
                      {getFileIcon(selectedItem.type)} {getFileTypeLabel(selectedItem.type)}
                    </span>
                    <h2 className={styles.detailTitle}>Chi tiết file</h2>
                  </div>
                  <button className={styles.closeBtn} onClick={handleCloseDetail}>
                    ×
                  </button>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Tên file</div>
                  <div className={styles.detailValue}>{selectedItem.name || selectedItem.title || selectedItem.filename}</div>
                </div>

                {selectedItem.title && selectedItem.title !== selectedItem.name && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Tiêu đề</div>
                    <div className={styles.detailValue}>{selectedItem.title}</div>
                  </div>
                )}

                {selectedItem.description && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Mô tả</div>
                    <div className={styles.detailValue}>{selectedItem.description}</div>
                  </div>
                )}

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Thuộc bài giảng</div>
                  <div className={styles.detailValue}>{selectedItem.parentLesson?.title}</div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Lớp</div>
                  <div className={styles.detailValue}>Lớp {selectedItem.classId}</div>
                </div>

                <div className={styles.metadataGrid}>
                  <div className={styles.metadataItem}>
                    <div className={styles.metadataLabel}>Loại file</div>
                    <div className={styles.metadataValue}>{getFileTypeLabel(selectedItem.type)}</div>
                  </div>

                  <div className={styles.metadataItem}>
                    <div className={styles.metadataLabel}>Kích thước</div>
                    <div className={styles.metadataValue}>{formatFileSize(selectedItem.size)}</div>
                  </div>

                  <div className={styles.metadataItem}>
                    <div className={styles.metadataLabel}>Định dạng</div>
                    <div className={styles.metadataValue}>{getFileExtension(selectedItem.name || selectedItem.filename) || "N/A"}</div>
                  </div>

                  {selectedItem.duration && (selectedItem.type === "video" || selectedItem.type === "audio") && (
                    <div className={styles.metadataItem}>
                      <div className={styles.metadataLabel}>Thời lượng</div>
                      <div className={styles.metadataValue}>{selectedItem.duration}</div>
                    </div>
                  )}
                </div>

                {selectedItem.url && isMediaFile(selectedItem.type) && (
                  <div className={styles.filePreview}>
                    <div className={styles.detailLabel}>Xem trước</div>
                    {selectedItem.type === "image" && <img src={selectedItem.url} alt={selectedItem.name} />}
                    {selectedItem.type === "video" && <video controls src={selectedItem.url}>Trình duyệt không hỗ trợ video</video>}
                    {selectedItem.type === "audio" && <audio controls src={selectedItem.url}>Trình duyệt không hỗ trợ audio</audio>}
                  </div>
                )}

                {selectedItem.url && (
                  <div className={styles.detailActions}>
                    {isMediaFile(selectedItem.type) && (
                      <button className={`${styles.actionBtn} ${styles.viewBtn}`} onClick={handleViewFile}>
                        👁️ Xem file
                      </button>
                    )}
                    <button
                      className={`${styles.actionBtn} ${styles.downloadBtn}`}
                      onClick={handleDownloadFile}
                      disabled={downloading === selectedItem.id}
                      style={!isMediaFile(selectedItem.type) ? { flex: 1 } : {}}
                    >
                      {downloading === selectedItem.id ? "⏳ Đang tải..." : "⬇️ Tải xuống"}
                    </button>
                  </div>
                )}
              </>
            )}

            {selectedType === "document" && (
              // Document detail
              <>
                <div className={styles.detailHeader}>
                  <div>
                    <span className={styles.detailType}>📄 Tài liệu</span>
                    <h2 className={styles.detailTitle}>{selectedItem.title}</h2>
                  </div>
                  <button className={styles.closeBtn} onClick={handleCloseDetail}>
                    ×
                  </button>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Tiêu đề</div>
                  <div className={styles.detailValue}>{selectedItem.title}</div>
                </div>

                {selectedItem.description && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Mô tả</div>
                    <div className={styles.detailValue}>{selectedItem.description}</div>
                  </div>
                )}

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Người tạo</div>
                  <div className={styles.detailValue}>{selectedItem.ownerName || selectedItem.owner?.name || "—"}</div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>Ngày tạo</div>
                  <div className={styles.detailValue}>
                    {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString("vi-VN") : "—"}
                  </div>
                </div>

                <div className={styles.detailActionsMenu}>
                  <button
                    className={`${styles.actionBtn} ${styles.downloadBtn}`}
                    onClick={() => downloadPDF(selectedItem.id)}
                    disabled={downloadingPdf === selectedItem.id}
                  >
                    {downloadingPdf === selectedItem.id ? "🔄 Đang tải..." : "📕 Tải về PDF"}
                  </button>

                  <button
                    className={`${styles.actionBtn} ${styles.downloadBtn}`}
                    onClick={() => downloadWord(selectedItem.id)}
                    disabled={downloadingWord === selectedItem.id}
                  >
                    {downloadingWord === selectedItem.id ? "🔄 Đang tải..." : "📄 Tải về Word"}
                  </button>
                  {(permissions.isAdmin || permissions.isManager || (permissions.isTeacher && selectedItem.ownerId === permissions.userId)) && (
                    <>
                      <button
                        className={`${styles.actionBtn} ${styles.editDetailButton}`}
                        onClick={() => navigate(`/bang-dieu-khien/thong-tin-suu-tam/chinh-sua/${selectedItem.id}`)}
                      >
                        ✏️ Chỉnh sửa tài liệu
                      </button>

                    </>
                  )}
                  <button className={`${styles.actionBtn} ${styles.editDetailButton}`} onClick={handleViewContent}>
                    👁️ Xem toàn bộ nội dung
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>Chọn một bài giảng hoặc file để xem chi tiết</div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && lessonToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteModalHeader}>
              <span className={styles.deleteModalIcon}>⚠️</span>
              <h3 className={styles.deleteModalTitle}>Xác nhận xóa bài giảng</h3>
            </div>

            <p className={styles.deleteModalMessage}>Bạn có chắc chắn muốn xóa bài giảng này không?</p>

            <div className={styles.deleteModalLessonName}>{lessonToDelete.title}</div>

            <div className={styles.deleteModalWarning}>
              ⚠️ Hành động này không thể hoàn tác. Tất cả các file và dữ liệu liên quan sẽ bị xóa vĩnh viễn.
            </div>

            <div className={styles.deleteModalActions}>
              <button className={styles.cancelButton} onClick={handleCancelDelete} disabled={fetcher.state === "submitting"}>
                Hủy
              </button>
              <button className={styles.confirmDeleteButton} onClick={handleConfirmDelete} disabled={fetcher.state === "submitting"}>
                {fetcher.state === "submitting" ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
