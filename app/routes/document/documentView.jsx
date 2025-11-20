import { useNavigate } from "react-router";
import { DocumentModel } from "../../.server/document.repo";
import styles from "../../globals/styles/documentView.module.css";
import { useDocumentExport } from "../../hooks/useDownloadDoc";
import { usePermissions } from "../../hooks/usePermissions";  // ← THÊM DÒNG NÀY

/**
 * DocumentViewer - Hiển thị nội dung tài liệu đã lưu
 * @param {Object} props
 * @param {Object} props.loaderData - Data từ loader chứa document
 */
export async function loader({ params }) {
  const { documentId } = params;
  const documentModel = new DocumentModel();
  const document = await documentModel.findById(documentId);
  return { document };
}

export default function DocumentViewer({ loaderData }) {
  const { document } = loaderData;
  const { downloadPDF, downloadWord, downloadingPdf, downloadingWord } = useDocumentExport();
  const navigate = useNavigate();
  const permissions = usePermissions();

  if (!document) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBox}>
          <h1>❌ Không tìm thấy tài liệu</h1>
          <p>Tài liệu bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/bang-dieu-khien/thong-tin-suu-tam/chinh-sua/${document.id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.viewerWrapper}>
      {/* Header với actions */}
      <div className={styles.viewerHeader}>
        <button
          className={styles.backBtn}
          onClick={handleBack}
        >
          ← Quay lại
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={styles.editBtn}
            onClick={() => downloadPDF(document.id)}
          >
            {downloadingPdf === document.id ? 'Đang tải...' : '📕 Tải về PDF'}
          </button>
          <button
            className={styles.editBtn}
            onClick={() => downloadWord(document.id)}
          >
            {downloadingWord === document.id ? 'Đang tải...' : '📖 Tải về Word'}
          </button>
          {(permissions.isAdmin || permissions.isManager || (permissions.isTeacher && document.ownerId === permissions.userId)) && (
            <button
              className={styles.editBtn}
              onClick={handleEdit}
            >
              ✏️ Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {/* Document Container */}
      <article className={styles.documentContainer}>
        {/* Title Section */}
        <header className={styles.documentHeader}>
          <h1 className={styles.documentTitle}>{document.title}</h1>

          {document.description && (
            <p className={styles.documentDescription}>
              {document.description}
            </p>
          )}

          {/* Metadata */}
          <div className={styles.documentMeta}>
            {document.classes && document.classes.length > 0 && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>📚 Lớp:</span>
                <div className={styles.classesList}>
                  {document.classes.sort((a, b) => a - b).map((classNum, index) => (
                    <span key={index} className={styles.classTag}>
                      Lớp {classNum}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {document.createdAt && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>📅 Ngày tạo:</span>
                <span className={styles.metaValue}>
                  {formatDate(document.createdAt)}
                </span>
              </div>
            )}

            {document.updatedAt && document.updatedAt !== document.createdAt && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>🔄 Cập nhật:</span>
                <span className={styles.metaValue}>
                  {formatDate(document.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Divider */}
        <hr className={styles.divider} />

        {/* Content Section */}
        <div
          className={styles.documentContent}
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
      </article>

      {/* Footer Actions */}
      <footer className={styles.viewerFooter}>
        <button
          className={styles.backBtnLarge}
          onClick={handleBack}
        >
          ← Quay lại danh sách
        </button>
        {(permissions.isAdmin || permissions.isManager || (permissions.isTeacher && document.ownerId === permissions.userId)) && (
          <button
            className={styles.editBtnLarge}
            onClick={handleEdit}
          >
            ✏️ Chỉnh sửa tài liệu
          </button>
        )}
      </footer>
    </div>
  );
}