import { useState } from "react";
import styles from "./Card.module.css";

function Card() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);

  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);

      
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  
  const handleSubmit = async () => {
    if (!url) {
      alert("Please enter a URL");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_url: url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Something went wrong");
        return;
      }

      setShortUrl(data.short_url);
      setCopied(false); 
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <h2 className={styles.cardTitle}>Shorten a long link</h2>
        <p className={styles.cardSubtitle}>No credit card required.</p>

        <input
          className={styles.input}
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button className={styles.cta} onClick={handleSubmit}>
          Get your link
        </button>

        {shortUrl && (
          <div className={styles.resultBox}>
            <a
              className={styles.resultLink}
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortUrl}
            </a>

            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? "✅" : "📋"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;