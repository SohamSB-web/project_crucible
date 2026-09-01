import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLenis } from '../../context/LenisContext.jsx';
import styles from './TrackModal.module.css';

export default function TrackModal({ track, onClose }) {
  const lenis = useLenis();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    lenis?.stop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [onClose, lenis]);

  if (!track) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
    >
      <motion.div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Close Button */}
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.numberBadge}>{track.id}</div>
          <div className={styles.titleWrap}>
            <h2>{track.title}</h2>
            <span className={styles.difficultyBadge}>{track.difficulty}</span>
          </div>
        </div>

        {/* Section 1: Mission Brief */}
        <div className={styles.section}>
          <h3>
            <span className={styles.promptChar}>&gt;_</span> Mission Brief
          </h3>
          <p>{track.missionBrief || track.shortDescription}</p>
        </div>

        {/* Section 2: What to Build */}
        {track.whatToBuild && (
          <div className={styles.highlightCard}>
            <h4>
              <span className={styles.icon}>🧭</span> What to Build
            </h4>
            <p>{track.whatToBuild}</p>
          </div>
        )}

        {/* Section 3: How to Approach */}
        {track.howToApproach && (
          <div className={styles.section}>
            <h3>
              <span className={styles.icon}>⚡</span> How to Approach
            </h3>
            <p>{track.howToApproach}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
