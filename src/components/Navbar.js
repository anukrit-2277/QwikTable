'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <motion.nav
      className={styles.nav}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>QwikTable</span>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
            Explore
          </Link>
          <Link href="/my-queue" className={`${styles.link} ${pathname === '/my-queue' ? styles.active : ''}`}>
            My Queue
          </Link>
          <Link href="/dashboard/login" className={`${styles.link} ${isDashboard ? styles.active : ''}`}>
            Restaurant Login
          </Link>
        </div>

        <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>
      </div>
    </motion.nav>
  );
}
