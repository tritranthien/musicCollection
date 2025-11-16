import { FileText, Music } from "lucide-react";
import styles from "../globals/styles/ImageGallery.module.css";

export const getFilePreview = (file) => {
    const type = (file.type || "").toLowerCase();
    switch (type) {
        case "image":
            return <img src={file.url} alt={file.name} className={styles.imageCover} loading="lazy" />;
        case "video":
            return <video className={styles.thumbnail} src={file.url} muted />;
        case "audio":
            return <Music className={styles.fileIcon} />;
        default:
            return <FileText className={styles.fileIcon} />;
    }
};