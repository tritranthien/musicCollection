import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, Music } from "lucide-react";
import { useState } from "react";
import styles from "../../globals/styles/ImageGallery.module.css";
import useUpload from "../../hooks/useUpload.js";
import Modal from "../modals/upload/Modal.jsx";
import ClassSelector from "./ClassSelector.jsx";
import FileUploader from "./FileUploader.jsx";
import useUpdateFile from "../../hooks/useUpload.js";

export default function FileLibraryPage({ files, fileType = "raw", classMate = null, accept = "*/*" }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [clickedFile, setClickedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [classes, setClasses] = useState(classMate ? [Number(classMate)] : []);
  const [downloading, setDownloading] = useState(null);
  const { loading: updateLoading, error: updateError, data: updateData, updateFile } = useUpdateFile();
  const { upload, loading, error, data } = useUpload();

  const handleUpload = () => {
    if (!selectedFile) return;
    upload(selectedFile, `/upload/${fileType}`, {
      name,
      description,
      classes: JSON.stringify(classMate ? [Number(classMate)] : [])
    });
  };

  const handleDownload = async (file) => {
  setDownloading(file.id);
  try {
    const response = await fetch(file.downloadUrl || file.url);
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    const blob = await response.blob();
    const finalFilename = file.filename;
    
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = finalFilename;
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
    
  } catch (error) {
    console.error('Download error:', error);
    alert('Không thể tải file. Vui lòng thử lại.');
  } finally {
    setDownloading(null);
  }
};

  const getFilePreview = (file) => {
    const type = (file.type || "").toLowerCase();
    switch (type) {
      case "image":
        return <img src={file.url} alt={file.filename} className={styles.imageCover} loading="lazy" />;
      case "video":
        return <video className={styles.thumbnail} src={file.url} muted />;
      case "audio":
        return <Music className={styles.fileIcon} />;
      default:
        return <FileText className={styles.fileIcon} />;
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedFile(null);
    setName("");
    setDescription("");
  };

  const handleClassesChange = (fileId, newClasses) => {
    updateFile({
      id: fileId,
      classes: newClasses,
    });
  };

  return (
    <div className={styles.container}>
      {/* LEFT SIDE */}
      <div className={styles.leftPane}>
        <div className={styles.header}>
          <h2>📁 Thư viện tệp</h2>
        </div>

        {files.length === 0 ? (
          <p className={styles.empty}>Chưa có tệp nào được tải lên</p>
        ) : (
          <div className={styles.grid}>
            {files.map((file) => (
              <motion.div
                key={file.id}
                className={`${styles.card} ${clickedFile?.id === file.id ? styles.activeCard : ""}`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() => setClickedFile(file)}
              >
                <div className={styles.previewWrapper}>{getFilePreview(file)}</div>
                <div className={styles.meta}>
                  <span className={styles.filename} title={file.filename}>{file.filename}</span>
                  <div className={styles.actions}>
                    {file.downloadUrl && (
                      <button
                        className={styles.iconBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        disabled={downloading === file.id}
                        title="Tải xuống"
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.rightPane}>
        <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
          + TẢI LÊN
        </button>

        {/* FILE INFO SECTION */}
        <AnimatePresence>
          {clickedFile && (
            <motion.div
              className={styles.fileDetail}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.sideActions}>
                <button
                  onClick={() => handleDownload(clickedFile)}
                  className={styles.viewBtn}
                >
                  <Download size={18} />
                </button>
              </div>
              <h3>📄 Chi tiết tệp</h3>
              <p><strong>Tên:</strong> {clickedFile.name || "Không có"}</p>
              <p><strong>Tên Tệp:</strong> {clickedFile.filename}</p>
              <p><strong>Người tạo:</strong> {clickedFile.ownerName || "Không có"}</p>
              <p><strong>Loại:</strong> {clickedFile.type}</p>
              <p><strong>Mô tả:</strong> {clickedFile.description || "Không có"}</p>
              <p><strong>Kích thước:</strong> {(clickedFile.size / 1024).toFixed(1)} KB</p>
              <p><strong>Ngày tải lên:</strong> {new Date(clickedFile.createdAt).toLocaleString()}</p>
              <p><strong>Thẻ:</strong></p>
              <ClassSelector selected={clickedFile.classes} onChange={(newClasses) => handleClassesChange(clickedFile.id, newClasses)} fixedClasses={classMate ? clickedFile.classes : null}/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL UPLOAD */}
        <Modal isOpen={isModalOpen} onClose={handleModalClose} title="Tải tệp mới" width="500px">
          <div className={styles.form}>
            <FileUploader onFileSelect={setSelectedFile} accept={accept || "*/*"} />
            <div className={styles.field}>
              <label>Tên tệp</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập tên..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Mô tả</label>
              <textarea
                className={styles.textarea}
                placeholder="Nhập mô tả..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <ClassSelector selected={classes} onChange={setClasses} fixedClasses={classMate ? classes : null}/>
            {error && <p className={styles.error}>{error}</p>}
            {data?.success && <p className={styles.success}>Tải lên thành công!</p>}
          </div>
          <div className={styles.modalFooter}>
            <button
              disabled={loading || !selectedFile}
              className={`${styles.submitBtn} ${styles.button}`}
              onClick={handleUpload}
            >
              {loading ? "Đang tải lên..." : "Tải lên"}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
