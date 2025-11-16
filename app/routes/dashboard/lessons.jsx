import React, { useState } from "react";
import styles from "../../globals/styles/lessonList.module.css";
import { useNavigate } from "react-router";
import { LessonModel } from "../../.server/lesson.repo";

export async function loader({ params }) {
  const { classId } = params;
  const lessonModel = new LessonModel();
  const lessons = await lessonModel.findByClass(Number(classId));
  return { classId, lessons };
}

export default function LessonList({ loaderData }) {
  const { classId, lessons } = loaderData;
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLessonClick = (lesson) => {
    setSelectedItem(lesson);
    setSelectedType('lesson');
  };

  const handleFileClick = (e, file, lesson) => {
    e.stopPropagation();
    setSelectedItem({ ...file, parentLesson: lesson, classId });
    setSelectedType('file');
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    setSelectedType(null);
  };

  const toggleExpand = (e, lessonId) => {
    e.stopPropagation();
    setExpandedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const isExpanded = (lessonId) => expandedLessons.has(lessonId);

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileExtension = (filename) => {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
  };

  const isMediaFile = (type) => {
    return type === 'video' || type === 'audio' || type === 'image';
  };

  const getFileTypeLabel = (type) => {
    const labels = {
      'video': 'Video',
      'audio': 'Audio',
      'image': 'Hình ảnh',
      'raw': 'Tài liệu'
    };
    return labels[type] || 'Không xác định';
  };

  const getFileIcon = (type) => {
    const icons = {
      'video': '🎥',
      'audio': '🎵',
      'image': '🖼️',
      'raw': '📄'
    };
    return icons[type] || '📄';
  };

  const handleDownloadFile = () => {
    if (selectedItem && selectedItem.url) {
      const link = document.createElement('a');
      link.href = selectedItem.url;
      link.download = selectedItem.name || selectedItem.filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewFile = () => {
    if (selectedItem && selectedItem.url) {
      window.open(selectedItem.url, '_blank');
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
   
  };

  return (
    <div className={styles.wrapper}>
      {/* Panel bên trái - Danh sách */}
      <div className={styles.leftPanel}>
        <div className={styles.header}>
          <h1 className={styles.title}>📚 Danh sách bài giảng – Lớp {classId}</h1>
          <button 
            className={styles.addBtn} 
            onClick={() => navigate(`/bang-dieu-khien/chuong-trinh-hoc/bai-giang/create/${classId}`)}
          >
            ➕ Add New Lesson
          </button>
        </div>
        
        {lessons.length > 0 ? (
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
                {lessons.map((lesson) => (
                  <React.Fragment key={lesson.id}>
                    {/* Lesson row */}
                    <tr
                      className={`${styles.lessonRow} ${selectedType === 'lesson' && selectedItem?.id === lesson.id ? styles.selected : ''}`}
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <td>
                        <div className={styles.lessonTitleCell}>
                          <span 
                            className={`${styles.expandIcon} ${isExpanded(lesson.id) ? styles.expanded : ''}`}
                            onClick={(e) => toggleExpand(e, lesson.id)}
                          >
                            ▶
                          </span>
                          {lesson.title}
                        </div>
                      </td>
                      <td>{lesson.owner.name}</td>
                      <td className={styles.actionCell}>
                        <div className={styles.lessonActions}>
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
                        </div>
                      </td>
                    </tr>

                    {/* File rows - hiển thị khi expanded */}
                    {isExpanded(lesson.id) && (
                      <>
                        {lesson.files && lesson.files.length > 0 ? (
                          lesson.files.map((file, index) => (
                            <tr 
                              key={`${lesson.id}-file-${index}`} 
                              className={`${styles.fileRow} ${
                                selectedType === 'file' && 
                                selectedItem?.id === file.id
                                ? styles.selected : ''
                              }`}
                              onClick={(e) => handleFileClick(e, file, lesson)}
                            >
                              <td>
                                <span className={styles.fileIcon}>
                                  {getFileIcon(file.type)}
                                </span>
                                {file.name || file.title || file.filename}
                              </td>
                              <td>
                                {formatFileSize(file.size)}
                              </td>
                              <td></td>
                            </tr>
                          ))
                        ) : (
                          <tr className={styles.fileRow}>
                            <td colSpan="3" className={styles.noFiles}>
                              Không có file nào
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Không có bài giảng nào</p>
        )}
      </div>

      {/* Panel bên phải - Chi tiết */}
      <div className={`${styles.rightPanel} ${!selectedItem ? styles.hidden : ''}`}>
        {selectedItem ? (
          <>
            {selectedType === 'lesson' ? (
              // Chi tiết Lesson
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
                  <div className={styles.detailValue}>{selectedItem.owner.name}</div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>ID</div>
                  <div className={styles.detailValue}>{selectedItem.id}</div>
                </div>

                {selectedItem.files && selectedItem.files.length > 0 && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Files đính kèm ({selectedItem.files.length})</div>
                    <div className={styles.detailValue}>
                      {selectedItem.files.map((file, index) => (
                        <div key={index} style={{ marginBottom: '8px' }}>
                          {getFileIcon(file.type)} {file.name || file.title || file.filename}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.description && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Mô tả</div>
                    <div className={styles.detailValue}>{selectedItem.description}</div>
                  </div>
                )}

                {/* Action buttons trong detail panel */}
                <div className={styles.detailActionsMenu}>
                  <button 
                    className={`${styles.detailActionButton} ${styles.editDetailButton}`}
                    onClick={() => navigate(`/bang-dieu-khien/chuong-trinh-hoc/bai-giang/edit/${selectedItem.id}`)}
                  >
                    ✏️ Chỉnh sửa bài giảng
                  </button>
                  <button 
                    className={`${styles.detailActionButton} ${styles.deleteDetailButton}`}
                    onClick={(e) => handleDeleteClick(e, selectedItem)}
                  >
                    🗑️ Xóa bài giảng
                  </button>
                </div>
              </>
            ) : (
              // Chi tiết File
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
                  <div className={styles.detailValue}>
                    {selectedItem.name || selectedItem.title || selectedItem.filename}
                  </div>
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
                    <div className={styles.metadataValue}>
                      {getFileExtension(selectedItem.name || selectedItem.filename) || 'N/A'}
                    </div>
                  </div>

                  {selectedItem.duration && (selectedItem.type === 'video' || selectedItem.type === 'audio') && (
                    <div className={styles.metadataItem}>
                      <div className={styles.metadataLabel}>Thời lượng</div>
                      <div className={styles.metadataValue}>{selectedItem.duration}</div>
                    </div>
                  )}
                </div>

                {selectedItem.uploadedAt && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Ngày tải lên</div>
                    <div className={styles.detailValue}>
                      {new Date(selectedItem.uploadedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                )}

                {selectedItem.uploadedBy && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Người tải lên</div>
                    <div className={styles.detailValue}>{selectedItem.uploadedBy}</div>
                  </div>
                )}

                {/* Preview cho media files */}
                {selectedItem.url && isMediaFile(selectedItem.type) && (
                  <div className={styles.filePreview}>
                    <div className={styles.detailLabel}>Xem trước</div>
                    {selectedItem.type === 'image' && (
                      <img src={selectedItem.url} alt={selectedItem.name} />
                    )}
                    {selectedItem.type === 'video' && (
                      <video controls src={selectedItem.url}>
                        Trình duyệt không hỗ trợ video
                      </video>
                    )}
                    {selectedItem.type === 'audio' && (
                      <audio controls src={selectedItem.url}>
                        Trình duyệt không hỗ trợ audio
                      </audio>
                    )}
                  </div>
                )}

                {selectedItem.url && (
                  <div className={styles.detailActions}>
                    {/* Chỉ hiển thị nút Xem cho media files */}
                    {isMediaFile(selectedItem.type) && (
                      <button className={`${styles.actionBtn} ${styles.viewBtn}`} onClick={handleViewFile}>
                        👁️ Xem file
                      </button>
                    )}
                    <button 
                      className={`${styles.actionBtn} ${styles.downloadBtn}`} 
                      onClick={handleDownloadFile}
                      style={!isMediaFile(selectedItem.type) ? { flex: 1 } : {}}
                    >
                      ⬇️ Tải xuống
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            Chọn một bài giảng hoặc file để xem chi tiết
          </div>
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
            
            <p className={styles.deleteModalMessage}>
              Bạn có chắc chắn muốn xóa bài giảng này không?
            </p>
            
            <div className={styles.deleteModalLessonName}>
              {lessonToDelete.title}
            </div>
            
            <div className={styles.deleteModalWarning}>
              ⚠️ Hành động này không thể hoàn tác. Tất cả các file và dữ liệu liên quan sẽ bị xóa vĩnh viễn.
            </div>
            
            <div className={styles.deleteModalActions}>
              <button 
                className={styles.cancelButton}
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button 
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}