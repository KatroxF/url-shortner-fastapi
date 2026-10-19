import { Link } from "react-router-dom";
import styles from "../Login/Login.module.css";
import { useState } from "react";
import { API_URL } from "@/config";


function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("Enter your email");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          setError("Please enter a valid email address");
        } else {
          setError(data.detail || "Something went wrong.");
        }
        return;
      }

      // Same message whether or not the email exists
      setMessage(data.message);
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.wrapper}>
        <div className={styles.logo}>shortly</div>

        <div className={styles.card}>
          <h2>Forgot your password?</h2>

          <p className={styles.subtext}>
            Enter your email and we'll send you a link to reset it.
          </p>

          <label>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />

          <button
            onClick={handleSubmit}
            className={styles.btn}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {message && (
            <p role="status" style={{ color: "#059669", marginTop: 12 }}>
              {message}
            </p>
          )}

          <p className={styles.subtext}>
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;