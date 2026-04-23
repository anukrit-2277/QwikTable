'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export default function JoinQueuePage({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', partySize: 2 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/restaurants/${slug}`)
      .then(r => r.json())
      .then(setRestaurant);
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Please enter your name'); return; }
    if (!form.phone.trim()) { setError('Please enter your phone number'); return; }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          customerName: form.name,
          customerPhone: form.phone,
          partySize: form.partySize,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/queue/${data.id}`);
      } else {
        setError(data.error || 'Failed to join queue');
      }
    } catch {
      setError('Something went wrong');
    }
    setSubmitting(false);
  };

  if (!restaurant) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading...</div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.emoji}>{restaurant.image_url}</span>
            <div>
              <h1 className={styles.title}>Join Queue</h1>
              <p className={styles.subtitle}>{restaurant.name} · ~{restaurant.estimated_wait} min wait</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Your Name</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Enter your name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="phone" className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
              <input
                id="phone"
                type="tel"
                className="input"
                placeholder="Your phone number"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="party-size" className={styles.label}>Party Size</label>
              <div className={styles.sizeRow}>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.sizeBtn} ${form.partySize === n ? styles.sizeActive : ''}`}
                    onClick={() => setForm({ ...form, partySize: n })}
                  >
                    {n}{n === 6 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Joining...' : 'Join Queue →'}
            </button>

            <p className={styles.note}>
              You&apos;ll receive a notification when your table is almost ready. No need to wait at the door!
            </p>
          </form>
        </motion.div>
      </main>
    </>
  );
}
