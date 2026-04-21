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

  const handleShorten = (longUrl, customCode) => {
    const code = customCode || Math.random().toString(36).substring(2, 7);
    setShortUrl(`lnk.ly/${code}`);
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