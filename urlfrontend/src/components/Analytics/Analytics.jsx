import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!linkId) return;

    // TODO: Replace with your API call to fetch link analytics
    // Example:
    // fetch(`YOUR_API_ENDPOINT/analytics/${linkId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setLinkInfo(data.linkInfo);
    //     setStats(data.stats);
    //     setClickData(data.clickData);
    //     setDeviceData(data.deviceData);
    //     setLocationData(data.locationData);
    //     setDateFrom(data.dateRange.from);
    //     setDateTo(data.dateRange.to);
    //   });

    // Placeholder for demonstration
    setLinkInfo({ short: 'example', long: 'https://example.com' });
    setStats({ totalClicks: 0, uniqueVisitors: 0, peakDay: '—' });
    setClickData({ labels: [], days: [] });
    setDeviceData({ Desktop: 0, Android: 0, iPhone: 0, Unknown: 0 });
    setLocationData([]);
    setDateFrom('2025-03-22');
    setDateTo('2025-04-20');
  }, [linkId]);

  const handleDateChange = () => {
    // TODO: Fetch updated data based on new date range
    // fetch(`YOUR_API_ENDPOINT/analytics/${linkId}?from=${dateFrom}&to=${dateTo}`)
    //   .then(res => res.json())
    //   .then(data => { ... });
  };

  const resetDates = () => {
    setDateFrom('2025-03-22');
    setDateTo('2025-04-20');
    handleDateChange();
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

  const totalDevices = Object.values(deviceData).reduce((sum, val) => sum + val, 0);
  const doughnutData = {
    labels: Object.keys(deviceData).map(
      key => `${key} ${totalDevices > 0 ? Math.round(deviceData[key] / totalDevices * 100) : 0}%`
    ),
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
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <label>to</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <button className={styles.btnGhost} onClick={resetDates}>Reset</button>
        </div>
      </div>

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
