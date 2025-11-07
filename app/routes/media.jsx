import { useLoaderData } from "react-router";
import { FileModel } from "../.server/fileUpload.repo.js";
import styles from "../globals/styles/ImageGallery.module.css";
import FileUploader from "../components/common/FileUploader.jsx";
import { FileText, Video, Music, Image as ImageIcon } from "lucide-react";

const fileModel = new FileModel();

export async function loader() {
  const files = await fileModel.findAll();
  return Response.json({ files });
}

export default function FileLibraryPage() {
  const { files } = useLoaderData();

  const getFilePreview = (file) => {
  const type = (file.type || "").toLowerCase();

  switch (type) {
    case "image":
      return (
        <div className={styles.imageWrapper}>
          <img
            src={file.url}
            alt={file.filename}
            className={styles.imageCover}
            loading="lazy"
          />
        </div>
      );

    case "video":
      return (
        <div className={styles.videoWrapper}>
          <video className={styles.thumbnail} controls>
            <source src={file.url} />
          </video>
        </div>
      );

    case "audio":
      return (
        <div className={styles.iconWrapper}>
          <Music className={styles.fileIcon} />
        </div>
      );

    case "document":
    case "file":
    default:
      return (
        <div className={styles.iconWrapper}>
          <FileText className={styles.fileIcon} />
        </div>
      );
  }
};


  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <div className={styles.header}>
          <h2>📁 Thư viện tệp</h2>
        </div>

        {files.length === 0 ? (
          <p className={styles.empty}>Chưa có tệp nào được tải lên</p>
        ) : (
          <div className={styles.grid}>
            {files.map((file) => (
              <div key={file.id} className={styles.card}>
                {getFilePreview(file)}
                <div className={styles.meta}>
                  <span className={styles.filename}>{file.filename}</span>
                  <span className={styles.size}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <span className={styles.typeTag}>{file.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.rightPane}>
        <FileUploader uploadUrl="/upload/files" label="Tải tệp lên" />
      </div>
    </div>
  );
}
