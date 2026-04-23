'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SeatAlert.module.css';

export default function SeatAlert({ status, restaurantName }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === 'notified') {
      setVisible(true);
    }
  }, [status]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.alert}
        initial={{ y: -60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className={styles.icon}>🔔</div>
        <div className={styles.content}>
          <h4 className={styles.title}>Your table is almost ready!</h4>
          <p className={styles.message}>
            Your table at <strong>{restaurantName}</strong> is ready in ~5 min — head over now.
          </p>
        </div>
        <button className={styles.dismiss} onClick={() => setVisible(false)}>✕</button>
      </motion.div>
    </AnimatePresence>
  );
}
