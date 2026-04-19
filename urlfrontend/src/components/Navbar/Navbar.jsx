import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import "../style.css";

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.logo}>shortly</h1>

      <div className={styles.navButtons}>
        <Link to="/login" className={styles.login}>
          Log in
        </Link>

        <Link to="/signup" className={styles.signup}>
          Sign up Free
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;