import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, Eye, FileText, Music, Pencil, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../../globals/styles/ImageGallery.module.css";
import Modal from "../modals/upload/Modal.jsx";
import ClassSelector from "./ClassSelector.jsx";
import FileUploader from "./FileUploader.jsx";
import useUpdateFile from "../../hooks/useUpdateFile.js";
import useUpload from "../../hooks/useUpload.js";
import { DeleteModal } from "../folderTree/modal/DeleteModal.jsx";
import { FileFilter } from "../filter/FileFilter.jsx";
import useFilter from "../../hooks/useFileFilter.js";
import { useLocation } from "react-router";
import { getFilePreview } from "../../helper/uiHelper.jsx";
import { useFileDownload } from "../../hooks/useDownloadFile.js";
const fileTypeMap = {
    "videos": "video",
    "audios": "audio",
    "images": "image",
    "documents": "raw",
}
export default function FileLibraryPage({ files, fileType = "raw", classMate = null, accept = "*/*", category = null, pageName = "📁 Thư viện tệp" }) {
  const location = useLocation();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [clickedFile, setClickedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [classes, setClasses] = useState(classMate ? [Number(classMate)] : []);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const { loading: updateLoading, error: updateError, data: updateData, updateFile, deleteFile } = useUpdateFile();
  const { upload, loading, error, data } = useUpload();
  const { downloadFile, downloading } = useFileDownload();
  
  const initFilterGenerator = useMemo(() => {
  let temp = {
    search: "",
    types: [],
    classes: [],
    dateFrom: "",
    dateTo: "",
    owner: "",
    category: "",
    minSize: "",
    maxSize: "",
  };
  if (classMate) temp.classes = [Number(classMate)];
  if (fileType) {
    if (["videos", "audios", "images", "documents"].includes(fileType)) {
      temp.types = [fileTypeMap[fileType]];
    }
  }
  if (category) temp.category = category;
  return temp;
}, [classMate, fileType, category]);
  const disabledFilters = useMemo(() => {
    let temp = [];
    if (classMate) {
      temp.push('classes');
    }
    if (fileType) {
      if (["videos", "audios", "images", "documents"].includes(fileType)) {
        temp.push('types');
      }
    }
    if (category) {
      temp.push('category');
    }
    return temp;
  }, [classMate, fileType, category]);
  const { 
    filterResult, 
    filtering, 
    filter,
    pagination,
    nextPage,
    previousPage,
    goToPage,
    changeLimit,
    resetFilters,
    activeFilters,
  } = useFilter(files, '/api/filterFile', 1, 20, initFilterGenerator, `fileLibrary:${files?.version}${classMate}${fileType}${category}`);
  
  const handleUpload = () => {
    if (!selectedFile) return;
    const dataUpload = {
      name,
      description,
      classes: JSON.stringify(classMate ? [Number(classMate)] : [])
    };
    if (category) dataUpload.category = category;
    upload(selectedFile, `/upload/${fileType}`, dataUpload);
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

  const handleDeleteConfirm = () => {
    if (!clickedFile) return;
    deleteFile(clickedFile.id);
    setIsDeleteModalOpen(false);
    setClickedFile(null);
  };

  const handleEditClick = () => {
    setIsEdit(true);
    setName(clickedFile.name);
    setDescription(clickedFile.description);
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    setName("");
    setDescription("");
  };

  const handleConfirmEdit = () => {
    if (!clickedFile) return;
    updateFile({
      id: clickedFile.id,
      name,
      description,
    });
    setIsEdit(false);
    setName("");
    setDescription("");
    setClickedFile({
      ...clickedFile,
      name,
      description,
    });
  };
  const handleFilterChange = (filters) => {
    filter(filters);
  }
  const handleWatch = (file) => {
    if (!file) return;
    window.open(file.url, "_blank", "noopener,noreferrer");
  }
  useEffect(() => {
    setClickedFile(null);
  }, [location.pathname]);
  return (
    <>
      <div className={styles.header}>
        <h2>{pageName}</h2>
        <button className={styles.uploadBtn} onClick={() => setModalOpen(true)}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="7 9 12 4 17 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="4" x2="12" y2="16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tải lên
        </button>
      </div>
      <div className={styles.filterContainer}>
        <FileFilter
          onFilterChange={handleFilterChange}
          initialFilters={activeFilters}
          disabledFilters={disabledFilters}
        />
      </div>
      <div className={styles.container}>
      {/* LEFT SIDE */}
      <div className={styles.leftPane}>
        {filterResult.length === 0 ? (
          <p className={styles.empty}>Chưa có tệp nào được tải lên</p>
        ) : (
          <div className={styles.grid}>
            {filterResult.map((file) => (
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
                    {file.url && ["image", "video", "audio"].includes(file.type) && (
                      <button
                        className={styles.iconBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWatch(file);
                        }}
                        title="xem"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {file.downloadUrl && (
                      <button
                        className={styles.iconBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(file);
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
                {
                  ["image", "video", "audio"].includes(clickedFile.type) && (
                    <button
                      onClick={() => handleWatch(clickedFile)}
                      className={styles.viewBtn}
                    >
                      <Eye size={18} />
                    </button>
                  )
                }
                <button
                  onClick={() => downloadFile(clickedFile)}
                  className={styles.viewBtn}
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={handleEditClick}
                  className={styles.viewBtn}
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className={styles.deleteBtn}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3>📄 Chi tiết tệp</h3>
              {
                isEdit ? (
                  <>
                    <div className={styles.field}>
                      <label>Tên tệp</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Nhập tên..."
                        value={name || clickedFile.name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Mô tả</label>
                      <textarea
                        className={styles.textarea}
                        placeholder="Nhập mô tả..."
                        value={description || clickedFile.description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className={styles.miniActions}>
                      <button onClick={handleCancelEdit} className={styles.cancelBtn}><X size={18} /></button>
                      <button onClick={handleConfirmEdit} className={styles.saveBtn}><Check size={18} /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>Tên:</strong> {clickedFile.name || "Không có"}</p>
                    <p><strong>Mô tả:</strong> {clickedFile.description || "Không có"}</p>
                  </>
                )
              }
              <p><strong>Tên Tệp:</strong> {clickedFile.filename}</p>
              <p><strong>Người tạo:</strong> {clickedFile.ownerName || "Không có"}</p>
              <p><strong>Loại:</strong> {clickedFile.type}</p>
              <p><strong>Kích thước:</strong> {(clickedFile.size / 1024).toFixed(1)} KB</p>
              <p><strong>Ngày tải lên:</strong> {new Date(clickedFile.createdAt).toLocaleString()}</p>
              <p><strong>Thẻ:</strong></p>
              <ClassSelector selected={clickedFile.classes} onChange={(newClasses) => handleClassesChange(clickedFile.id, newClasses)} fixedClasses={classMate ? clickedFile.classes : null} />
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
            <ClassSelector selected={classes} onChange={setClasses} fixedClasses={classMate ? classes : null} />
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
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Xóa tệp"
          message={<p>Bạn có chắc chắn muốn xóa tệp?</p>}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
    </>
  );
}
