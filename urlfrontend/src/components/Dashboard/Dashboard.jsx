import { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Home from '../Home/Home';
import Links from '../Links/Links';
import Analytics from '../Analytics/Analytics';
import Modal from '../Modal/Modal';
import styles from './Dashboard.module.css';
import { parseError } from "@/utils/parseError";
import { API_URL } from "@/config";

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
  const token = localStorage.getItem("access_token");

  let res;
  try {
    res = await fetch(`${API_URL}/url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        original_url: longUrl,
        custom_code: customCode || null,
      }),
    });
  } catch {
    throw new Error("Could not connect to the server");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(parseError(data)); // Home catches this and shows it
  }

  setShortUrl(data.short_url);
  setShowModal(true);
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