import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import { useState } from "react";

function Login() {
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

      // ✅ Success
      console.log("Login success", data);
      setError("");

    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again later.");
    }
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

          
          {error && (
            <p style={{ color: "red", marginTop: "10px" }}>
              {error}
            </p>
          )}

          <p className={styles.subtext} style={{ marginTop: "15px" }}>
            <a href="#">Forgot password?</a>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;