import { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Home from '../Home/Home';
import Links from '../Links/Links';
import Analytics from '../Analytics/Analytics';
import Modal from '../Modal/Modal';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('home');
  const [currentLink, setCurrentLink] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [shortUrl, setShortUrl] = useState('');

  const navigateToPage = (page) => {
    setActivePage(page);
  };

  const openAnalytics = (linkId) => {
    setCurrentLink(linkId);
    setActivePage('analytics');
  };

 const handleShorten = async (longUrl, customCode) => {
  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch("http://127.0.0.1:8000/url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        original_url: longUrl,
        custom_code: customCode
      })
    });

    const data = await res.json();

    // backend should return something like: { short_url: "lnk.ly/abc123" }

    setShortUrl(data.short_url);
    setShowModal(true);

  } catch (err) {
    console.error(err);
    alert("Failed to shorten URL");
  }
};

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.app}>
      <Sidebar
        activePage={activePage}
        onNavigate={navigateToPage}
        showAnalytics={currentLink !== null}
      />

      <main className={styles.main}>
        {activePage === 'home' && (
          <Home onShorten={handleShorten} onViewAnalytics={openAnalytics} />
        )}

        {activePage === 'links' && (
          <Links onViewAnalytics={openAnalytics} />
        )}

        {activePage === 'analytics' && (
          <Analytics
            linkId={currentLink}
            onBack={() => navigateToPage('links')}
          />
        )}
      </main>

      <Modal
        show={showModal}
        shortUrl={shortUrl}
        onClose={closeModal}
        onViewAllLinks={() => {
          closeModal();
          navigateToPage('links');
        }}
      />
    </div>
  );
}