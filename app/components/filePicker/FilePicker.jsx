import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "../../globals/styles/ImageGallery.module.css";
import useFilter from "../../hooks/useFileFilter";
import { FileFilter } from "../filter/FileFilter";
import pickerStyles from "./FilePicker.module.css";
import { getFilePreview } from "../../helper/uiHelper";

// Fake file data
const fakeFiles = [
  { id: 1, name: "Slide bài 1.pdf", type: "document", size: 102400, createdAt: new Date(), url: "#" },
  { id: 2, name: "Video giới thiệu.mp4", type: "video", size: 204800, createdAt: new Date(), url: "#" },
  { id: 3, name: "Bài tập.xlsx", type: "document", size: 51200, createdAt: new Date(), url: "#" },
  { id: 4, name: "Audio bài học.mp3", type: "audio", size: 102400, createdAt: new Date(), url: "#" },
  { id: 5, name: "Hình minh họa.png", type: "image", size: 102400, createdAt: new Date(), url: "#" },
];

const fileTypeMap = {
  videos: "video",
  audios: "audio",
  images: "image",
  documents: "raw",
};

export default function FilePicker({ selectedFiles, onSelectFiles, multiple = false, fileType = "raw", category = null, classMate = null }) {
  const [isModalOpen, setIsModalOpen] = useState(true);

  // init filter
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
    if (fileType && ["videos", "audios", "images", "documents"].includes(fileType)) {
      temp.types = [fileTypeMap[fileType]];
    }
    if (category) temp.category = category;
    return temp;
  }, [classMate, fileType, category]);

  const disabledFilters = useMemo(() => {
    let temp = [];
    if (classMate) temp.push("classes");
    if (fileType && ["videos", "audios", "images", "documents"].includes(fileType)) temp.push("types");
    if (category) temp.push("category");
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
  } = useFilter(fakeFiles, "/api/filterFile", 1, 20, initFilterGenerator, `filePicker:${fileType}${category}`);

  const handleFilterChange = (filters) => {
    filter(filters);
  };

  const handleItemClick = (file) => {
    if (multiple) {
      let isSelected = selectedFiles.some(f => f.id === file.id);
      if (isSelected) {
        onSelectFiles(selectedFiles.filter(f => f.id !== file.id));
      } else {
        onSelectFiles([...selectedFiles, file]);
      }
    } else {
      onSelectFiles([file]);
    }
  };

  return (
  <>
    {/* CHỈ BUTTON */}
    <div className={pickerStyles.filePickerWrapper}>
      <button
        className={pickerStyles.openBtn}
        onClick={() => setIsModalOpen(true)}
      >
        📁 Chọn file {selectedFiles.length > 0 && `(${selectedFiles.length})`}
      </button>
    </div>

    {/* MODAL */}
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className={pickerStyles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={pickerStyles.modal}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            {/* HEADER FIXED */}
            <div className={pickerStyles.headerActions}>
              <h3 className={pickerStyles.modalTitle}>
                Chọn file {selectedFiles.length > 0 && `(${selectedFiles.length} đã chọn)`}
              </h3>
              <div className={pickerStyles.actionButtons}>
                <button className={pickerStyles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  <X size={16} /> Hủy
                </button>
                <button className={pickerStyles.confirmBtn} onClick={() => setIsModalOpen(false)}>
                  <Check size={16} /> Chọn
                </button>
              </div>
            </div>

            {/* CONTENT CÓ THỂ SCROLL */}
            <div className={pickerStyles.modalContent}>
              <div className={styles.filterContainer}>
                <FileFilter
                  onFilterChange={handleFilterChange}
                  initialFilters={activeFilters}
                  disabledFilters={disabledFilters}
                />
              </div>

              <div className={styles.container}>
                <div className={styles.leftPane}>
                  {filterResult.length === 0 ? (
                    <p className={styles.empty}>Không tìm thấy tệp nào</p>
                  ) : (
                    <div className={styles.grid}>
                      {filterResult.map(file => (
                        <motion.div
                          key={file.id}
                          className={`${styles.card} ${selectedFiles.some(f => f.id === file.id) ? styles.activeCard : ""}`}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => handleItemClick(file)}
                        >
                          <div className={styles.previewWrapper}>{getFilePreview(file)}</div>
                          <div className={styles.meta}>
                            <span className={styles.filename}>{file.name}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
);
}
