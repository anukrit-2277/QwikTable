'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import RestaurantCard from '@/components/RestaurantCard';
import NearbyMap from '@/components/NearbyMap';
import styles from './page.module.css';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('');
  const [activeTab, setActiveTab] = useState('queue');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async (q = '') => {
    setLoading(true);
    const res = await fetch(`/api/restaurants${q ? `?q=${q}` : ''}`);
    const data = await res.json();
    setRestaurants(data);
    setAllRestaurants(data);
    setLoading(false);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.length > 1 || val.length === 0) {
      fetchRestaurants(val);
    }
    // Scroll to restaurants section when typing in hero search
    if (val.length > 0) {
      setTimeout(() => {
        document.getElementById('restaurant-grid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  const scrollToContent = () => {
    document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToGrid = () => {
    document.getElementById('restaurant-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Filter handlers
  const applyFilter = (filterName) => {
    setActiveFilter(prev => prev === filterName ? '' : filterName);
    const source = allRestaurants;
    let filtered = source;

    if (activeFilter === filterName) {
      // Toggle off
      setRestaurants(source);
      return;
    }

    switch (filterName) {
      case 'short-wait':
        filtered = source.filter(r => r.estimated_wait <= 15);
        break;
      case 'rating':
        filtered = source.filter(r => r.rating >= 4.0);
        break;
      case 'open-now':
        filtered = source; // all are open in demo
        break;
      case 'walk-in':
        filtered = source.filter(r => r.queue_count <= 3);
        break;
      case 'large-groups':
        filtered = source.filter(r => r.total_tables >= 20);
        break;
      case 'pre-order':
        filtered = source; // all support pre-order
        break;
      default:
        filtered = source;
    }
    setRestaurants(filtered);
    setTimeout(scrollToGrid, 200);
  };

  // Collection click handlers
  const handleCollection = (type) => {
    const source = allRestaurants;
    let filtered = source;
    switch (type) {
      case 'shortest':
        filtered = source.filter(r => r.estimated_wait <= 15);
        break;
      case 'premium':
        filtered = source.filter(r => r.rating >= 4.5);
        break;
      case 'pre-order':
        filtered = source; // all support it
        break;
      case 'walk-in':
        filtered = source.filter(r => r.queue_count <= 3);
        break;
    }
    setRestaurants(filtered);
    setActiveFilter('');
    setTimeout(scrollToGrid, 200);
  };

  // Tab handler
  const handleTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'map') {
      setView('map');
    } else {
      setView('grid');
    }
    scrollToGrid();
  };

  return (
    <>
      {/* ===== Full-Screen Video Hero (Zomato-style) ===== */}
      <section className={styles.videoHero}>
        <video
          className={styles.bgVideo}
          autoPlay
          loop
          muted
          playsInline
          poster=""
        >
          <source
            src="https://b.zmtcdn.com/data/file_assets/2627bbed9d6c068e50d2aadcca11ddbb1743095810.mp4"
            type="video/mp4"
          />
        </video>
        <div className={styles.videoOverlay} />

        {/* Navbar on top of video */}
        <nav className={styles.videoNav}>
          <div className={styles.videoNavInner}>
            <span className={styles.videoLogo}>
              <span className={styles.videoLogoIcon}>⚡</span> QwikTable
            </span>
            <div className={styles.videoNavLinks}>
              <a href="/my-queue" className={styles.videoNavLink}>My Queue</a>
              <a href="/dashboard/login" className={styles.videoNavLink}>Restaurant Login</a>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className={styles.videoContent}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className={styles.videoLogo2}>QwikTable</h1>
            <h2 className={styles.videoTitle}>
              Never wait in line<br />
              for a table again
            </h2>
            <p className={styles.videoSub}>
              Join restaurant queues remotely, pre-order your meal,<br />
              and walk in when your table is ready.
            </p>
          </motion.div>

          <motion.div
            className={styles.videoSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className={styles.videoSearchBar}>
              <span className={styles.videoSearchIcon}>🔍</span>
              <input
                id="hero-search"
                type="text"
                className={styles.videoSearchInput}
                placeholder="Search restaurants near you..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </motion.div>

          <motion.button
            className={styles.scrollBtn}
            onClick={scrollToContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Scroll down <span className={styles.scrollArrow}>⌄</span>
          </motion.button>
        </div>
      </section>

      {/* ===== Features Showcase Section ===== */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresInner}>
          <motion.div
            className={styles.featuresHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.featuresTitle}>
              Why diners love<br />QwikTable
            </h2>
            <p className={styles.featuresSub}>
              Packed with smart features that transform<br />
              your dining wait into a breeze
            </p>
          </motion.div>

          <div className={styles.featuresGrid}>
            {/* Left column */}
            <div className={styles.featuresCol}>
              <motion.div className={styles.featureCard} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <span className={styles.featureEmoji}>📱</span>
                <span className={styles.featureLabel}>Remote<br />Queue Join</span>
              </motion.div>
              <motion.div className={styles.featureCard} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <span className={styles.featureEmoji}>⏱️</span>
                <span className={styles.featureLabel}>Live Wait<br />Estimate</span>
              </motion.div>
              <motion.div className={styles.featureCard} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                <span className={styles.featureEmoji}>🍽️</span>
                <span className={styles.featureLabel}>Pre-Order<br />Your Meal</span>
              </motion.div>
              <motion.div className={styles.featureCard} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                <span className={styles.featureEmoji}>👥</span>
                <span className={styles.featureLabel}>Party Size<br />Matching</span>
              </motion.div>
            </div>

            {/* Center phone mockup */}
            <motion.div
              className={styles.phoneMockup}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className={styles.phoneFrame}>
                <div className={styles.phoneNotch} />
                <div className={styles.phoneScreen}>
                  <div className={styles.phoneContent}>
                    <span className={styles.phoneIcon}>⚡</span>
                    <span className={styles.phoneAppName}>QwikTable</span>
                    <div className={styles.phoneQueueCard}>
                      <span className={styles.phoneQueueEmoji}>🍕</span>
                      <div>
                        <strong>{allRestaurants[0]?.name || 'Tapri Central'}</strong>
                        <p>Table in ~{allRestaurants[0]?.estimated_wait || 12} min</p>
                      </div>
                    </div>
                    <div className={styles.phoneTimer}>
                      <span className={styles.phoneTimerNum}>12:45</span>
                      <span className={styles.phoneTimerLabel}>minutes remaining</span>
                    </div>
                    <div className={styles.phoneProgress}>
                      <div className={styles.phoneProgressFill} />
                    </div>
                    <span className={styles.phoneHint}>🔔 We&apos;ll notify you!</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right column */}
            <div className={styles.featuresCol}>
              <motion.div className={styles.featureCard} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <span className={styles.featureEmoji}>🔔</span>
                <span className={styles.featureLabel}>Smart Seat<br />Alerts</span>
              </motion.div>
              <motion.div className={styles.featureCard} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <span className={styles.featureEmoji}>🗺️</span>
                <span className={styles.featureLabel}>Nearby<br />Alternatives</span>
              </motion.div>
              <motion.div className={styles.featureCard} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                <span className={styles.featureEmoji}>📊</span>
                <span className={styles.featureLabel}>Live Queue<br />Ticker</span>
              </motion.div>
              <motion.div className={styles.featureCard} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                <span className={styles.featureEmoji}>🏪</span>
                <span className={styles.featureLabel}>Restaurant<br />Dashboard</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Main Content Below ===== */}
      <Navbar />
      <main className={styles.main} id="content-section">

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span>Home</span> / <span>India</span> / <span className={styles.breadcrumbActive}>Jaipur Restaurants</span>
        </div>

        {/* Category Tabs (Zomato-style) */}
        <div className={styles.categoryTabs}>
          <button className={`${styles.catTab} ${activeTab === 'queue' ? styles.catTabActive : ''}`} onClick={() => handleTab('queue')}>
            <span className={styles.catTabIcon}>🪑</span>
            <span>Join Queue</span>
          </button>
          <button className={`${styles.catTab} ${activeTab === 'preorder' ? styles.catTabActive : ''}`} onClick={() => handleTab('preorder')}>
            <span className={styles.catTabIcon}>🍽️</span>
            <span>Pre-Order</span>
          </button>
          <button className={`${styles.catTab} ${activeTab === 'map' ? styles.catTabActive : ''}`} onClick={() => handleTab('map')}>
            <span className={styles.catTabIcon}>🗺️</span>
            <span>Explore Map</span>
          </button>
        </div>

        {/* Collections Section */}
        <motion.section
          className={styles.collectionsSection}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.collectionsHeader}>
            <div>
              <h2 className={styles.collectionsTitle}>Collections</h2>
              <p className={styles.collectionsSub}>
                Explore curated lists of top restaurants, cafes, and dining spots in Jaipur, based on wait times
              </p>
            </div>
            <button className={styles.collectionsLink} onClick={() => { setRestaurants(allRestaurants); setActiveFilter(''); scrollToGrid(); }}>All collections in Jaipur →</button>
          </div>

          <div className={styles.collectionsGrid}>
            <div className={styles.collectionCard} onClick={() => handleCollection('shortest')}>
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop" alt="Shortest queues" className={styles.collectionImg} />
              <div className={styles.collectionOverlay} />
              <div className={styles.collectionInfo}>
                <h3>Shortest Queues</h3>
                <span>{allRestaurants.filter(r => r.estimated_wait <= 15).length} Places →</span>
              </div>
            </div>
            <div className={styles.collectionCard} onClick={() => handleCollection('premium')}>
              <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop" alt="Premium dining" className={styles.collectionImg} />
              <div className={styles.collectionOverlay} />
              <div className={styles.collectionInfo}>
                <h3>Premium Dining</h3>
                <span>{allRestaurants.filter(r => r.rating >= 4.5).length} Places →</span>
              </div>
            </div>
            <div className={styles.collectionCard} onClick={() => handleCollection('pre-order')}>
              <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop" alt="Pre-order friendly" className={styles.collectionImg} />
              <div className={styles.collectionOverlay} />
              <div className={styles.collectionInfo}>
                <h3>Pre-Order Friendly</h3>
                <span>{allRestaurants.length} Places →</span>
              </div>
            </div>
            <div className={styles.collectionCard} onClick={() => handleCollection('walk-in')}>
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop" alt="Walk-in ready" className={styles.collectionImg} />
              <div className={styles.collectionOverlay} />
              <div className={styles.collectionInfo}>
                <h3>Walk-in Ready</h3>
                <span>{allRestaurants.filter(r => r.queue_count <= 3).length} Places →</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Filter Chips */}
        <div className={styles.filterRow}>
          <button className={styles.filterChip} onClick={() => { setRestaurants(allRestaurants); setActiveFilter(''); }}>
            <span>⚙️</span> Reset
          </button>
          <button className={`${styles.filterChip} ${activeFilter === 'short-wait' ? styles.filterChipActive : ''}`} onClick={() => applyFilter('short-wait')}>Short Wait</button>
          <button className={`${styles.filterChip} ${activeFilter === 'rating' ? styles.filterChipActive : ''}`} onClick={() => applyFilter('rating')}>Rating: 4.0+</button>
          <button className={`${styles.filterChip} ${activeFilter === 'pre-order' ? styles.filterChipActive : ''}`} onClick={() => applyFilter('pre-order')}>Pre-Order Available</button>
          <button className={`${styles.filterChip} ${activeFilter === 'open-now' ? styles.filterChipActive : ''}`} onClick={() => applyFilter('open-now')}>Open Now</button>
          <button className={`${styles.filterChip} ${activeFilter === 'walk-in' ? styles.filterChipActive : ''}`} onClick={() => applyFilter('walk-in')}>Walk-in Friendly</button>
          <button className={`${styles.filterChip} ${activeFilter === 'large-groups' ? styles.filterChipActive : ''}`} onClick={() => applyFilter('large-groups')}>Large Groups</button>
        </div>

        {/* View Toggle + Restaurant Grid */}
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

        {/* Map */}
        {view === 'map' && restaurants.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0 24px', maxWidth: 1200, margin: '0 auto' }}>
            <NearbyMap restaurants={restaurants} />
          </motion.div>
        )}

        {/* Restaurant Cards */}
        <div className={styles.grid} id="restaurant-grid">
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
