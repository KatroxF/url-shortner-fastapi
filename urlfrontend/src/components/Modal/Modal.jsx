import { useState } from 'react';
import styles from './Modal.module.css';

export default function Modal({ show, shortUrl, onClose, onViewAllLinks }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`${styles.modalOverlay} ${show ? styles.show : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={styles.modal}>
        <div className={styles.modalIcon}>
          <svg width="26" height="26" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3>Link shortened!</h3>
        <p>Your short link is ready to share with the world.</p>
        <div className={styles.shortUrlBox}>
          <span className={styles.shortUrlText}>{shortUrl}</span>
          <button
            className={styles.copyBtn}
            onClick={handleCopy}
            style={copied ? { background: '#22c89a' } : {}}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnGhost} onClick={onClose}>
            Close
          </button>
          <button className={styles.btnPrimary} onClick={onViewAllLinks}>
            View all links →
          </button>
        </div>
      </div>
    </div>
  );
}
