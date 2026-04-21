import { useState, useEffect } from 'react';
import styles from './Links.module.css';

export default function Links({ onViewAnalytics }) {
  const [links, setLinks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('clicks');

  useEffect(() => {
    // TODO: Replace with your API call to fetch all links
    // Example:
    // fetch('YOUR_API_ENDPOINT/links')
    //   .then(res => res.json())
    //   .then(data => setLinks(data));

    // Placeholder for demonstration
    setLinks([]);
  }, []);

  const getSortedLinks = () => {
    let filtered = links.filter(link =>
      link.short.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.long.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'clicks') {
      filtered.sort((a, b) => b.clicks - a.clicks);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created) - new Date(a.created));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created) - new Date(b.created));
    }

    return filtered;
  };

  const sortedLinks = getSortedLinks();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>All links</div>
        <div className={styles.pageSub}>Browse, search and manage your shortened links.</div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableHeader}>
          <input
            type="text"
            placeholder="Search by alias or original URL…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="clicks">Sort: Most clicks</option>
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
          <div style={{ flex: 1 }}></div>
          <button className={styles.btnGhost} onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>

        <table className={styles.linkTable}>
          <thead>
            <tr>
              <th>Short link</th>
              <th>Original URL</th>
              <th>Created</th>
              <th>Clicks</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedLinks.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.empty}>No links found.</div>
                </td>
              </tr>
            ) : (
              sortedLinks.map((link) => (
                <tr key={link.id}>
                  <td>
                    <span
                      className={styles.shortLink}
                      onClick={() => onViewAnalytics(link.id)}
                    >
                      lnk.ly/{link.short}
                    </span>
                  </td>
                  <td>
                    <span className={styles.longUrl} title={link.long}>
                      {link.long}
                    </span>
                  </td>
                  <td>
                    <span className={styles.dateText}>{link.created}</span>
                  </td>
                  <td>
                    <span className={styles.clickBadge}>{link.clicks.toLocaleString()}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`${styles.btnGhost} ${styles.btnSm}`}
                      onClick={() => onViewAnalytics(link.id)}
                    >
                      Analytics →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
