'use client';
import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

export default function ProgressBar({ value, max, label, showPercent = true }) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className={styles.wrap}>
      {label && <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {showPercent && <span className={styles.percent}>{Math.round(percent)}%</span>}
      </div>}
      <div className={styles.track}>
        <motion.div
          className={styles.fill}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
