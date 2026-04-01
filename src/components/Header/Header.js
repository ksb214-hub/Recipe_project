// src/components/Header/Header.js
import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <nav className="nav">
        
        {/* 내부 컨테이너 */}
        <div className="inner">

          {/* 왼쪽: 로고 */}
          <div className="logo">
            <h1>
              <Link to="/" className="logo_link">
                zero-naeng-fe
              </Link>
            </h1>
          </div>

          {/* 오른쪽: 메뉴 */}
          <div className="menu">
            <Link to="/login" className="nav_btn">
              로그인
            </Link>

            <Link to="/search" className="nav_btn">
              검색
            </Link>
          </div>

        </div>
      </nav>
    </header>
  );
}

export default Header;