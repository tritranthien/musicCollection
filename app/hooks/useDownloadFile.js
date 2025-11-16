import { useState } from 'react';

export function useFileDownload() {
  const [downloading, setDownloading] = useState(null);

  const downloadFile = async (file) => {
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

  return { downloadFile, downloading };
}
