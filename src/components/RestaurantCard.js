'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './RestaurantCard.module.css';

// Map restaurant slugs to cuisine-specific food images
const RESTAURANT_IMAGES = {
  'tapri-central': 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=600&h=400&fit=crop',       // masala chai cups
  'bar-palladio': 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&h=400&fit=crop',           // elegant restaurant interior
  'rawat-mishthan-bhandar': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=400&fit=crop', // Indian mithai/sweets
  'suvarna-mahal': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',      // royal dining hall
  'lmb-jaipur': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop',         // Indian thali
  'handi-restaurant': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop',   // biryani/mughlai
  'curious-life-coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop', // latte art
  'niros': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',               // food spread
  'chokhi-dhani': 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&h=400&fit=crop',        // Rajasthani village food
  'spice-court': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop',         // Indian spice dishes
  'anokhi-cafe': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',         // healthy organic salad
  'peacock-rooftop': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',     // rooftop dining
  'replay-diner': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop',           // burger and fries
  'samode-haveli': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop',       // heritage dining
  'tattoo-cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',            // trendy cafe
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop';

export default function RestaurantCard({ restaurant, index = 0 }) {
  const ratingColor = restaurant.rating >= 4.0 ? '#3AB757' : restaurant.rating >= 3.0 ? '#E9C46A' : '#E76F51';
  const waitLabel = restaurant.estimated_wait <= 10 ? 'Short Wait' : restaurant.estimated_wait <= 25 ? 'Moderate' : 'Busy';
  const waitColor = restaurant.estimated_wait <= 10 ? 'green' : restaurant.estimated_wait <= 25 ? 'amber' : 'red';
  const imgSrc = RESTAURANT_IMAGES[restaurant.slug] || DEFAULT_IMAGE;

  // Realistic avg cost for two based on restaurant type
  const COST_MAP = {
    'tapri-central': '₹300',
    'bar-palladio': '₹2,500',
    'rawat-mishthan-bhandar': '₹200',
    'suvarna-mahal': '₹4,000',
    'lmb-jaipur': '₹600',
    'handi-restaurant': '₹800',
    'curious-life-coffee': '₹500',
    'niros': '₹1,200',
    'chokhi-dhani': '₹1,000',
    'spice-court': '₹700',
    'anokhi-cafe': '₹600',
    'peacock-rooftop': '₹500',
    'replay-diner': '₹450',
    'samode-haveli': '₹3,500',
    'tattoo-cafe': '₹400',
  };
  const avgCost = COST_MAP[restaurant.slug] || '₹800';

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
            onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
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
            <span className={styles.wait}>
              {restaurant.estimated_wait === 0 ? '✓ No wait' : `⏱ ~${restaurant.estimated_wait} min queue`}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
