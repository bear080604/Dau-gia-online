import React, { useState } from 'react';
import styles from './PDFViewer.module.css';

const PDFViewer = ({ pdfUrl, title }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Không thể tải PDF. Vui lòng thử lại sau.');
  };

  return (
    <div className={styles.pdfViewer}>
      <div className={styles.header}>
        <h2>{title}</h2>
      </div>

      <div className={styles.viewerContainer}>
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Đang tải PDF...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className={styles.downloadBtn}
            >
              Mở trong tab mới
            </button>
          </div>
        )}

        {!error && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            style={{ border: 'none' }}
            onLoad={handleLoad}
            onError={handleError}
            title={title}
          />
        )}
      </div>

      <div className={styles.actions}>
        <button
          onClick={() => window.open(pdfUrl, '_blank')}
          className={styles.openBtn}
        >
          Mở trong tab mới
        </button>
        <a
          href={pdfUrl}
          download
          className={styles.downloadBtn}
        >
          Tải xuống
        </a>
      </div>
    </div>
  );
};

export default PDFViewer;
