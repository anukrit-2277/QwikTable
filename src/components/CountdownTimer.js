'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CountdownTimer.module.css';

export default function CountdownTimer({ minutes, label }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    setTimeLeft(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = minutes > 0 ? ((minutes * 60 - timeLeft) / (minutes * 60)) * 100 : 100;

  return (
    <div className={styles.wrap}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.timer}>
        <AnimatePresence mode="wait">
          <motion.span
            key={mins}
            className={styles.num}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {String(mins).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
        <span className={styles.colon}>:</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={secs}
            className={styles.num}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {String(secs).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className={styles.bar}>
        <motion.div
          className={styles.fill}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );
}
