import { Link } from "react-router-dom";
import styles from "./Signup.module.css";
import { useState } from "react";
import { API_URL } from "@/config";



function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSignup = async () => {
    if (!username || !email || !password) {
      alert("Enter all fields");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Signup failed.";

        if (Array.isArray(data.detail)) {
          const msg = data.detail[0].msg;

          if (msg.includes("valid email")) {
            errorMessage = "Please enter a valid email address";
          } else if (msg.includes("at least 8 characters")) {
            errorMessage = "Password must be at least 8 characters";
          } else {
            errorMessage = msg;
          }
        } else if (typeof data.detail === "string") {
          // "Email already registered", "Username already taken"
          errorMessage = data.detail;
        }

        setError(errorMessage);
        setSuccess("");
        return;
      }

      // Success: no redirect, the user must verify their email first
      setError("");
      setSuccess(
        `Account created! We sent a verification link to ${email}. Click it before logging in.`
      );
      setRegisteredEmail(email);

      // clear fields
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again later.");
      setSuccess("");
    }
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.wrapper}>
        <div className={styles.logo}>shortly</div>

        <div className={styles.card}>
          <h2>Create your account</h2>

          <p className={styles.subtext}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          {/* Username */}
          <label>Username</label>
          <input
            className={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />

          {/* Email */}
          <label>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />

          {/* Password */}
          <label>Password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <button onClick={handleSignup} className={styles.btn}>
            Create free account
          </button>

          {/* Error */}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <>
              <p className={styles.success} role="status">
                {success}
              </p>
              <p className={styles.terms}>
                Didn't get it?{" "}
                <Link
                  to={`/resend-verification?email=${encodeURIComponent(
                    registeredEmail
                  )}`}
                >
                  Resend email
                </Link>
              </p>
            </>
          )}

          <p className={styles.terms}>
            By creating an account, you agree to Shortly's
            <a href="#"> Terms</a>, <a href="#">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;