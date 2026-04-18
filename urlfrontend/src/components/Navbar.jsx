import React from "react";
import {Link,NavLink} from 'react-router-dom'
function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="logo">shortly</h1>
      <div className="nav-buttons">
        <Link to="/login">
        <button className="login">Log in</button>
        </Link>
        
        <button className="signup">Sign up Free</button>
      </div>
    </nav>
  );
}

export default Navbar;