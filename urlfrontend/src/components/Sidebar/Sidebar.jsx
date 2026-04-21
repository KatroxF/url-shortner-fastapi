import styles from './Sidebar.module.css';

export default function Sidebar({ activePage, onNavigate, showAnalytics }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
        </div>
        <div className={styles.logoText}>
          lnk<span>.</span>ly
        </div>
      </div>

      <nav className={styles.nav}>
        <div
          className={`${styles.navItem} ${activePage === 'home' ? styles.active : ''}`}
          onClick={() => onNavigate('home')}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Home
        </div>

        <div
          className={`${styles.navItem} ${activePage === 'links' ? styles.active : ''}`}
          onClick={() => onNavigate('links')}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
          Links
        </div>

        {showAnalytics && (
          <div
            className={`${styles.navItem} ${activePage === 'analytics' ? styles.active : ''}`}
            onClick={() => onNavigate('analytics')}
          >
            <svg className={styles.navIcon} viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Analytics
          </div>
        )}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.avatar}>RS</div>
        <div>
          <div className={styles.userName}>Rahul Singh</div>
          <div className={styles.userPlan}>Free plan</div>
        </div>
      </div>
    </aside>
  );
}
