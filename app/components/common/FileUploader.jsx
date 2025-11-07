import { useState } from "react";
import styles from "./FileUploader.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function FileUploader({ onFileSelect, accept = "*" }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const type = selectedFile.type;
    if (type.startsWith("image/") || type.startsWith("video/") || type.startsWith("audio/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    onFileSelect?.(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return "📷";
    if (type.startsWith("video/")) return "🎬";
    if (type.startsWith("audio/")) return "🎧";
    if (type.includes("pdf")) return "📕";
    if (type.includes("zip")) return "🗜️";
    if (type.includes("text")) return "📄";
    return "📁";
  };

  const renderPreview = () => {
    if (!previewUrl) {
      return (
        <>
          <span className={styles.icon}>＋</span>
          <span className={styles.text}>Chọn hoặc kéo tệp vào đây</span>
        </>
      );
    }

    if (file.type.startsWith("image/")) {
      return <img src={previewUrl} alt="preview" className={styles.media} />;
    }

    if (file.type.startsWith("video/")) {
      return <video src={previewUrl} className={styles.media} controls />;
    }

    if (file.type.startsWith("audio/")) {
      return (
        <div className={styles.audioPreview}>
          🎵 <audio src={previewUrl} controls />
        </div>
      );
    }

    return (
      <div className={styles.fileIcon}>
        <span className={styles.bigIcon}>{getFileIcon(file.type)}</span>
        <p>{file.name}</p>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.dropZone}>
        <AnimatePresence mode="wait">
          <motion.div
            key={file ? file.name : "empty"}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={styles.previewBox}
          >
            {renderPreview()}
          </motion.div>
        </AnimatePresence>

        <input
          type="file"
          accept={accept}
          className={styles.input}
          onChange={handleFileChange}
        />
      </label>

      {file && (
        <motion.div
          className={styles.fileInfo}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>
            {getFileIcon(file.type)} {file.name}
          </span>
          <button className={styles.removeBtn} onClick={handleRemove}>
            ✕
          </button>
        </motion.div>
      )}
    </div>
  );
}
