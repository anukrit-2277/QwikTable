'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './RestaurantCard.module.css';

// Map restaurant slugs to Unsplash food images
const RESTAURANT_IMAGES = {
  'tapri-central': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
  'bar-palladio': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
  'rawat-mishthan-bhandar': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop',
  'suvarna-mahal': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
  'lmb-jaipur': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop',
  'handi-restaurant': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop',
  'curious-life-coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
  'niros': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop';

export default function RestaurantCard({ restaurant, index = 0 }) {
  const ratingColor = restaurant.rating >= 4.0 ? '#3AB757' : restaurant.rating >= 3.0 ? '#E9C46A' : '#E76F51';
  const waitLabel = restaurant.estimated_wait <= 10 ? 'Short Wait' : restaurant.estimated_wait <= 25 ? 'Moderate' : 'Busy';
  const waitColor = restaurant.estimated_wait <= 10 ? 'green' : restaurant.estimated_wait <= 25 ? 'amber' : 'red';
  const imgSrc = RESTAURANT_IMAGES[restaurant.slug] || DEFAULT_IMAGE;

  // Estimate avg cost for two
  const avgCost = restaurant.rating >= 4.5 ? '₹2,000' : restaurant.rating >= 4.0 ? '₹1,200' : '₹800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link href={`/restaurant/${restaurant.slug}`} className={styles.card}>
        {/* Image Section */}
        <div className={styles.imageWrap}>
          <img
            src={imgSrc}
            alt={restaurant.name}
            className={styles.image}
            loading="lazy"
          />
          {/* Wait badge on image */}
          <div className={`${styles.waitBadge} ${styles[waitColor]}`}>
            <span className={styles.badgeDot} />
            {waitLabel}
          </div>
          {/* Queue count pill */}
          {restaurant.queue_count > 0 && (
            <div className={styles.queuePill}>
              {restaurant.queue_count} in queue
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{restaurant.name}</h3>
            <span className={styles.ratingBadge} style={{ background: ratingColor }}>
              {restaurant.rating} ★
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.cuisine}>{restaurant.cuisine}</span>
            <span className={styles.cost}>{avgCost} for two</span>
          </div>
          <div className={styles.bottomRow}>
            <span className={styles.address}>{restaurant.address}</span>
            <span className={styles.wait}>{restaurant.estimated_wait} min</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
