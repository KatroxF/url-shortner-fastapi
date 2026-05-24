import { useState, useEffect } from 'react';
import styles from './Links.module.css';

export default function Links({ onViewAnalytics }) {
  const [links, setLinks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('clicks');

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://127.0.0.1:8000/links', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) throw new Error('Failed to fetch links');

        const data = await response.json();
        setLinks(data.map((link) => ({
          id: link.id ?? link.short_url,
          short: link.short_url,
          long: link.original_url,
          created: link.created_at ? new Date(link.created_at).toISOString().slice(0, 10) : '',
          clicks: link.click_count || 0
        })));
      } catch (error) {
        console.error(error);
        setLinks([]);
      }
    };

    fetchLinks();
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
                      onClick={() => onViewAnalytics(link.short)}
                    >
                      {link.short}
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
                      onClick={() => onViewAnalytics(link.short.split('/').pop())} //.pop() takes the LAST item from an array.
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
