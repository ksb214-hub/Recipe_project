// src/components/Navbar.js
import { useState } from "react";

function Navbar() {
  return (
    <nav style={styles.nav}>
      <a href="/" style={styles.logo}>
        zero-naeng-fe
      </a>
    </nav>
  );
}

const styles = {
  nav: {
    width: "100%",
    height: "0px",
    display: "flex",
    alignItems: "center",
    padding: "20px",
  },
  logo: {
    textDecoration: "none",
    fontSize: "20px",
    fontWeight: "bold",
    color: "black",
  },
};

export default Navbar;