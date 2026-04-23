'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchQueue = useCallback(async () => {
    const res = await fetch('/api/dashboard/queue');
    if (res.status === 401) {
      router.push('/dashboard/login');
      return;
    }
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleAction = async (entryId, action) => {
    setActionLoading(entryId);
    await fetch('/api/dashboard/queue', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, action }),
    });
    await fetchQueue();
    setActionLoading(null);
  };

  if (loading) return (
    <><Navbar /><div className={styles.loading}>Loading dashboard...</div></>
  );

  if (!data) return (
    <><Navbar /><div className={styles.loading}>Unable to load dashboard</div></>
  );

  const waiting = data.entries.filter(e => e.status === 'waiting');
  const notified = data.entries.filter(e => e.status === 'notified');

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <motion.div className={styles.header} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className={styles.title}>🏪 {data.restaurant?.name}</h1>
            <p className={styles.subtitle}>Queue Management Dashboard</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.hStat}>
              <span className={styles.hStatVal}>{data.entries.length}</span>
              <span className={styles.hStatLabel}>In Queue</span>
            </div>
            <div className={styles.hStat}>
              <span className={styles.hStatVal}>{data.restaurant?.total_tables - data.restaurant?.occupied_tables}</span>
              <span className={styles.hStatLabel}>Tables Free</span>
            </div>
          </div>
        </motion.div>

        {/* Notified Section */}
        {notified.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🔔 Notified — Arriving Soon</h2>
            <div className={styles.entryList}>
              <AnimatePresence>
                {notified.map(entry => (
                  <motion.div
                    key={entry.id}
                    className={`${styles.entry} ${styles.entryNotified}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className={styles.entryInfo}>
                      <span className={styles.entryName}>{entry.customer_name}</span>
                      <span className={styles.entryMeta}>Party of {entry.party_size} · {entry.join_type} · #{entry.position}</span>
                    </div>
                    <div className={styles.entryActions}>
                      {entry.has_preorder > 0 && <span className={styles.preorderBadge}>📦 Pre-order</span>}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAction(entry.id, 'seat')}
                        disabled={actionLoading === entry.id}
                      >
                        Seat
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Waiting Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>⏳ Waiting ({waiting.length})</h2>
          <div className={styles.entryList}>
            <AnimatePresence>
              {waiting.map(entry => (
                <motion.div
                  key={entry.id}
                  className={styles.entry}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className={styles.entryPos}>#{entry.position}</div>
                  <div className={styles.entryInfo}>
                    <span className={styles.entryName}>{entry.customer_name}</span>
                    <span className={styles.entryMeta}>
                      Party of {entry.party_size} · {entry.join_type} · ~{entry.estimated_wait} min
                    </span>
                  </div>
                  <div className={styles.entryActions}>
                    {entry.has_preorder > 0 && <span className={styles.preorderBadge}>📦</span>}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAction(entry.id, 'notify')}
                      disabled={actionLoading === entry.id}
                    >
                      Notify
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAction(entry.id, 'seat')}
                      disabled={actionLoading === entry.id}
                    >
                      Seat
                    </button>
                    <button
                      className={styles.cancelSmall}
                      onClick={() => handleAction(entry.id, 'cancel')}
                      disabled={actionLoading === entry.id}
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {waiting.length === 0 && (
              <p className={styles.empty}>No one waiting — the queue is clear! 🎉</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
