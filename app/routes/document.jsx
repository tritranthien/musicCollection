import React, { useEffect, useState } from "react";
import styles from "../globals/styles/documentList.module.css";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { DocumentModel } from "../.server/document.repo";
import { useFetcherWithReset } from "../hooks/useFetcherWithReset";

export async function loader({ params }) {
  const { categoryId } = params;
  const documentModel = new DocumentModel();
  const documents = await documentModel.findByCategory(categoryId);
  return { categoryId, documents };
}

export default function DocumentList({ loaderData }) {
  const { categoryId, documents } = loaderData;
  const navigate = useNavigate();
  const fetcher = useFetcherWithReset();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
  };

  const handleCloseDetail = () => {
    setSelectedDocument(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      'author': 'Tác giả',
      'work': 'Tác phẩm',
      'genre': 'Thể loại',
      'period': 'Thời kỳ văn học',
      'movement': 'Trào lưu văn học',
      'theory': 'Lý thuyết văn học'
    };
    return labels[type] || 'Tài liệu';
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

  const handleEditDocument = (e, documentId) => {
    e.stopPropagation();
    navigate(`/bang-dieu-khien/tai-lieu/edit/${documentId}`);
  };

  const handleDeleteClick = (e, document) => {
    e.stopPropagation();
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) {
      return;
    }
    const formData = new FormData();
    formData.append('documentId', documentToDelete.id);
    formData.append('intent', 'delete');
    fetcher.submit(formData, {
      action: '/api/document',
      method: 'post',
    });
  };

  const handleViewContent = () => {
    if (selectedDocument) {
      navigate(`/bang-dieu-khien/tai-lieu/view/${selectedDocument.id}`);
    }
  };

  useEffect(() => {
    if (fetcher.data) {
      setShowDeleteModal(false);
      setDocumentToDelete(null);
      toast.success('Đã xoá tài liệu');
      fetcher.reset();
    }
  }, [fetcher.data]);

  return (
    <div className={styles.wrapper}>
      {/* Panel bên trái - Danh sách */}
      <div className={styles.leftPanel}>
        <div className={styles.header}>
          <h1 className={styles.title}>📚 Danh sách tài liệu văn học</h1>
          <button 
            className={styles.addBtn} 
            onClick={() => navigate(`/bang-dieu-khien/thong-tin-suu-tam/tao-moi`)}
          >
            ➕ Thêm tài liệu
          </button>
        </div>
        
        {documents.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Tiêu đề</th>
                  <th>Người tạo</th>
                  <th>Ngày tạo</th>
                  <th className={styles.actionCell}></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr
                    key={document.id}
                    className={`${styles.documentRow} ${selectedDocument?.id === document.id ? styles.selected : ''}`}
                    onClick={() => handleDocumentClick(document)}
                  >
                    <td>
                      <span className={styles.documentTypeIcon}>
                        {getDocumentIcon(document.type)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.documentTitle}>
                        {document.title}
                        {document.subtitle && (
                          <span className={styles.subtitle}> — {document.subtitle}</span>
                        )}
                      </div>
                    </td>
                    <td>{document.createdBy?.name || '—'}</td>
                    <td>{formatDate(document.createdAt)}</td>
                    <td className={styles.actionCell}>
                      <div className={styles.documentActions}>
                        <button 
                          className={`${styles.actionIcon} ${styles.editIcon}`}
                          onClick={(e) => handleEditDocument(e, document.id)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button 
                          className={`${styles.actionIcon} ${styles.deleteIcon}`}
                          onClick={(e) => handleDeleteClick(e, document)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyList}>
            <p>📭 Chưa có tài liệu nào</p>
            <button 
              className={styles.addBtnLarge}
              onClick={() => navigate(`/bang-dieu-khien/thong-tin-suu-tam/tao-moi`)}
            >
              ➕ Tạo tài liệu đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Panel bên phải - Chi tiết */}
      <div className={`${styles.rightPanel} ${!selectedDocument ? styles.hidden : ''}`}>
        {selectedDocument ? (
          <>
            <div className={styles.detailHeader}>
              <div>
                <span className={styles.detailType}>
                  {getDocumentIcon(selectedDocument.type)} {getDocumentTypeLabel(selectedDocument.type)}
                </span>
                <h2 className={styles.detailTitle}>Chi tiết tài liệu</h2>
              </div>
              <button className={styles.closeBtn} onClick={handleCloseDetail}>
                ×
              </button>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>Tiêu đề</div>
              <div className={styles.detailValue}>{selectedDocument.title}</div>
            </div>

            {selectedDocument.subtitle && (
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>Phụ đề</div>
                <div className={styles.detailValue}>{selectedDocument.subtitle}</div>
              </div>
            )}

            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>Loại tài liệu</div>
              <div className={styles.detailValue}>
                {getDocumentIcon(selectedDocument.type)} {getDocumentTypeLabel(selectedDocument.type)}
              </div>
            </div>

            {/* Thông tin đặc biệt theo loại tài liệu */}
            {selectedDocument.type === 'author' && (
              <>
                {selectedDocument.birthYear && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Năm sinh</div>
                    <div className={styles.detailValue}>{selectedDocument.birthYear}</div>
                  </div>
                )}
                {selectedDocument.deathYear && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Năm mất</div>
                    <div className={styles.detailValue}>{selectedDocument.deathYear}</div>
                  </div>
                )}
                {selectedDocument.nationality && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Quốc t적</div>
                    <div className={styles.detailValue}>{selectedDocument.nationality}</div>
                  </div>
                )}
              </>
            )}

            {selectedDocument.type === 'work' && (
              <>
                {selectedDocument.author && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Tác giả</div>
                    <div className={styles.detailValue}>{selectedDocument.author}</div>
                  </div>
                )}
                {selectedDocument.publishYear && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Năm xuất bản</div>
                    <div className={styles.detailValue}>{selectedDocument.publishYear}</div>
                  </div>
                )}
                {selectedDocument.genre && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Thể loại</div>
                    <div className={styles.detailValue}>{selectedDocument.genre}</div>
                  </div>
                )}
              </>
            )}

            {selectedDocument.summary && (
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>Tóm tắt</div>
                <div className={styles.detailValue}>{selectedDocument.summary}</div>
              </div>
            )}

            {selectedDocument.tags && selectedDocument.tags.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>Tags</div>
                <div className={styles.tagContainer}>
                  {selectedDocument.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.metadataGrid}>
              <div className={styles.metadataItem}>
                <div className={styles.metadataLabel}>Người tạo</div>
                <div className={styles.metadataValue}>
                  {selectedDocument.createdBy?.name || '—'}
                </div>
              </div>

              <div className={styles.metadataItem}>
                <div className={styles.metadataLabel}>Ngày tạo</div>
                <div className={styles.metadataValue}>
                  {formatDate(selectedDocument.createdAt)}
                </div>
              </div>

              {selectedDocument.updatedAt && (
                <div className={styles.metadataItem}>
                  <div className={styles.metadataLabel}>Cập nhật lần cuối</div>
                  <div className={styles.metadataValue}>
                    {formatDate(selectedDocument.updatedAt)}
                  </div>
                </div>
              )}

              <div className={styles.metadataItem}>
                <div className={styles.metadataLabel}>ID</div>
                <div className={styles.metadataValue}>{selectedDocument.id}</div>
              </div>
            </div>

            {/* Preview nội dung (nếu có) */}
            {selectedDocument.content && (
              <div className={styles.contentPreview}>
                <div className={styles.detailLabel}>Nội dung</div>
                <div 
                  className={styles.contentPreviewBox}
                  dangerouslySetInnerHTML={{ __html: selectedDocument.content.substring(0, 500) + '...' }}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className={styles.detailActionsMenu}>
              <button 
                className={`${styles.detailActionButton} ${styles.viewDetailButton}`}
                onClick={handleViewContent}
              >
                👁️ Xem toàn bộ nội dung
              </button>
              <button 
                className={`${styles.detailActionButton} ${styles.editDetailButton}`}
                onClick={() => navigate(`/bang-dieu-khien/tai-lieu/edit/${selectedDocument.id}`)}
              >
                ✏️ Chỉnh sửa tài liệu
              </button>
              <button 
                className={`${styles.detailActionButton} ${styles.deleteDetailButton}`}
                onClick={(e) => handleDeleteClick(e, selectedDocument)}
              >
                🗑️ Xóa tài liệu
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            Chọn một tài liệu để xem chi tiết
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && documentToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteModalHeader}>
              <span className={styles.deleteModalIcon}>⚠️</span>
              <h3 className={styles.deleteModalTitle}>Xác nhận xóa tài liệu</h3>
            </div>
            
            <p className={styles.deleteModalMessage}>
              Bạn có chắc chắn muốn xóa tài liệu này không?
            </p>
            
            <div className={styles.deleteModalDocumentInfo}>
              <div className={styles.deleteModalIcon}>
                {getDocumentIcon(documentToDelete.type)}
              </div>
              <div>
                <div className={styles.deleteModalDocumentTitle}>
                  {documentToDelete.title}
                </div>
                <div className={styles.deleteModalDocumentType}>
                  {getDocumentTypeLabel(documentToDelete.type)}
                </div>
              </div>
            </div>
            
            <div className={styles.deleteModalWarning}>
              ⚠️ Hành động này không thể hoàn tác. Tất cả nội dung sẽ bị xóa vĩnh viễn.
            </div>
            
            <div className={styles.deleteModalActions}>
              <button 
                className={styles.cancelButton}
                onClick={handleCancelDelete}
                disabled={fetcher.state === 'submitting'}
              >
                Hủy
              </button>
              <button 
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
                disabled={fetcher.state === 'submitting'}
              >
                {fetcher.state === 'submitting' ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}