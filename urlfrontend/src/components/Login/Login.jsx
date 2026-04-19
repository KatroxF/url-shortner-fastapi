import { Link } from "react-router-dom";
import styles from "./Login.module.css";

function Login() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.wrapper}>

        {/* Logo */}
        <div className={styles.logo}>shortly</div>

        {/* Card */}
        <div className={styles.card}>
          <h2>Log in to your account</h2>

          <p className={styles.subtext}>
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>

          <label>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Enter your password"
          />

          <button className={styles.btn}>Log in</button>

          <p className={styles.subtext} style={{ marginTop: "15px" }}>
            <a href="#">Forgot password?</a>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;