'use client';
import { useState, useEffect, use, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CountdownTimer from '@/components/CountdownTimer';
import ProgressBar from '@/components/ProgressBar';
import MenuBrowser from '@/components/MenuBrowser';
import SeatAlert from '@/components/SeatAlert';
import styles from './page.module.css';

// Play a notification beep using Web Audio API
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
    // Second beep
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.8);
    }, 300);
  } catch {}
}

export default function QueueStatusPage({ params }) {
  const { id } = use(params);
  const [entry, setEntry] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [orderSaved, setOrderSaved] = useState(false);
  const [tab, setTab] = useState('status');
  const prevStatusRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/queue/${id}`);
      const data = await res.json();
      if (res.ok) {
        // Play sound when status transitions to 'notified'
        if (data.status === 'notified' && prevStatusRef.current === 'waiting') {
          playNotificationSound();
          // Also try browser Notification API
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 QwikTable', {
              body: `Your table at ${data.restaurant_name} is almost ready! Head over now.`,
              icon: '⚡',
            });
          }
        }
        prevStatusRef.current = data.status;
        setEntry(data);
        // Fetch menu for this restaurant
        if (menu.length === 0) {
          const mRes = await fetch(`/api/restaurants/${data.restaurant_slug}`);
          const mData = await mRes.json();
          setMenu(mData.menu || []);
        }
      }
    } catch {}
    setLoading(false);
  }, [id, menu.length]);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handlePreOrder = async () => {
    if (!cart || cart.items.length === 0) return;
    await fetch(`/api/queue/${id}/pre-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart.items, totalAmount: cart.total }),
    });
    setOrderSaved(true);
    setTimeout(() => setOrderSaved(false), 3000);
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to leave the queue?')) return;
    await fetch(`/api/queue/${id}`, { method: 'DELETE' });
    fetchStatus();
  };

  if (loading) return (
    <><Navbar /><div className={styles.loading}>Loading your queue status...</div></>
  );

  if (!entry) return (
    <><Navbar /><div className={styles.loading}>Queue entry not found</div></>
  );

  const isCancelled = entry.status === 'cancelled';
  const isSeated = entry.status === 'seated';
  const isNotified = entry.status === 'notified';

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <SeatAlert status={entry.status} restaurantName={entry.restaurant_name} />

        {(isCancelled || isSeated) ? (
          <motion.div className={styles.doneCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <span className={styles.doneEmoji}>{isSeated ? '🎉' : '👋'}</span>
            <h2>{isSeated ? 'You\'re seated!' : 'Queue cancelled'}</h2>
            <p>{isSeated ? 'Enjoy your meal. Your pre-order is being prepared.' : 'You\'ve left the queue.'}</p>
            <Link href="/" className="btn btn-primary">Back to Home</Link>
          </motion.div>
        ) : (
          <>
            {/* Status Header */}
            <motion.div className={styles.statusCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className={styles.statusHeader}>
                <div>
                  <span className={styles.restaurantName}>📍 {entry.restaurant_name}</span>
                  <h1 className={styles.statusTitle}>
                    {isNotified ? 'Your table is almost ready!' : 'You\'re in the queue'}
                  </h1>
                </div>
                <div className={`${styles.statusBadge} ${isNotified ? styles.badgeNotified : styles.badgeWaiting}`}>
                  <span className={styles.statusDot} />
                  {isNotified ? 'Table Ready Soon' : 'Waiting'}
                </div>
              </div>

              <div className={styles.timerArea}>
                <CountdownTimer minutes={entry.current_wait} label="Estimated Wait" />
              </div>

              <div className={styles.statsRow}>
                <div className={styles.miniStat}>
                  <span className={styles.miniValue}>{entry.groups_ahead}</span>
                  <span className={styles.miniLabel}>Groups Ahead</span>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniValue}>#{entry.position}</span>
                  <span className={styles.miniLabel}>Your Position</span>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniValue}>{entry.party_size}</span>
                  <span className={styles.miniLabel}>Party Size</span>
                </div>
              </div>

              <ProgressBar
                value={entry.position - entry.groups_ahead}
                max={entry.position}
                label="Queue Progress"
              />

              {isNotified && (
                <div className={styles.notifyBanner}>
                  🏃 Head to <strong>{entry.restaurant_name}</strong> now — your table will be ready in ~5 minutes!
                </div>
              )}

              {!isNotified && (
                <div className={styles.relaxSection}>
                  <p className={styles.relaxMsg}>
                    💚 You can relax nearby. We&apos;ll alert you with <strong>sound + notification</strong> when your table is ~5 min away.
                  </p>
                  <div className={styles.bookmarkTip}>
                    💡 <strong>Tip:</strong> Bookmark this page or save the URL — you can check your queue status anytime at <strong>/my-queue</strong> using your phone number.
                  </div>
                </div>
              )}
            </motion.div>

            {/* Tab Bar */}
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${tab === 'status' ? styles.tabActive : ''}`} onClick={() => setTab('status')}>
                📊 Status
              </button>
              <button className={`${styles.tab} ${tab === 'menu' ? styles.tabActive : ''}`} onClick={() => setTab('menu')}>
                🍽️ Pre-Order
              </button>
            </div>

            {tab === 'menu' && (
              <motion.div className={styles.menuSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className={styles.sectionTitle}>Pre-Order Your Meal</h2>
                <p className={styles.sectionSub}>Browse the menu and add items. Your order will be confirmed when you&apos;re seated.</p>
                <MenuBrowser menu={menu} onCartChange={setCart} disabled />
                {cart && cart.items.length > 0 && (
                  <motion.button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={handlePreOrder}
                    whileTap={{ scale: 0.98 }}
                  >
                    {orderSaved ? '✓ Order Saved!' : `Save Pre-Order · ₹${cart.total}`}
                  </motion.button>
                )}
              </motion.div>
            )}

            {tab === 'status' && entry.pre_order && (
              <motion.div className={styles.preOrderCard} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3>📦 Your Pre-Order</h3>
                <div className={styles.orderItems}>
                  {entry.pre_order.items.map((item, i) => (
                    <div key={i} className={styles.orderItem}>
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.orderTotal}>
                  Total: ₹{entry.pre_order.total_amount}
                </div>
              </motion.div>
            )}

            <button className={styles.cancelBtn} onClick={handleCancel}>Leave Queue</button>
          </>
        )}
      </main>
    </>
  );
}
