import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter all fields");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Login failed.";

        if (Array.isArray(data.detail)) {
          const msg = data.detail[0].msg;

          if (msg.includes("valid email")) {
            errorMessage = "Please enter a valid email address";
          } else {
            errorMessage = msg;
          }
        } else if (typeof data.detail === "string") {
          errorMessage = "Invalid email or password";
        }

        setError(errorMessage);
        return;
      }
      localStorage.setItem("access_token", data.access_token);
      setError("");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again later.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.wrapper}>
        <div className={styles.logo}>shortly</div>

        <div className={styles.card}>
          <h2>Log in to your account</h2>

          <p className={styles.subtext}>
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>

          <label>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <button onClick={handleLogin} className={styles.btn}>
            Log in
          </button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className={styles.googleBtn}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.98v2.33A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.19.29-1.72V4.95H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.05l2.99-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.95l2.99 2.33C4.68 5.16 6.66 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </button>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <p className={`${styles.subtext} ${styles.forgot}`}>
            <a href="#">Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;