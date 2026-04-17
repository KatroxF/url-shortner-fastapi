import { useState } from "react";

function Card() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleSubmit = async () => {
    if (!url) {
      alert("Please enter a URL");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          original_url: url   
        })
      });

      const data = await response.json();
      if (!response.ok) {
  alert(data.detail || "Something went wrong");
  return;
}
      setShortUrl(data.short_url); 

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
  <div className="card">

    <div className="card-content">
      <h2>Shorten a long link</h2>
      <p>No credit card required.</p>

      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button className="cta" onClick={handleSubmit}>
        Get your link
      </button>

      {shortUrl && (
        <a href={shortUrl} target="_blank" rel="noopener noreferrer">
  {shortUrl}
</a>
      )}
    </div>

  </div>
);
}

export default Card;