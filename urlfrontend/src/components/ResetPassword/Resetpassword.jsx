import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "../Login/Login.module.css";
import { useState } from "react";
import { API_URL } from "@/config";


function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirm) {
      setError("Enter all fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          const msg = data.detail[0].msg;
          setError(
            msg.includes("at least 8")
              ? "Password must be at least 8 characters"
              : msg
          );
        } else {
          setError(data.detail || "Something went wrong.");
        }
        return;
      }

      setMessage("Password updated! Redirecting to login...");
      setPassword("");
      setConfirm("");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Opened without a token (e.g. typed the URL by hand)
  if (!token) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.wrapper}>
          <div className={styles.logo}>shortly</div>
          <div className={styles.card}>
            <h2>Invalid reset link</h2>
            <p className={styles.subtext}>
              This link is missing or broken. Please request a new one.
            </p>
            <p className={styles.subtext}>
              <Link to="/forgot-password">Request a new link</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.wrapper}>
        <div className={styles.logo}>shortly</div>

        <div className={styles.card}>
          <h2>Set a new password</h2>

          <p className={styles.subtext}>
            Choose a password with at least 8 characters.
          </p>

          <label>New password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />

          <label>Confirm password</label>
          <input
            className={styles.input}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
          />

          <button
            onClick={handleReset}
            className={styles.btn}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update password"}
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

          {error && error.includes("expired") && (
            <p className={styles.subtext}>
              <Link to="/forgot-password">Request a new link</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;