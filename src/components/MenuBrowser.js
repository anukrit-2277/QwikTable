'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MenuBrowser.module.css';

export default function MenuBrowser({ menu, onCartChange, disabled = false }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState({});

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(menu.map(i => i.category))];
    return cats;
  }, [menu]);

  const filtered = activeCategory === 'All' ? menu : menu.filter(i => i.category === activeCategory);

  const addToCart = (item) => {
    const newCart = { ...cart, [item.id]: (cart[item.id] || 0) + 1 };
    setCart(newCart);
    notifyCart(newCart);
  };

  const removeFromCart = (item) => {
    const newCart = { ...cart };
    if (newCart[item.id] > 1) {
      newCart[item.id]--;
    } else {
      delete newCart[item.id];
    }
    setCart(newCart);
    notifyCart(newCart);
  };

  const notifyCart = (c) => {
    const items = Object.entries(c).map(([id, qty]) => {
      const item = menu.find(m => m.id === parseInt(id));
      return { id: parseInt(id), name: item.name, price: item.price, quantity: qty };
    });
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    onCartChange?.({ items, total });
  };

  const totalItems = Object.values(cart).reduce((s, v) => s + v, 0);
  const totalPrice = Object.entries(cart).reduce((s, [id, qty]) => {
    const item = menu.find(m => m.id === parseInt(id));
    return s + (item?.price || 0) * qty;
  }, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.catRow}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`${styles.catBtn} ${activeCategory === cat ? styles.catActive : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {filtered.map(item => (
            <motion.div
              key={item.id}
              className={styles.item}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span className={styles.emoji}>{item.image_emoji}</span>
              <div className={styles.itemInfo}>
                <h4 className={styles.itemName}>{item.name}</h4>
                <p className={styles.itemDesc}>{item.description}</p>
                <span className={styles.itemPrice}>₹{item.price}</span>
              </div>
              <div className={styles.itemActions}>
                {cart[item.id] ? (
                  <div className={styles.qtyControls}>
                    <button className={styles.qtyBtn} onClick={() => removeFromCart(item)}>−</button>
                    <span className={styles.qty}>{cart[item.id]}</span>
                    <button className={styles.qtyBtn} onClick={() => addToCart(item)}>+</button>
                  </div>
                ) : (
                  <button className={styles.addBtn} onClick={() => addToCart(item)}>Add</button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {totalItems > 0 && (
        <motion.div
          className={styles.cartBar}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
          <span className={styles.cartTotal}>₹{totalPrice}</span>
          {disabled && <span className={styles.cartNote}>Order confirms when seated</span>}
        </motion.div>
      )}
    </div>
  );
}
