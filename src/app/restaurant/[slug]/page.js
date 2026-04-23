'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import QueueTicker from '@/components/QueueTicker';
import MenuBrowser from '@/components/MenuBrowser';
import styles from './page.module.css';

export default function RestaurantPage({ params }) {
  const { slug } = use(params);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/restaurants/${slug}`)
      .then(r => r.json())
      .then(data => { setRestaurant(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.loading}>Loading...</div>
    </>
  );

  if (!restaurant) return (
    <>
      <Navbar />
      <div className={styles.loading}>Restaurant not found</div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.headerTop}>
            <span className={styles.emoji}>{restaurant.image_url}</span>
            <div>
              <h1 className={styles.name}>{restaurant.name}</h1>
              <p className={styles.meta}>{restaurant.cuisine} · 📍 {restaurant.address}</p>
              <p className={styles.rating}>⭐ {restaurant.rating} rating · {restaurant.total_tables} tables</p>
            </div>
          </div>
        </motion.div>

        <QueueTicker slug={slug} initialData={{
          queue_count: restaurant.queue_count,
          estimated_wait: restaurant.estimated_wait,
          total_tables: restaurant.total_tables,
          occupied_tables: restaurant.occupied_tables,
        }} />

        <motion.div
          className={styles.joinSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.joinCard}>
            <div className={styles.joinInfo}>
              <h2>Ready to join the queue?</h2>
              <p>Skip the physical wait. Join remotely and we&apos;ll notify you when your table is almost ready.</p>
            </div>
            <Link href={`/restaurant/${slug}/join`} className="btn btn-primary btn-lg">
              Join Queue →
            </Link>
          </div>
        </motion.div>

        <motion.div
          className={styles.menuSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className={styles.sectionTitle}>📋 Browse Menu</h2>
          <p className={styles.sectionSub}>Preview what you&apos;ll order — pre-order after joining the queue.</p>
          {restaurant.menu && <MenuBrowser menu={restaurant.menu} disabled />}
        </motion.div>
      </main>
    </>
  );
}
