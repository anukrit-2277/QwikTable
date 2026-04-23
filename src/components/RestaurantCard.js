'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './RestaurantCard.module.css';

export default function RestaurantCard({ restaurant, index = 0 }) {
  const waitColor = restaurant.estimated_wait <= 10 ? 'green' : restaurant.estimated_wait <= 25 ? 'amber' : 'red';
  const waitLabel = restaurant.estimated_wait <= 10 ? 'Short Wait' : restaurant.estimated_wait <= 25 ? 'Moderate' : 'Busy';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/restaurant/${restaurant.slug}`} className={styles.card}>
        <div className={styles.header}>
          <span className={styles.emoji}>{restaurant.image_url}</span>
          <div className={styles.info}>
            <h3 className={styles.name}>{restaurant.name}</h3>
            <p className={styles.cuisine}>{restaurant.cuisine}</p>
          </div>
          <div className={`${styles.badge} ${styles[waitColor]}`}>
            <span className={styles.badgeDot} />
            {waitLabel}
          </div>
        </div>
        <div className={styles.meta}>
          <span className={styles.metaItem}>📍 {restaurant.address}</span>
          {restaurant.distance !== undefined && (
            <span className={styles.metaItem}>📏 {restaurant.distance} km</span>
          )}
        </div>
        <div className={styles.footer}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{restaurant.estimated_wait}</span>
            <span className={styles.statLabel}>min wait</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{restaurant.queue_count}</span>
            <span className={styles.statLabel}>in queue</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>⭐ {restaurant.rating}</span>
            <span className={styles.statLabel}>rating</span>
          </div>
          <button className={`btn btn-primary btn-sm ${styles.joinBtn}`}>Join Queue →</button>
        </div>
      </Link>
    </motion.div>
  );
}
