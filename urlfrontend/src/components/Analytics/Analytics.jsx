import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import styles from './Analytics.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics({ linkId, onBack }) {
  const [linkInfo, setLinkInfo] = useState({ short: '—', long: '' });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueVisitors: 0,
    peakDay: '—'
  });
  const [clickData, setClickData] = useState({ labels: [], days: [] });
  const [deviceData, setDeviceData] = useState({});
  const [locationData, setLocationData] = useState([]);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const aiFetchedRef = useRef('');

  const updateAnalyticsState = (data, selectedFrom = dateFrom, selectedTo = dateTo) => {
    const shortUrl = data.linkInfo?.short_url || '';
    const short = shortUrl.split('/').pop() || linkId;
    const devices = {};

    for (const item of data.deviceStats || []) {
      devices[item.name] = item.value;
    }

    setLinkInfo({
      short,
      long: data.linkInfo?.original_url || ''
    });
    setStats({
      totalClicks: data.stats?.total_clicks || 0,
      uniqueVisitors: data.stats?.unique_visitors || 0,
      peakDay: data.stats?.peak_day || '-'
    });
    setClickData({
      labels: data.labels || data.clicks_data?.labels || [],
      days: data.clicks || data.clicks_data?.clicks || []
    });
    setDeviceData(devices);
    setLocationData((data.locationStats || []).map((item) => {
      const [country, state = ''] = (item.location || 'Unknown').split(' - ');
      return {
        flag: '',
        country,
        state,
        clicks: item.total_clicks_location || 0
      };
    }));
    setDateFrom(data.dateRange?.from || selectedFrom);
    setDateTo(data.dateRange?.to || selectedTo);
  };

  // Fetch main analytics
  useEffect(() => {
    if (!linkId) return;

    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://127.0.0.1:8000/analytics/${linkId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) throw new Error('Failed to fetch link analytics');

        const data = await response.json();
        updateAnalyticsState(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAnalytics();
  }, [linkId]);

  // Fetch AI summary once on load
  useEffect(() => {
    if (!linkId || aiFetchedRef.current === linkId) return;
    aiFetchedRef.current = linkId;
    fetchAiSummary();
  }, [linkId]);

  const fetchAiSummary = async () => {
    setAiLoading(true);
    setAiError('');
    setAiSummary('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/summary/${linkId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      setAiSummary(data.ai_summary || '');
    } catch (err) {
      setAiError('Could not load AI summary. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDateChange = async (from = dateFrom, to = dateTo) => {
    if (!linkId) return;

    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();

      if (from) params.set('start_date', `${from}T00:00:00`);
      if (to) params.set('end_date', `${to}T23:59:59`);

      const query = params.toString();
      const response = await fetch(
        `http://127.0.0.1:8000/analytics/${linkId}${query ? `?${query}` : ''}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (!response.ok) throw new Error('Failed to fetch link analytics');

      const data = await response.json();
      updateAnalyticsState(data, from, to);
    } catch (error) {
      console.error(error);
    }
  };

  const resetDates = () => {
    const defaultFrom = '2025-03-22';
    const defaultTo = '2025-04-20';

    setDateFrom(defaultFrom);
    setDateTo(defaultTo);
    handleDateChange(defaultFrom, defaultTo);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1e2a',
        borderColor: 'rgba(255,255,255,.1)',
        borderWidth: 1,
        titleColor: '#e8eaf2',
        bodyColor: '#8b90a8',
        padding: 10
      }
    },
    scales: {
      x: {
        ticks: { color: '#555a72', font: { size: 10 }, maxRotation: 45 },
        grid: { display: false },
        border: { color: 'rgba(255,255,255,.05)' }
      },
      y: {
        ticks: { color: '#555a72', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,.04)' },
        border: { display: false },
        beginAtZero: true
      }
    }
  };

  const barData = {
    labels: clickData.labels,
    datasets: [{
      label: 'Clicks',
      data: clickData.days,
      backgroundColor: '#5b7eff',
      borderRadius: 4,
      borderSkipped: false
    }]
  };

  let totalDevices = 0;
  for (let value of Object.values(deviceData)) {
    totalDevices += value;
  }

  const labels = [];
  for (let key of Object.keys(deviceData)) {
    const count = deviceData[key];
    const percentage = totalDevices > 0
      ? Math.round((count / totalDevices) * 100)
      : 0;
    labels.push(`${key} ${percentage}%`);
  }

  const doughnutData = {
    labels: labels,
    datasets: [{
      data: Object.values(deviceData),
      backgroundColor: ['#5b7eff', '#22c89a', '#ff5c7a', '#555a72'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: { color: '#8b90a8', font: { size: 12 }, boxWidth: 10, padding: 14 }
      },
      tooltip: {
        backgroundColor: '#1a1e2a',
        borderColor: 'rgba(255,255,255,.1)',
        borderWidth: 1,
        titleColor: '#e8eaf2',
        bodyColor: '#8b90a8'
      }
    }
  };

  const totalLocations = locationData.reduce((sum, loc) => sum + loc.clicks, 0);

  return (
    <div className={styles.page}>
      <div className={styles.backBtn} onClick={onBack}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to links
      </div>

      <div className={styles.analyticsTop}>
        <div>
          <div className={styles.linkInfoShort}>lnk.ly/{linkInfo.short}</div>
          <div className={styles.linkInfoLong}>{linkInfo.long}</div>
        </div>
        <div className={styles.dateFilter}>
          <label>From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              const nextFrom = e.target.value;
              setDateFrom(nextFrom);
              handleDateChange(nextFrom, dateTo);
            }}
          />
          <label>to</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              const nextTo = e.target.value;
              setDateTo(nextTo);
              handleDateChange(dateFrom, nextTo);
            }}
          />
          <button className={styles.btnGhost} onClick={resetDates}>Reset</button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className={styles.metricGrid}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Total clicks</div>
          <div className={styles.metricValue}>{stats.totalClicks}</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Unique visitors</div>
          <div className={styles.metricValue}>{stats.uniqueVisitors}</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Peak day</div>
          <div className={`${styles.metricValue} ${styles.metricSmall}`}>{stats.peakDay}</div>
        </div>
      </div>

      {/* ── AI SUMMARY CARD ── */}
      <div className={styles.aiCard}>
        <div className={styles.aiHeader}>
          <div className={styles.aiIconWrap} aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5Z"/>
            </svg>
          </div>
          <div>
            <div className={styles.aiTitle}>AI Summary</div>
            <div className={styles.aiSubtitle}>Insights generated from your link analytics</div>
          </div>
          <button
            className={styles.aiRefreshBtn}
            onClick={fetchAiSummary}
            disabled={aiLoading}
            aria-label="Refresh AI summary"
          >
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              style={{ animation: aiLoading ? 'aiSpin 1s linear infinite' : 'none' }}
            >
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            {aiLoading ? 'Generating…' : 'Refresh'}
          </button>
        </div>

        <div className={styles.aiBody}>
          {aiLoading && (
            <div className={styles.aiSkeleton}>
              <div className={styles.skeletonLine} style={{ width: '92%' }} />
              <div className={styles.skeletonLine} style={{ width: '78%' }} />
              <div className={styles.skeletonLine} style={{ width: '85%' }} />
              <div className={styles.skeletonLine} style={{ width: '55%' }} />
            </div>
          )}
          {!aiLoading && aiError && (
            <div className={styles.aiError}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {aiError}
              <button className={styles.aiRetryBtn} onClick={fetchAiSummary}>Retry</button>
            </div>
          )}
          {!aiLoading && !aiError && aiSummary && (
            <p className={styles.aiText}>{aiSummary}</p>
          )}
          {!aiLoading && !aiError && !aiSummary && (
            <p className={styles.aiEmpty}>No summary available yet.</p>
          )}
        </div>
      </div>
      {/* ── END AI SUMMARY CARD ── */}

      {/* Clicks Over Time */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Clicks over time</div>
        <div className={styles.cardSub}>Daily click volume for the selected date range</div>
        <div className={styles.chartWrap}>
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Devices & Platforms</div>
          <div className={styles.cardSub}>Visitors by device and OS</div>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#5b7eff' }}></span>Desktop
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#22c89a' }}></span>Android
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#ff5c7a' }}></span>iPhone
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#555a72' }}></span>Unknown
            </div>
          </div>
          <div className={styles.chartWrap} style={{ height: '200px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Locations</div>
          <div className={styles.cardSub}>Visitors by country & state/region</div>
          <table className={styles.locTable}>
            <thead>
              <tr>
                <th>Location</th>
                <th>Clicks</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {locationData.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className={styles.empty}>No location data available</div>
                  </td>
                </tr>
              ) : (
                locationData.map((loc, idx) => {
                  const pct = totalLocations > 0 ? Math.round(loc.clicks / totalLocations * 100) : 0;
                  return (
                    <tr key={idx}>
                      <td>
                        <span className={styles.locFlag}>{loc.flag}</span>
                        {loc.country}{loc.state && loc.state !== '—' ? `, ${loc.state}` : ''}
                      </td>
                      <td>{loc.clicks.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className={styles.locBarWrap}>
                            <div className={styles.locBar} style={{ width: `${pct}%` }}></div>
                          </div>
                          <span style={{ fontSize: '11px', color: '#555a72' }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
