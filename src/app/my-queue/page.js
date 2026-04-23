'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export default function MyQueuePage() {
  const [phone, setPhone] = useState('');
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/queue/lookup?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (res.ok) {
        setEntries(data);
        if (data.length === 0) setError('No active queue entries found for this number.');
      } else {
        setError(data.error || 'Lookup failed');
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'waiting': return styles.statusWaiting;
      case 'notified': return styles.statusNotified;
      case 'seated': return styles.statusSeated;
      default: return styles.statusDefault;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'waiting': return '⏳ Waiting';
      case 'notified': return '🔔 Table Almost Ready!';
      case 'seated': return '🎉 Seated';
      case 'cancelled': return '❌ Cancelled';
      default: return status;
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className={styles.heroIcon}>📱</span>
          <h1 className={styles.title}>My Queue</h1>
          <p className={styles.subtitle}>
            Enter the phone number you used when joining a queue to check your status.
          </p>
        </motion.div>

        <motion.form
          className={styles.searchCard}
          onSubmit={handleLookup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.inputRow}>
            <input
              id="phone-lookup"
              type="tel"
              className="input"
              placeholder="Enter your phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Find My Queue'}
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </motion.form>

        <AnimatePresence>
          {entries && entries.length > 0 && (
            <motion.div
              className={styles.results}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className={styles.resultsTitle}>Your Active Queues</h2>
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  className={styles.entryCard}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={styles.entryHeader}>
                    <div>
                      <h3 className={styles.entryRestaurant}>{entry.restaurant_name}</h3>
                      <p className={styles.entryMeta}>
                        Party of {entry.party_size} · Position #{entry.position} · {entry.join_type}
                      </p>
                    </div>
                    <span className={`${styles.statusBadge} ${getStatusStyle(entry.status)}`}>
                      {getStatusLabel(entry.status)}
                    </span>
                  </div>

                  {entry.status === 'notified' && (
                    <div className={styles.alertBanner}>
                      🏃 <strong>Head over now!</strong> Your table at {entry.restaurant_name} is ready in ~5 minutes!
                    </div>
                  )}

                  {entry.status === 'waiting' && (
                    <div className={styles.waitInfo}>
                      <div className={styles.waitStat}>
                        <span className={styles.waitValue}>~{entry.current_wait} min</span>
                        <span className={styles.waitLabel}>Est. Wait</span>
                      </div>
                      <div className={styles.waitStat}>
                        <span className={styles.waitValue}>{entry.groups_ahead}</span>
                        <span className={styles.waitLabel}>Groups Ahead</span>
                      </div>
                    </div>
                  )}

                  <div className={styles.entryActions}>
                    <Link href={`/queue/${entry.id}`} className="btn btn-primary btn-sm">
                      View Full Status →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className={styles.infoCard}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3>💡 How it works</h3>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <div>
                <strong>Join a Queue</strong>
                <p>Browse restaurants and join a queue with your name and phone number.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <div>
                <strong>Track Your Status</strong>
                <p>View live countdown, position updates, and pre-order your meal while waiting.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <div>
                <strong>Get Notified</strong>
                <p>When your table is ~5 minutes away, you&apos;ll see a <strong>🔔 seat alert</strong> with sound. No need to hover at the door!</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>4</span>
              <div>
                <strong>Walk In & Sit</strong>
                <p>Head to the restaurant, your pre-order is already being prepared.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
