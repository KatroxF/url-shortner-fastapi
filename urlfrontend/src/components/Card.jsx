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
      const response = await fetch("http://127.0.0.1:8000/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          long_url: url   
        })
      });

      const data = await response.json();
      setShortUrl(data.short_url); 

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="card">
      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Get your link
      </button>

      {shortUrl && (
        <p>Short URL: {shortUrl}</p>
      )}
    </div>
  );
}

export default Card;