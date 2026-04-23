'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export default function DashboardLogin() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, password }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError(data.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.header}>
            <span className={styles.icon}>🏪</span>
            <h1 className={styles.title}>Restaurant Dashboard</h1>
            <p className={styles.subtitle}>Log in to manage your queue</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="slug" className={styles.label}>Restaurant ID</label>
              <select id="slug" className="input" value={slug} onChange={e => setSlug(e.target.value)}>
                <option value="">Select restaurant...</option>
                <option value="aromas-kitchen">Aromas Kitchen</option>
                <option value="the-blue-bistro">The Blue Bistro</option>
                <option value="sakura-sushi">Sakura Sushi</option>
                <option value="trattoria-milano">Trattoria Milano</option>
                <option value="smoky-grill-house">Smoky Grill House</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <p className={styles.hint}>Demo password: <code>admin123</code></p>
          </form>
        </motion.div>
      </main>
    </>
  );
}
