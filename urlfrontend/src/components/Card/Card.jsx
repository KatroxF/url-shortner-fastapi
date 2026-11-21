import { useState } from "react";
import styles from "./Card.module.css";
import { API_URL } from "@/config";


function parseError(data) {
  if (!data || !data.detail) return "Something went wrong";

  if (typeof data.detail === "string") return data.detail;

  if (Array.isArray(data.detail)) {
    const err = data.detail[0];
    const field = err.loc?.[err.loc.length - 1];

    if (field === "original_url") {
      return "Please enter a valid URL (e.g. https://example.com)";
    }
    return err.msg;
  }

  return "Something went wrong";
}

function Card() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

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
    setError("");

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original_url: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(parseError(data));
        setShortUrl("");
        return;
      }

      setShortUrl(data.short_url);
      setCopied(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Could not connect to the server");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <h2 className={styles.cardTitle}>Shorten a long link</h2>
        <p className={styles.cardSubtitle}>No credit card required.</p>

        <input
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(""); 
          }}
        />

        {error && <p className={styles.errorText}>{error}</p>}

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
            <button
              className={styles.copyBtn}
              onClick={handleCopy}
              aria-label="Copy short link"
              title="Copy short link"
            >
              {copied ? "✅" : "📋"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;