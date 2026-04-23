import { useState, useEffect } from 'react';
import styles from './Home.module.css';

export default function Home({ onShorten, onViewAnalytics }) {
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    topLink: 'â€”'
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://127.0.0.1:8000/urls', {
          headers: token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {}
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const urls = await response.json();
        
let topLink = null;
if (urls.length > 0) {
  topLink = urls[0]; 

  for (let i = 1; i < urls.length; i++) {
    if (urls[i].click_count > topLink.click_count) {
      topLink = urls[i];
    }
  }
}       
let totalClicks=0;
for(const url in urls){
  totalClicks+=url.click_count||0;
}
        setStats({
          totalLinks: urls.length,
          totalClicks: totalClicks,
          topLink: topLink?.short_code || 'â€”'
        });
      } catch {
        setStats({
          totalLinks: 0,
          totalClicks: 0,
          topLink: 'â€”'
        });
      }
    };

    fetchDashboardStats();

    // TODO: Replace with your API call to fetch recent activity
    // fetch('YOUR_API_ENDPOINT/recent')
    //   .then(res => res.json())
    //   .then(data => setRecentActivity(data));

    setRecentActivity([]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();  //keeps react app running no referesh

    if (!longUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    onShorten(longUrl, customCode);
    setLongUrl('');
    setCustomCode('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>Shorten a link</div>
        <div className={styles.pageSub}>Turn long URLs into sharp, trackable short links.</div>
      </div>

      <div className={styles.shortenWrap}>
        <form onSubmit={handleSubmit}>
          <div className={styles.shortenRow}>
            <div className={styles.inputGroup}>
              <label>Long URL</label>
              <input
                type="text"
                placeholder="https://your-very-long-url.com/goes/here"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
              />
            </div>
            <div className={`${styles.inputGroup} ${styles.customGroup}`}>
              <label>Custom alias (optional)</label>
              <input
                type="text"
                placeholder="my-link"
                maxLength={20}
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.btnPrimary}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
              Shorten
            </button>
          </div>
        </form>
        <div className={styles.shortenHint}>
          Leave alias blank for an auto-generated code. Your link will be live instantly.
        </div>
      </div>

      <div className={styles.metricGrid}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Total links</div>
          <div className={styles.metricValue}>{stats.totalLinks}</div>
          <div className={styles.metricChange}>+3 this week</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Total clicks</div>
          <div className={styles.metricValue}>{stats.totalClicks}</div>
          <div className={styles.metricChange}>+12% vs last month</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Top link</div>
          <div className={`${styles.metricValue} ${styles.metricMono}`}>{stats.topLink}</div>
          <div className={`${styles.metricChange} ${styles.neutral}`}>Most clicked</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Recent activity</div>
        <div className={styles.cardSub}>Your last 5 shortened links</div>
        <div className={styles.activityList}>
          {recentActivity.length === 0 ? (
            <div className={styles.empty}>No recent activity yet. Create your first short link!</div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityRow}>
                <div className={styles.activityDot}></div>
                <span
                  className={styles.activityShort}
                  onClick={() => onViewAnalytics(activity.id)}
                >
                  lnk.ly/{activity.short}
                </span>
                <span className={styles.activityLong} title={activity.long}>
                  {activity.long}
                </span>
                <span className={styles.activityMeta}>
                  {activity.clicks} clicks Â· {activity.created}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
