'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import RestaurantCard from '@/components/RestaurantCard';
import NearbyMap from '@/components/NearbyMap';
import styles from './page.module.css';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async (q = '') => {
    setLoading(true);
    const res = await fetch(`/api/restaurants${q ? `?q=${q}` : ''}`);
    const data = await res.json();
    setRestaurants(data);
    setLoading(false);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value.length > 1 || e.target.value.length === 0) {
      fetchRestaurants(e.target.value);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className={styles.heroBadge}>⚡ Smart Queue Management</span>
            <h1 className={styles.heroTitle}>
              Skip the wait.<br />
              <span className={styles.heroAccent}>Dine smarter.</span>
            </h1>
            <p className={styles.heroSub}>
              Join restaurant queues remotely, pre-order your meal, and get notified when your table is ready.
            </p>
          </motion.div>

          <motion.div
            className={styles.searchWrap}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                id="restaurant-search"
                type="text"
                className={styles.searchInput}
                placeholder="Search restaurants, cuisines, or locations..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </motion.div>
        </section>

        {/* Stats Bar */}
        <motion.div
          className={styles.statsBar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.statItem}>
            <span className={styles.statNum}>{restaurants.length}</span>
            <span className={styles.statText}>Restaurants</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{restaurants.reduce((s, r) => s + r.queue_count, 0)}</span>
            <span className={styles.statText}>In Queues</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>
              {restaurants.length > 0 ? Math.round(restaurants.reduce((s, r) => s + r.estimated_wait, 0) / restaurants.length) : 0}m
            </span>
            <span className={styles.statText}>Avg Wait</span>
          </div>
        </motion.div>

        {/* View Toggle */}
        <div className={styles.toolbar}>
          <h2 className={styles.sectionTitle}>Nearby Restaurants</h2>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${view === 'grid' ? styles.viewActive : ''}`}
              onClick={() => setView('grid')}
            >
              Grid
            </button>
            <button
              className={`${styles.viewBtn} ${view === 'map' ? styles.viewActive : ''}`}
              onClick={() => setView('map')}
            >
              Map
            </button>
          </div>
        </div>

        {/* Content */}
        {view === 'map' && restaurants.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <NearbyMap restaurants={restaurants} />
          </motion.div>
        )}

        <div className={styles.grid}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))
          ) : restaurants.length === 0 ? (
            <p className={styles.empty}>No restaurants found. Try a different search.</p>
          ) : (
            restaurants.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} index={i} />
            ))
          )}
        </div>
      </main>
    </>
  );
}
