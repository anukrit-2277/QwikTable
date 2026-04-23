'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './QueueTicker.module.css';

export default function QueueTicker({ slug, initialData }) {
  const [data, setData] = useState(initialData || { queue_count: 0, estimated_wait: 0 });

  useEffect(() => {
    const eventSource = new EventSource(`/api/restaurants/${slug}/queue-stream`);
    eventSource.onmessage = (e) => {
      try {
        setData(JSON.parse(e.data));
      } catch {}
    };
    return () => eventSource.close();
  }, [slug]);

  const waitColor = data.estimated_wait <= 10 ? 'green' : data.estimated_wait <= 25 ? 'amber' : 'red';

  return (
    <motion.div
      className={styles.ticker}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.led}>
        <div className={`${styles.dot} ${styles[waitColor]}`} />
        <span className={styles.label}>LIVE QUEUE</span>
      </div>
      <div className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.span
            key={data.estimated_wait}
            className={`${styles.time} ${styles[waitColor]}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            ~{data.estimated_wait} min
          </motion.span>
        </AnimatePresence>
        <span className={styles.sep}>—</span>
        <span className={styles.groups}>{data.queue_count} {data.queue_count === 1 ? 'group' : 'groups'} ahead</span>
      </div>
      <div className={styles.tables}>
        {data.total_tables - data.occupied_tables} / {data.total_tables} tables free
      </div>
    </motion.div>
  );
}
